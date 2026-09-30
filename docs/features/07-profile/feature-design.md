# Feature Design — Xem & Cập nhật hồ sơ cá nhân (Profile), kèm avatar

> Nguồn: `docs/product/raw-business-requirements.md` mục 7.
> Trạng thái: Đã triển khai.
> Tài liệu này sinh **retroactive** từ code đã có
> (`frontend/src/pages/Profile.tsx`, `frontend/src/pages/EditProfile.tsx`,
> `backend/src/controllers/user.controller.ts` — `getMyProfile`,
> `updateMyProfile`, `uploadMyAvatar`) — dùng để review/onboarding, và
> làm nền khi cần sửa/mở rộng feature.

## 1. Business intent

User cần tự quản lý thông tin cá nhân (tên, email, ảnh đại diện) mà
không cần nhờ admin hỗ trợ — giảm tải vận hành cho chủ ứng dụng và cho
user toàn quyền kiểm soát dữ liệu của chính họ.

**Đối tượng dùng:** Mọi user đã đăng nhập — chỉ xem/sửa được hồ sơ của
chính mình qua các màn này (xem hồ sơ **người khác** thuộc quyền admin,
xem **feature-design mục 8**).

## 2. Phạm vi (Scope)

Feature này bao gồm: trang xem Profile (thông tin + avatar), trang Edit
Profile (sửa tên/email), và upload/đổi avatar.

**Ngoài phạm vi:** đổi password (không có trong 2 trang này — đổi
password chỉ qua Activate/Reset, xem feature-design mục 2, 5); admin xem
hồ sơ người khác (feature-design mục 8).

## 3. Logic flow

### 3.1. Xem Profile

1. User vào `/profile` (route yêu cầu đăng nhập qua `PrivateRoute`).
2. Trang hiển thị dữ liệu user hiện có sẵn trong auth context (không gọi
   API riêng để load lại, trừ khi vừa đổi avatar — xem 3.3): tên, email,
   role, status (dạng badge), provider (hiển thị "Google" hoặc "Email &
   password"), avatar (ảnh nếu có, hoặc chữ cái đầu tên làm placeholder).
3. Có link "Edit profile" dẫn tới `/profile/edit`.

### 3.2. Sửa tên/email

1. User vào `/profile/edit`, form pre-fill sẵn tên/email hiện tại.
2. User sửa tên và/hoặc email, bấm "Save changes".
3. Frontend gọi `PUT /api/users/me` với `{ name, email }`.
4. Backend validate: `name` không rỗng (≤100 ký tự) nếu có gửi, `email`
   đúng định dạng nếu có gửi (cả 2 field đều optional ở schema, nhưng
   form frontend luôn gửi cả 2 vì đều đánh dấu `required` trên input).
5. Nếu `email` mới khác email hiện tại **và** đã bị user khác dùng →
   lỗi 409 "Email already in use", **không** đổi gì.
6. Hợp lệ → cập nhật `name`/`email`, trả về user mới.
7. Frontend refresh lại profile trong auth context, điều hướng về
   `/profile`.

### 3.3. Đổi avatar

1. Từ trang Profile, user bấm "Change avatar", chọn 1 file ảnh.
2. Frontend gửi `POST /api/users/me/avatar` dạng `multipart/form-data`
   với field `avatar`.
3. Backend kiểm tra:
   - Không có file → lỗi 400 "No file uploaded".
   - File không phải ảnh (mimetype không bắt đầu bằng `image/`) → lỗi từ
     middleware upload (chặn trước khi vào controller).
   - File > 5MB → lỗi từ middleware upload (giới hạn `multer`).
4. Hợp lệ → backend upload file lên S3 tại
   `avatars/{userId}/{uuid}.{ext}`, cập nhật `avatarUrl` của user thành
   URL public S3 tương ứng, trả về user mới.
5. Frontend refresh profile (`refreshProfile`) để hiển thị avatar mới
   ngay lập tức, không cần reload trang.
6. Lỗi ở bước 3 → frontend hiển thị message lỗi trên trang Profile, giữ
   nguyên avatar cũ.

## 4. Acceptance Criteria

- **AC1 — Xem đúng thông tin của chính mình:**
  Given user đã đăng nhập,
  When vào `/profile`,
  Then thấy đúng tên, email, role, status, provider, avatar (hoặc
  placeholder chữ cái đầu tên nếu chưa có avatar) của **chính** user đó.

- **AC2 — Sửa tên/email thành công:**
  Given user vào Edit Profile, nhập tên và/hoặc email mới hợp lệ (email
  chưa bị ai khác dùng),
  When bấm Save changes,
  Then thông tin được cập nhật, trang điều hướng về `/profile` và hiển
  thị đúng dữ liệu mới.

- **AC3 — Đổi sang email đã bị người khác dùng bị chặn:**
  Given email mới nhập trùng với email của **một user khác** đã tồn tại
  trong hệ thống,
  When bấm Save changes,
  Then hệ thống từ chối (409, "Email already in use"), thông tin user
  hiện tại **không đổi**.

- **AC4 — Upload avatar hợp lệ:**
  Given user chọn 1 file ảnh (mimetype `image/*`) dung lượng ≤5MB,
  When upload,
  Then avatar được lưu lên S3, `avatarUrl` của user được cập nhật, và
  trang Profile hiển thị ảnh mới ngay mà không cần tải lại trang.

- **AC5 — Upload file không phải ảnh, hoặc quá 5MB, bị từ chối:**
  Given file chọn không phải định dạng ảnh, HOẶC dung lượng >5MB,
  When upload,
  Then hệ thống từ chối, **không** thay đổi `avatarUrl` hiện tại, và
  hiển thị lỗi cho user biết.

- **AC6 — Chỉ xem/sửa được hồ sơ của chính mình qua 2 màn này:**
  Given user thường (role `USER`),
  When thao tác trên `/profile` hoặc `/profile/edit`,
  Then mọi API gọi ra đều nhắm vào chính user đang đăng nhập
  (`/users/me...`) — không có cách nào từ 2 màn này để sửa hồ sơ user
  khác.

## 5. NFR liên quan

- **Giới hạn dung lượng avatar:** 5MB (chốt trong code qua
  `multer` `limits.fileSize`).
- **Định dạng avatar cho phép:** chỉ file có mimetype bắt đầu bằng
  `image/` (chốt trong code qua `fileFilter`).
- **Lưu trữ avatar:** S3, bucket policy public-read cho prefix
  `avatars/` (đã chốt qua Terraform — không phải NFR hình thức của
  feature này nhưng là ràng buộc hạ tầng cần biết khi sửa/mở rộng).
- **Giới hạn độ dài tên:** ≤100 ký tự (giống các nơi khác trong hệ
  thống, VD Signup — feature-design mục 1).

## 6. Screen refs

| Màn hình | File | Loại tham chiếu UI |
|---|---|---|
| Xem Profile | `frontend/src/pages/Profile.tsx` | Tự viết tay, đã triển khai |
| Edit Profile | `frontend/src/pages/EditProfile.tsx` | Tự viết tay, đã triển khai |

## 7. Self-check

- [x] Mỗi màn hình liên quan đã ghi rõ loại tham chiếu UI.
- [x] Mọi AC ở dạng Given/When/Then, kiểm chứng được.
- [x] Business intent trả lời "ai đau, tại sao cần".
- [x] NFR không bịa số khi chưa có ngưỡng chính thức (ở đây số đã chốt
      sẵn trong code nên ghi trực tiếp).
- [ ] Gắn vào backlog task / tạo GitHub issue — cần review trước.
