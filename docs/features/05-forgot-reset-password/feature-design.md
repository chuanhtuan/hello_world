# Feature Design — Quên mật khẩu / Đặt lại mật khẩu (Forgot / Reset Password)

> Nguồn: `docs/product/raw-business-requirements.md` mục 5.
> Trạng thái: Đã triển khai (đã chuyển sang Gmail SMTP thật gần đây —
> cần verify lại luồng thật sau khi đổi SMTP, xem mục "Rủi ro" bên dưới).
> Tài liệu này sinh **retroactive** từ code đã có
> (`frontend/src/pages/ForgotPassword.tsx`,
> `frontend/src/pages/ResetPassword.tsx`,
> `backend/src/controllers/auth.controller.ts` — `forgotPassword`,
> `resetPassword`) — dùng để review/onboarding, và làm nền khi cần
> sửa/mở rộng feature.

## 1. Business intent

Người dùng quên password cần cách tự khôi phục quyền truy cập mà không
cần admin can thiệp thủ công — giảm tải vận hành và không chặn người
dùng lại khi họ quên mật khẩu, một tình huống xảy ra thường xuyên với bất
kỳ hệ thống có password nào.

**Đối tượng dùng:** User `ACTIVE` có password (`provider = LOCAL`), hoặc
user Google muốn **thêm** password để có thể đăng nhập song song bằng cả
2 cách.

## 2. Phạm vi (Scope)

Feature này bao gồm: form nhập email để gửi link reset, và form đặt
password mới qua link đó.

**Ngoài phạm vi:** đăng nhập bằng password (feature-design mục 3), luồng
activation ban đầu (feature-design mục 2) — dùng cơ chế token tương tự
nhưng là 2 loại token khác nhau (`resetPasswordToken` vs
`activationToken`), không dùng chung.

## 3. Logic flow

1. User vào `/forgot-password`, nhập email, bấm "Send reset link".
2. Frontend gọi `POST /api/auth/forgot-password` với `{ email }`.
3. Backend tìm user theo email:
   - **Không tồn tại, hoặc tồn tại nhưng `status != ACTIVE`** → vẫn trả
     về **200** với message trung lập "If that email is registered, a
     reset link has been sent." — **không** gửi email, **không** tiết lộ
     email có tồn tại hay đang ở trạng thái nào.
   - **Tồn tại và `ACTIVE`** → sinh token reset (32 byte ngẫu nhiên, lưu
     hash SHA-256, hết hạn sau **1 giờ**), gửi email chứa link
     `{clientUrl}/reset-password/{token}`, trả về **cùng message** ở
     trên (để hành vi bên ngoài giống hệt trường hợp email không tồn
     tại).
4. Frontend luôn hiển thị message thành công nhận được từ backend (giống
   nhau dù email có hợp lệ hay không) + link quay lại Login.
5. User mở link `/reset-password/:token`, nhập password mới, bấm "Set
   new password". (Khác với Activate Account, trang này **không** gọi
   API kiểm tra token trước — chỉ validate khi submit.)
6. Frontend gọi `POST /api/auth/reset-password/:token` với `{ password }`.
7. Backend validate password tối thiểu 8 ký tự; tìm user có
   `resetPasswordToken` khớp hash và `resetPasswordExpires` còn hiệu
   lực:
   - **Không tìm thấy / hết hạn / password quá ngắn** → lỗi 400 tương
     ứng, **không** đổi password, **không** đổi `status`.
   - **Hợp lệ** → set `passwordHash` mới (bcrypt), xoá
     `resetPasswordToken`/`resetPasswordExpires` (token dùng 1 lần),
     **không đổi `status`** hiện tại của user.
8. Thành công → frontend điều hướng về `/login` (khác Activate Account:
   ở đây user phải tự đăng nhập lại bằng password mới, không tự động
   login).

## 4. Acceptance Criteria

- **AC1 — Request reset cho email hợp lệ, ACTIVE:**
  Given user tồn tại với `status = ACTIVE`,
  When submit form Forgot password với đúng email,
  Then hệ thống sinh 1 reset token (hash SHA-256, hết hạn sau 1 giờ),
  gửi email chứa link `{clientUrl}/reset-password/{token}`, và trả về
  200 với message "If that email is registered, a reset link has been
  sent."

- **AC2 — Không lộ thông tin tài khoản khi email không hợp lệ:**
  Given email không tồn tại trong hệ thống, HOẶC tồn tại nhưng
  `status = PENDING`,
  When submit form Forgot password,
  Then hệ thống trả về **cùng** response 200 với **cùng** message như
  AC1, và **không** gửi email nào.

- **AC3 — Đặt lại password thành công:**
  Given token reset còn hạn (<1h) và chưa dùng, password mới ≥8 ký tự,
  When submit form Reset password,
  Then `passwordHash` được cập nhật, token reset bị xoá (không dùng lại
  được), `status` của user **giữ nguyên** như trước khi reset, và
  frontend điều hướng về `/login`.

- **AC4 — Token reset hết hạn hoặc không hợp lệ:**
  Given token sai, đã hết hạn (>1h), hoặc đã dùng trước đó,
  When submit form Reset password,
  Then hệ thống trả lỗi 400 "Password reset link is invalid or has
  expired", **không** đổi password.

- **AC5 — Password mới quá ngắn:**
  Given token hợp lệ nhưng password mới <8 ký tự,
  When submit,
  Then hệ thống từ chối (400, "Password must be at least 8 characters"),
  password cũ (nếu có) không bị thay đổi.

- **AC6 — User Google có thể thêm password qua luồng này:**
  Given user `provider = GOOGLE`, `status = ACTIVE`, chưa từng có
  password,
  When user đó thực hiện đúng luồng Forgot → Reset password với email
  Google của mình,
  Then user có được `passwordHash` mới và từ đó có thể đăng nhập bằng cả
  Google **lẫn** email/password (xem feature-design mục 3, AC5 — trường
  hợp này sẽ không còn áp dụng cho user đó nữa sau khi có password).

## 5. NFR liên quan

- **Thời hạn reset token:** 1 giờ — ngắn hơn activation token (24h, xem
  feature-design mục 2) vì đây là hành động nhạy cảm hơn (thay đổi
  quyền truy cập của tài khoản đang hoạt động, không phải tạo mới).
  Giá trị hard-code trong `auth.controller.ts` (`60 * 60 * 1000`), chưa
  đưa ra biến môi trường như activation token.
- **Token lưu trữ:** hash SHA-256, không lưu token gốc — giống cơ chế
  activation token.
- **Độ dài password tối thiểu:** 8 ký tự, không yêu cầu độ phức tạp —
  giống Activate Account.

## 6. Rủi ro / cần verify lại

Theo raw-business-requirements: hệ thống **vừa đổi sang Gmail SMTP thật**
gần đây (trước đó có thể chưa từng test với SMTP thật cho luồng này) —
**cần verify lại** luồng gửi email reset thật sau khi đổi SMTP trước khi
coi feature này là ổn định hoàn toàn trên production.

## 7. Screen refs

| Màn hình | File | Loại tham chiếu UI |
|---|---|---|
| Forgot password | `frontend/src/pages/ForgotPassword.tsx` | Tự viết tay, đã triển khai |
| Reset password | `frontend/src/pages/ResetPassword.tsx` | Tự viết tay, đã triển khai |

## 8. Self-check

- [x] Mỗi màn hình liên quan đã ghi rõ loại tham chiếu UI.
- [x] Mọi AC ở dạng Given/When/Then, kiểm chứng được.
- [x] Business intent trả lời "ai đau, tại sao cần".
- [x] NFR không bịa số khi chưa có ngưỡng chính thức.
- [ ] Gắn vào backlog task / tạo GitHub issue — cần review trước, đặc
      biệt lưu ý mục 6 (rủi ro SMTP) khi review.
