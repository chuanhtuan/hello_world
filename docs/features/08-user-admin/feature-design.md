# Feature Design — Quản trị người dùng (Danh sách, Mời user mới, Xem hồ sơ người khác, Xoá user)

> Nguồn: `docs/product/raw-business-requirements.md` mục 8.
> Trạng thái: Đã triển khai. **Rủi ro đã biết:** xoá user là hard delete,
> không có soft-delete/undo.
> Tài liệu này sinh **retroactive** từ code đã có
> (`frontend/src/pages/UserList.tsx`, `frontend/src/pages/UserDetail.tsx`,
> `frontend/src/components/PrivateRoute.tsx` — `AdminRoute`,
> `backend/src/controllers/user.controller.ts` — `listUsers`,
> `createUser`, `getUserById`, `deleteUser`) — dùng để review/onboarding,
> và làm nền khi cần sửa/mở rộng feature.

## 1. Business intent

Admin cần công cụ quản lý toàn bộ user trong hệ thống: theo dõi ai đã
kích hoạt tài khoản, chủ động mời người dùng mới bằng tay (không phải ai
cũng tự signup được, VD nhân sự nội bộ), và gỡ bỏ tài khoản khi cần (rời
công ty, tài khoản spam...) — tất cả mà không cần thao tác trực tiếp vào
database.

**Đối tượng dùng:** Chỉ role `ADMIN`.

## 2. Phạm vi (Scope)

Feature này bao gồm 4 khả năng: danh sách user, mời user mới, xem hồ sơ
user bất kỳ, xoá user. Đây là 4 mục nhỏ trong cùng 1 feature-design vì
đều nằm trong 1 khu vực chức năng (quản trị user) và dùng chung phân
quyền `AdminRoute`.

**Ngoài phạm vi:**

- Luồng activation mà user được mời phải đi qua → dùng lại **nguyên
  vẹn** feature-design mục 2 (Activate Account), **không có** luồng
  activation riêng cho admin-invite.
- User tự xem/sửa hồ sơ **của chính mình** → feature-design mục 7
  (Profile) — 2 luồng dùng chung 1 số API (`GET /users/:id`) nhưng khác
  quyền truy cập, xem AC6 bên dưới.

## 3. Logic flow

### 3.1. Danh sách user

1. Admin vào `/users` (chặn bởi `AdminRoute`: user thường bị điều hướng
   về `/profile`, user chưa đăng nhập bị điều hướng về `/login`).
2. Frontend gọi `GET /api/users` (mặc định `page=1`, `pageSize=20`).
3. Backend trả danh sách user (sắp xếp theo `createdAt DESC`), kèm
   `total`, `page`, `pageSize`.
4. Frontend hiển thị bảng: Name (link sang UserDetail), Email, Role,
   Status (badge), Provider, nút Delete trên mỗi dòng.

### 3.2. Mời user mới

1. Admin bấm "New user" để mở form inline (Name, Email, Role — mặc định
   `USER`).
2. Admin nhập, bấm "Send invite".
3. Frontend gọi `POST /api/users` với `{ name, email, role }`.
4. Backend kiểm tra email đã tồn tại chưa:
   - **Đã tồn tại** (bất kể status nào) → lỗi 409 "A user with this
     email already exists" — **khác** hành vi self-signup (mục 1, vốn tự
     resend link nếu email đang PENDING) — ở đây admin-invite **không**
     tự resend, chỉ báo lỗi.
   - **Chưa tồn tại** → tạo user `PENDING`, gửi activation email — dùng
     lại đúng hàm `createPendingUserAndSendActivation` như self-signup
     (feature-design mục 1), nên toàn bộ hành vi token/expiry giống hệt.
5. Thành công → user mới xuất hiện đầu danh sách (không cần load lại
   trang), hiển thị message xác nhận đã mời, form được reset.

### 3.3. Xem hồ sơ người khác

1. Admin bấm vào tên user trong danh sách → vào `/users/:id`.
2. Frontend gọi `GET /api/users/:id`.
3. Backend kiểm tra quyền: nếu người gọi **không phải ADMIN** và không
   phải xem hồ sơ của chính mình → lỗi 403 "Forbidden: insufficient
   permissions" (áp dụng chung cho mọi user, không riêng gì admin —
   endpoint này cũng được Profile của user thường dùng gián tiếp, nhưng
   UI hiện tại chỉ điều hướng user thường tới trang này qua link trong
   UserList, vốn chỉ admin thấy được).
4. Hợp lệ → trả về hồ sơ đầy đủ: tên, email, role, status, provider,
   avatar, ngày tham gia (`createdAt`).

### 3.4. Xoá user

1. Admin bấm "Delete" trên 1 dòng trong danh sách.
2. Frontend hiện confirm dialog trình duyệt ("Delete this user? This
   cannot be undone.") — huỷ thì dừng, không gọi API.
3. Xác nhận → frontend gọi `DELETE /api/users/:id`.
4. Backend kiểm tra:
   - **Admin tự xoá chính mình** (`id` trùng với user đang đăng nhập) →
     lỗi 400 "Admins cannot delete their own account through this
     endpoint" — chặn admin tự khoá quyền truy cập của chính họ.
   - **User không tồn tại** → lỗi 404.
   - **Hợp lệ** → xoá cứng (hard delete) bản ghi user khỏi DB.
5. Thành công → frontend xoá dòng đó khỏi bảng ngay (không cần load lại
   toàn bộ danh sách).

## 4. Acceptance Criteria

- **AC1 — Chỉ ADMIN truy cập được `/users`:**
  Given user role `USER` (hoặc chưa đăng nhập),
  When cố truy cập `/users` hoặc `/users/:id` của người khác,
  Then bị điều hướng đi nơi khác (`/profile` nếu đã đăng nhập, `/login`
  nếu chưa) hoặc nhận lỗi 403 từ API — tuỳ theo route chặn ở FE hay chặn
  ở BE, không có cách nào xem được danh sách hay hồ sơ người khác.

- **AC2 — Danh sách hiển thị đúng và đủ:**
  Given đang có N user trong hệ thống,
  When admin vào `/users`,
  Then bảng hiển thị tối đa `pageSize` (mặc định 20) user đầu tiên theo
  `createdAt` giảm dần, mỗi dòng có đủ Name/Email/Role/Status/Provider.

- **AC3 — Mời user mới với email chưa tồn tại:**
  Given email nhập vào form "New user" chưa từng có trong hệ thống,
  When admin bấm "Send invite",
  Then hệ thống tạo user `PENDING` mới, gửi activation email (cùng cơ
  chế token/hạn 24h như feature-design mục 2), và user mới xuất hiện đầu
  danh sách ngay lập tức.

- **AC4 — Mời user với email đã tồn tại bị từ chối:**
  Given email nhập vào form "New user" **đã** tồn tại trong hệ thống
  (bất kể `PENDING` hay `ACTIVE`),
  When admin bấm "Send invite",
  Then hệ thống từ chối (409, "A user with this email already exists"),
  **không** tạo user mới, **không** gửi lại activation email cho user cũ
  (khác hành vi self-signup ở feature-design mục 1).

- **AC5 — Xem hồ sơ người khác đầy đủ thông tin:**
  Given admin bấm vào 1 user bất kỳ trong danh sách,
  When trang UserDetail tải xong,
  Then hiển thị đúng tên, email, role, status, provider, avatar, và ngày
  tham gia của **đúng** user đó (không phải của admin).

- **AC6 — User thường chỉ xem được hồ sơ chính mình qua endpoint này:**
  Given user role `USER` gọi trực tiếp `GET /api/users/:id` với `:id`
  **khác** id của chính họ,
  Then hệ thống trả 403 "Forbidden: insufficient permissions"; nếu `:id`
  **trùng** id của chính họ, hệ thống trả về đúng hồ sơ của họ.

- **AC7 — Xoá user thành công:**
  Given admin xác nhận xoá 1 user khác (không phải chính mình),
  When xác nhận dialog,
  Then user đó bị xoá cứng khỏi hệ thống ngay (không còn trong DB), và
  biến mất khỏi bảng danh sách ngay lập tức.

- **AC8 — Admin không tự xoá được chính mình:**
  Given admin cố gọi xoá đúng tài khoản đang đăng nhập của chính họ,
  When gọi `DELETE /api/users/:id` với `id` trùng chính họ,
  Then hệ thống từ chối (400, "Admins cannot delete their own account
  through this endpoint"), tài khoản admin đó **không** bị xoá.

- **AC9 — Huỷ confirm dialog không xoá gì:**
  Given admin bấm "Delete" trên 1 dòng,
  When admin bấm Cancel ở confirm dialog,
  Then **không** có API nào được gọi, user đó vẫn còn nguyên trong danh
  sách.

## 5. NFR liên quan

- **Phân trang:** `page`/`pageSize` đã có ở API (`GET /api/users`,
  `pageSize` mặc định 20, tối đa 100), nhưng **UI hiện tại (UserList.tsx)
  chưa dùng** — luôn gọi không kèm query, chỉ thấy trang đầu. **Chưa có
  ngưỡng số chính thức** cho việc khi nào cần bật UI phân trang — cần bổ
  sung nếu số user tăng đáng kể (đúng như ghi chú gốc trong
  raw-business-requirements).
- **Xoá user là hard delete**, không có soft-delete/undo — đây là rủi ro
  đã biết, không phải giới hạn kỹ thuật; cần quyết định lại nếu "admin
  xoá nhầm" trở thành vấn đề thật trong vận hành.

## 6. Screen refs

| Màn hình | File | Loại tham chiếu UI |
|---|---|---|
| Danh sách + mời user (bảng + form inline) | `frontend/src/pages/UserList.tsx` | Tự viết tay, đã triển khai |
| Xem hồ sơ người khác | `frontend/src/pages/UserDetail.tsx` | Tự viết tay, đã triển khai |
| Phân quyền route | `frontend/src/components/PrivateRoute.tsx` (`AdminRoute`) | Tự viết tay, đã triển khai |

## 7. Self-check

- [x] Mỗi màn hình liên quan đã ghi rõ loại tham chiếu UI.
- [x] Mọi AC ở dạng Given/When/Then, kiểm chứng được.
- [x] Business intent trả lời "ai đau, tại sao cần".
- [x] NFR không bịa số khi chưa có ngưỡng chính thức (đã nêu rõ khoảng
      trống ở mục phân trang, và ghi nhận rủi ro hard-delete riêng).
- [ ] Gắn vào backlog task / tạo GitHub issue — cần review trước, đặc
      biệt cân nhắc lại rủi ro hard-delete khi review.
