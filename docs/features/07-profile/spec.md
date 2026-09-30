# Spec — Xem & Cập nhật hồ sơ cá nhân (Profile), kèm avatar

> Nguồn: `docs/features/07-profile/feature-design.md` (đã review).
> Đối chiếu codebase: `backend/src/controllers/user.controller.ts`
> (`getMyProfile`, `updateMyProfile`, `uploadMyAvatar`),
> `backend/src/middlewares/upload.middleware.ts`,
> `frontend/src/pages/Profile.tsx`, `frontend/src/pages/EditProfile.tsx`.

## 1. User Stories

**US7.1** — Là user, tôi muốn xem thông tin hồ sơ của mình (tên, email,
role, status, provider, avatar) mà không cần hỏi admin.
*(trace feature-design §3.1, §4 AC1)*

**US7.2** — Là user, tôi muốn sửa tên/email của mình để cập nhật thông
tin khi cần.
*(trace feature-design §3.2, §4 AC2/AC3)*

**US7.3** — Là user, tôi muốn đổi ảnh đại diện để cá nhân hoá tài khoản.
*(trace feature-design §3.3, §4 AC4/AC5)*

## 2. Edge cases

Đối chiếu `user.controller.ts`, `upload.middleware.ts`:

1. **[QUAN TRỌNG] Đổi email không yêu cầu re-verify chủ sở hữu email
   mới.** `updateMyProfile` chỉ kiểm tra email mới chưa trùng ai khác
   (409 nếu trùng) rồi set thẳng `user.email = data.email` — **không**
   gửi lại activation/confirmation email tới địa chỉ mới. Điều này mâu
   thuẫn tiềm ẩn với business intent của Signup (feature-design mục 1:
   "đảm bảo email thật trước khi cho set password") — sau khi đổi email
   ở đây, hệ thống hiển thị user vẫn `ACTIVE` dù chưa từng xác thực
   email **mới** đó là có thật.
2. **Đổi email thành chính email hiện tại của mình** (không thay đổi
   gì): code chỉ query kiểm tra trùng khi
   `data.email !== user.email`, nên trường hợp này luôn pass, không có
   side-effect thừa — đúng hành vi mong muốn, không phải gap.
3. **Name toàn khoảng trắng** khi sửa: `z.string().min(1).max(100)`
   không `trim()` — giống edge case đã nêu ở Signup.
4. **Upload avatar: S3 thành công nhưng `user.save()` thất bại** (VD mất
   kết nối DB giữa 2 thao tác): file đã lên S3 nhưng `avatarUrl` không
   được cập nhật trong DB → **file rác trên S3** (orphan object), không
   có cơ chế dọn dẹp hay rollback. Ảnh hưởng: tốn dung lượng lưu trữ về
   lâu dài, không ảnh hưởng chức năng hiển thị (vì user vẫn thấy avatar
   cũ/không có avatar).
5. **2 tab cùng sửa tên/email khác nhau gần như đồng thời**: không có
   optimistic locking (không có version/`updatedAt` check trước khi
   ghi) — request xử lý sau sẽ ghi đè hoàn toàn kết quả của request xử
   lý trước ("last write wins"), user có thể mất thay đổi mà không được
   cảnh báo.
6. **Upload file đúng định dạng ảnh nhưng là ảnh hỏng/corrupt** (mimetype
   đúng `image/*` nhưng nội dung file lỗi): `fileFilter` chỉ check
   `mimetype`, không validate nội dung thật của file → file lỗi vẫn được
   upload lên S3 thành công, chỉ phát hiện khi trình duyệt cố hiển thị
   ảnh và fail (không phải lỗi ở bước upload).

## 3. Requirements

| # | Requirement | Trace |
|---|---|---|
| FR1 | User chỉ xem/sửa được hồ sơ của chính mình qua các endpoint `/users/me*` | feature-design §3, §4 AC6 |
| FR2 | Đổi email phải kiểm tra trùng với user khác trước khi lưu | feature-design §3.2 bước 5, §4 AC3 |
| FR3 | Avatar chỉ chấp nhận file ảnh (`image/*`), tối đa 5MB | feature-design §5, §4 AC5 |
| FR4 | Sau khi đổi avatar, FE phải refresh lại thông tin hiển thị ngay không cần reload trang | feature-design §3.3 bước 5 |
| NFR1 | Giới hạn dung lượng avatar: 5MB | feature-design §5 |
| NFR2 | Lưu trữ avatar trên S3, bucket policy public-read cho prefix `avatars/` | feature-design §5 |

## 4. Key entities

**User**: `name` (≤100 ký tự), `email` (unique), `avatarUrl` (S3 public
URL), `role`, `status`, `provider` (2 field cuối chỉ hiển thị, không sửa
được qua trang này).

## 5. Success criteria

- AC1–AC6 trong feature-design mục 7 pass.
- Đổi email thành công không làm thay đổi `status` hiện tại của user
  (dù về logic nghiệp vụ, email mới chưa từng được xác thực — xem
  Assumption #1).
- Không phát sinh avatar "rác" trên S3 không gắn với `avatarUrl` nào
  trong DB sau một chuỗi thao tác upload liên tiếp bình thường (test
  trong điều kiện không có lỗi mạng/DB).

## 6. Assumptions

1. **[QUAN TRỌNG]** Đổi email trong Edit Profile không yêu cầu re-verify
   qua email mới (không gửi lại link xác nhận) — CẦN HỎI BA: đây có
   phải hành vi mong muốn, hay cần thêm bước xác thực email mới tương tự
   activation ban đầu (feature-design mục 2)? *Trạng thái: đang chờ xác
   nhận — ảnh hưởng trực tiếp tới mục tiêu "đảm bảo email thật" đã nêu ở
   Signup.*
2. **Name không được trim/validate nội dung** khi sửa hồ sơ (giống
   Signup) — CẦN HỎI BA. *Trạng thái: đang chờ xác nhận.*
3. **Không có cơ chế dọn file rác trên S3** khi `user.save()` thất bại
   sau khi upload thành công — CẦN HỎI BA/Dev: có cần transaction/
   compensating action, hay chấp nhận rủi ro ở tần suất thấp? *Trạng
   thái: đang chờ xác nhận (ưu tiên thấp).*
