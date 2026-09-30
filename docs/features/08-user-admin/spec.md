# Spec — Quản trị người dùng (Danh sách, Mời user mới, Xem hồ sơ người khác, Xoá user)

> Nguồn: `docs/features/08-user-admin/feature-design.md` (đã review).
> Đối chiếu codebase: `backend/src/controllers/user.controller.ts`
> (`listUsers`, `createUser`, `getUserById`, `deleteUser`),
> `frontend/src/pages/UserList.tsx`, `frontend/src/pages/UserDetail.tsx`,
> `frontend/src/components/PrivateRoute.tsx` (`AdminRoute`).

## 1. User Stories

**US8.1** — Là admin, tôi muốn xem danh sách toàn bộ user để theo dõi ai
đã kích hoạt tài khoản.
*(trace feature-design §3.1, §4 AC1/AC2)*

**US8.2** — Là admin, tôi muốn mời user mới bằng Name + Email để họ tự
kích hoạt tài khoản, không cần họ tự signup.
*(trace feature-design §3.2, §4 AC3/AC4)*

**US8.3** — Là admin, tôi muốn xem hồ sơ chi tiết của bất kỳ user nào để
hỗ trợ/kiểm tra khi cần.
*(trace feature-design §3.3, §4 AC5/AC6)*

**US8.4** — Là admin, tôi muốn xoá user khi cần (rời công ty, tài khoản
spam...), nhưng hệ thống phải chặn tôi tự xoá chính mình để tránh tự
khoá quyền truy cập.
*(trace feature-design §3.4, §4 AC7/AC8/AC9)*

## 2. Edge cases

Đối chiếu `user.controller.ts`, `UserList.tsx`:

1. **[Đã biết, ghi trong feature-design §5] UI không dùng phân trang**:
   `UserList.tsx` gọi `GET /api/users` không kèm `page`/`pageSize` →
   luôn nhận về mặc định BE (`pageSize=20`, trang 1). Nếu hệ thống có
   **hơn 20 user**, admin sẽ **không thấy** các user cũ hơn (bị
   `createdAt DESC` đẩy ra ngoài trang 1) và **không có cách nào trên UI
   hiện tại để xem trang tiếp theo** — đây là giới hạn chức năng thật
   cần test tới (VD seed 25 user, xác nhận chỉ 20 user mới nhất hiển
   thị).
2. **[Liên quan Login/Logout] Xoá user đang có session JWT còn hiệu
   lực**: giống edge case đã nêu ở Login (mục 3) — JWT không bị thu hồi
   ngay khi record bị xoá. Cụ thể với admin: nếu admin A xoá admin B,
   token của B (nếu còn hạn) vẫn pass được `requireRole(ADMIN)` ở các
   API chỉ đọc từ JWT payload (không query DB), cho tới khi B gọi 1 API
   có `findByPk` (VD `getMyProfile` → 404) hoặc token tự hết hạn.
3. **Mời user với email khác hoa/thường** so với email đã tồn tại (VD
   mời lại `Test@Example.com` trong khi đã có `test@example.com`):
   giống edge case Signup — không normalize, tuỳ collation DB có thể
   không phát hiện trùng.
4. **Không giới hạn số lượng admin, không cảnh báo khi chọn role ADMIN**
   trong form mời: dropdown role chỉ có `USER`/`ADMIN`, không có xác
   nhận phụ hay giới hạn số admin tối đa — admin hiện tại có thể vô tình
   tạo thêm nhiều admin mà không có cảnh báo.
5. **2 admin lần lượt xoá lẫn nhau**: hệ thống chỉ chặn "tự xoá chính
   mình" (`req.user!.id === id`), không chặn trường hợp admin A xoá admin
   B (hợp lệ) — về lý thuyết nếu tổ chức chỉ có 2 admin, sau khi A xoá B,
   hệ thống chỉ còn 1 admin (A); nếu A sau đó bị xoá bởi hành động khác
   (VD thao tác trực tiếp DB) thì hệ thống mất hết admin — cạnh biên tổ
   chức, không phải bug trong phạm vi feature này nhưng cần biết khi vận
   hành.
6. **Admin xoá 1 user đang là chính mình đăng nhập ở tab khác** (không
   phải cùng phiên gọi API): `deleteUser` chỉ so `req.user!.id` (id của
   người gọi API) với `id` bị xoá — nếu admin A đăng nhập 2 tab, xoá
   chính mình từ tab này vẫn bị chặn đúng (400) vì `req.user!.id` luôn
   là id của A bất kể tab nào gọi.

## 3. Requirements

| # | Requirement | Trace |
|---|---|---|
| FR1 | Chỉ role `ADMIN` truy cập được toàn bộ 4 chức năng | feature-design §3, §4 AC1 |
| FR2 | Mời user dùng lại đúng cơ chế activation như self-signup (không có luồng riêng) | feature-design §3.2 bước 4, §4 AC3 |
| FR3 | Mời user với email đã tồn tại phải từ chối (409), không tự resend như self-signup | feature-design §3.2 bước 4, §4 AC4 |
| FR4 | Admin không được tự xoá chính mình qua endpoint này | feature-design §3.4 bước 4, §4 AC8 |
| FR5 | `getUserById` phải cho phép self-access ngoài admin (dùng chung với Profile) | feature-design §3.3 bước 3, §4 AC6 |
| NFR1 | API hỗ trợ phân trang (`page`, `pageSize` mặc định 20, tối đa 100) dù UI hiện chưa dùng | feature-design §5 |
| NFR2 | Xoá user là hard delete, không soft-delete/undo (rủi ro đã biết) | feature-design §5, §6 |

## 4. Key entities

**User**: `role` (`ADMIN`/`USER`), `status`, `provider`, cộng thêm
tham chiếu chéo tới cơ chế activation (feature-design mục 2) khi mời
user mới. Kết quả `listUsers` trả kèm `total`/`page`/`pageSize` (đã có ở
API, chưa dùng ở UI).

## 5. Success criteria

- AC1–AC9 trong feature-design mục 8 pass.
- Test xác nhận rõ giới hạn phân trang UI: với >20 user, admin **không**
  thấy đủ danh sách trên UI hiện tại (ghi nhận là known-gap, không phải
  fail tiêu chí, miễn đã có ghi chú rõ trong tài liệu này và
  feature-design).
- Xoá user xoá đúng, đủ, và không xoá nhầm khi admin cố tự xoá chính
  mình dưới mọi hình thức gọi API (kể cả gọi trực tiếp không qua UI).

## 6. Assumptions

1. **UI `UserList` chưa dùng phân trang** dù BE đã hỗ trợ — với hệ thống
   có >20 user, các user cũ hơn sẽ không hiển thị được trên UI hiện tại
   — CẦN HỎI BA: ưu tiên bổ sung UI phân trang ngay hay chấp nhận tạm
   thời ở quy mô user hiện tại (đã nêu ở feature-design §5)? *Trạng
   thái: đang chờ xác nhận.*
2. **Không giới hạn số lượng admin / không cảnh báo khi mời role ADMIN**
   — CẦN HỎI BA: có cần thêm guard rail (VD xác nhận 2 bước khi mời
   admin)? *Trạng thái: đang chờ xác nhận, ưu tiên thấp.*
3. **JWT của user/admin bị xoá vẫn có hiệu lực tới khi hết hạn tự
   nhiên** (không có cơ chế thu hồi ngay) — cùng root cause với
   assumption ở feature-design mục 3 (Login) và mục 6 (Logout) — CẦN HỎI
   BA cùng 1 lúc với 2 feature đó vì đây là quyết định kiến trúc dùng
   chung, không nên quyết định riêng lẻ cho từng feature. *Trạng thái:
   đang chờ xác nhận.*
