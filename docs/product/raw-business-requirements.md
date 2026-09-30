# Yêu cầu nghiệp vụ thô — HelloWorld

Tài liệu này là **input thô** cho skill `feature-spec-writer` (xem
`.claude/skills/feature-spec-writer/SKILL.md`) — không phải BRD/SRS/FRS
chính thức, chỉ đủ ý để AI/BA soạn `feature-design.md` cho từng feature.
Mỗi mục dưới đây tương ứng 1 lần chạy `feature-spec-writer` (có thể gộp
vài mục liên quan thành 1 feature-design nếu bạn thấy hợp lý).

Các feature dưới đây ĐÃ được code (retroactive) — dùng tài liệu này để
sinh lại `feature-design.md` chính thức cho từng feature, phục vụ việc
review/onboarding về sau, hoặc làm nền khi cần sửa/mở rộng feature.

---

## 1. Đăng ký tài khoản (Signup) — chỉ Name + Email

**Business intent:** Người dùng mới muốn tạo tài khoản để dùng hệ thống,
nhưng không nên bắt nhập password ngay (giảm friction, và đảm bảo email
thật trước khi cho set password) — cho chủ ứng dụng an tâm hơn khi tài
khoản chưa xác thực không thể đăng nhập được.

**Đối tượng dùng:** Người dùng chưa có tài khoản.

**Mô tả ngắn:** Form Signup chỉ có 2 field Name + Email. Submit hợp lệ tạo
user với `status = PENDING`, `passwordHash = null`, gửi email chứa link
kích hoạt (token hash SHA-256, hết hạn 24h).

**UI reference:** `frontend/src/pages/Signup.tsx` — tự viết tay (không
qua Claude Design), đã triển khai.

**NFR liên quan:** Email kích hoạt gửi trong vài giây sau submit (chưa có
ngưỡng số chính thức — cần chốt nếu muốn đưa vào Product Spec).

**Trạng thái:** Đã triển khai, đã deploy production (`46.137.205.212.nip.io`).

---

## 2. Kích hoạt tài khoản qua email (Activate Account)

**Business intent:** Xác thực người dùng sở hữu email thật trước khi họ có
thể đăng nhập, đồng thời để họ tự đặt password của mình (thay vì hệ thống
tạo hộ) — giảm rủi ro nhập sai email lúc đăng ký.

**Đối tượng dùng:** User vừa Signup (status PENDING), hoặc user được admin
mời (xem mục 8).

**Mô tả ngắn:** Click link `/activate/:token` → nếu token hợp lệ (chưa hết
hạn, chưa dùng) → cho nhập password → set password, `status = ACTIVE`, tự
động đăng nhập. Có endpoint resend nếu token hết hạn hoặc email thất lạc.

**UI reference:** `frontend/src/pages/ActivateAccount.tsx` — tự viết tay,
đã triển khai.

**NFR liên quan:** Token hết hạn sau 24h (đã chốt trong code, không phải
NFR hình thức nhưng nên ghi lại làm tham chiếu).

**Trạng thái:** Đã triển khai.

---

## 3. Đăng nhập bằng Email + Password, kèm "Remember me"

**Business intent:** Người dùng đã có tài khoản cần đăng nhập lại; những
người dùng thường xuyên (check "Remember me") không muốn phải đăng nhập
lại mỗi lần mở trình duyệt.

**Đối tượng dùng:** User đã ACTIVE, có password (LOCAL provider).

**Mô tả ngắn:** Form Login (email, password, checkbox Remember me).
Không check → session cookie (mất khi đóng browser). Có check → cookie
tồn tại 30 ngày. Nếu tài khoản chưa activate hoặc là tài khoản Google
(chưa có password) → trả lỗi rõ ràng hướng dẫn đúng cách đăng nhập.

**UI reference:** `frontend/src/pages/Login.tsx` — tự viết tay, đã triển khai.

**NFR liên quan:** Session mặc định 1 ngày, remember me 30 ngày (đã chốt
trong code — `JWT_EXPIRES_IN_DEFAULT` / `JWT_EXPIRES_IN_REMEMBER`).

**Trạng thái:** Đã triển khai.

---

## 4. Đăng nhập / Đăng ký qua Google (SSO)

**Business intent:** Giảm friction cho người dùng đã có Google account —
không cần nhớ thêm password mới, đồng thời Google đã xác thực email nên
không cần bước kích hoạt qua email nữa.

**Đối tượng dùng:** User mới hoặc cũ muốn dùng Google thay vì email/password.

**Mô tả ngắn:** Nút "Sign in with Google" trả về ID token, backend verify
token, tạo mới (nếu email chưa tồn tại) hoặc liên kết vào tài khoản có sẵn
cùng email, set `status = ACTIVE` ngay (không qua bước activate), set
`provider = GOOGLE`. Tôn trọng cùng checkbox Remember me như đăng nhập
thường.

**UI reference:** Nút Google nhúng trong `Login.tsx` / `Signup.tsx` qua
`@react-oauth/google` (`GoogleOAuthProvider` ở `main.tsx`) — tự viết tay,
đã triển khai, đã cấu hình Client ID + domain HTTPS thật
(`https://46.137.205.212.nip.io`).

**NFR liên quan:** Không có ngưỡng số riêng; phụ thuộc độ trễ Google OAuth.

**Trạng thái:** Đã triển khai, đã verify hoạt động trên production.

---

## 5. Quên mật khẩu / Đặt lại mật khẩu (Forgot / Reset Password)

**Business intent:** Người dùng quên password cần cách tự khôi phục truy
cập mà không cần admin can thiệp thủ công.

**Đối tượng dùng:** User ACTIVE có password (LOCAL provider), hoặc user
Google muốn thêm password để đăng nhập song song.

**Mô tả ngắn:** Form nhập email → gửi link reset (token hash SHA-256, hết
hạn 1h) → click link → nhập password mới → set password, không đổi status.

**UI reference:** `frontend/src/pages/ForgotPassword.tsx`,
`frontend/src/pages/ResetPassword.tsx` — tự viết tay, đã triển khai.

**NFR liên quan:** Token reset hết hạn 1h (ngắn hơn activation 24h vì đây
là hành động nhạy cảm hơn — nên ghi rõ lý do nếu sau này có người hỏi).

**Trạng thái:** Đã triển khai (chưa test thật với SMTP thật cho tới gần
đây — nay đã dùng Gmail SMTP, cần verify lại luồng reset thật sau khi đổi
SMTP).

---

## 6. Đăng xuất (Logout)

**Business intent:** Người dùng cần cách chấm dứt phiên đăng nhập trên
thiết bị đang dùng, đặc biệt quan trọng nếu dùng máy chung/máy công cộng.

**Đối tượng dùng:** Mọi user đã đăng nhập.

**Mô tả ngắn:** Nút Logout trong Navbar → xoá cookie phiên + token phía
client → điều hướng về trang Login.

**UI reference:** `frontend/src/components/Navbar.tsx` — tự viết tay, đã
triển khai.

**NFR liên quan:** Không có.

**Trạng thái:** Đã triển khai.

---

## 7. Xem & Cập nhật hồ sơ cá nhân (Profile), kèm avatar

**Business intent:** User cần tự quản lý thông tin cá nhân (tên, email,
ảnh đại diện) mà không cần admin hỗ trợ.

**Đối tượng dùng:** Mọi user đã đăng nhập (xem/sửa hồ sơ của chính mình).

**Mô tả ngắn:** Trang Profile hiển thị tên/email/avatar/status/provider/
ngày tham gia. Trang Edit Profile cho sửa tên/email + upload avatar
(multipart, lưu S3, trả về URL public).

**UI reference:** `frontend/src/pages/Profile.tsx`,
`frontend/src/pages/EditProfile.tsx` — tự viết tay, đã triển khai.

**NFR liên quan:** Avatar lưu S3 với bucket policy public-read cho prefix
`avatars/` (đã chốt qua Terraform, không phải NFR hình thức nhưng nên ghi
chú lại).

**Trạng thái:** Đã triển khai.

---

## 8. Quản trị người dùng — Danh sách, Mời user mới, Xem hồ sơ người khác, Xoá user

**Business intent:** Admin cần công cụ quản lý toàn bộ user trong hệ
thống — theo dõi ai đã kích hoạt, mời người dùng mới bằng tay (không cần
họ tự signup), và gỡ bỏ tài khoản khi cần.

**Đối tượng dùng:** Chỉ role ADMIN.

**Mô tả ngắn:**
- **Danh sách user** (`GET /api/users`): bảng liệt kê tất cả user, kèm
  badge status (PENDING/ACTIVE) và provider (LOCAL/GOOGLE).
- **Mời user mới** (`POST /api/users`): admin nhập Name + Email → tạo user
  PENDING + gửi email kích hoạt, dùng lại đúng luồng activation ở mục 2
  (không tạo luồng activation riêng cho admin-invite).
- **Xem hồ sơ người khác** (`GET /api/users/:id`): admin xem được hồ sơ
  bất kỳ user nào; user thường chỉ xem được hồ sơ chính mình.
- **Xoá user** (`DELETE /api/users/:id`): xoá tài khoản khỏi hệ thống.

**UI reference:** `frontend/src/pages/UserList.tsx` (bảng + form mời user),
`frontend/src/pages/UserDetail.tsx` (xem hồ sơ người khác) — tự viết tay,
đã triển khai. Phân quyền route qua `PrivateRoute.tsx`.

**NFR liên quan:** Chưa có ngưỡng số riêng (VD giới hạn phân trang khi
danh sách user lớn) — cần bổ sung nếu số user tăng đáng kể.

**Trạng thái:** Đã triển khai. **Ghi chú rủi ro:** Xoá user hiện là xoá
cứng (hard delete), không có soft-delete/undo — nên cân nhắc lại nếu admin
xoá nhầm là vấn đề thật.

---

## Cách dùng tài liệu này với feature-spec-writer

Mỗi lần muốn sinh (hoặc cập nhật) `feature-design.md` cho 1 feature, đưa
đúng phần tương ứng ở trên (business intent + UI reference) cho skill
`feature-spec-writer`. Vì tất cả UI reference ở đây đều là "tự viết tay,
đã triển khai" — không rơi vào nhánh HALT nữa (đã nới lỏng điều kiện UI).
