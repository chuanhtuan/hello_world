# Spec — Quên mật khẩu / Đặt lại mật khẩu (Forgot / Reset Password)

> Nguồn: `docs/features/05-forgot-reset-password/feature-design.md` (đã review).
> Đối chiếu codebase: `backend/src/controllers/auth.controller.ts`
> (`forgotPassword`, `resetPassword`), `backend/src/utils/mailer.ts`.

## 1. User Stories

**US5.1** — Là user `ACTIVE` quên password, tôi muốn nhận link reset
qua email để tự đặt lại mà không cần admin can thiệp.
*(trace feature-design §3 bước 1-4, §4 AC1/AC3)*

**US5.2** — Là hệ thống, tôi không được để lộ qua response của Forgot
password rằng 1 email cụ thể có tồn tại/đang ở trạng thái nào, để tránh
kẻ tấn công dò danh sách email đã đăng ký.
*(trace feature-design §3 bước 3, §4 AC2)*

**US5.3** — Là user đăng ký qua Google chưa từng có password, tôi muốn
dùng đúng luồng Forgot/Reset để thêm password, cho phép đăng nhập song
song bằng cả 2 cách.
*(trace feature-design §4 AC6)*

## 2. Edge cases

Đối chiếu `auth.controller.ts`:

1. **Gọi Forgot password nhiều lần liên tiếp cho cùng 1 email** (không
   có rate-limit): mỗi lần đều ghi đè `resetPasswordToken` +
   `resetPasswordExpires` bằng giá trị mới → **link gửi ở lần trước tự
   động vô hiệu** ngay khi có lần gọi tiếp theo (vì token cũ không còn
   khớp DB nữa), kể cả khi link cũ chưa hết hạn 1h. Đây là hành vi ngầm
   định của thiết kế (không phải bug), nhưng cần thành 1 test case rõ
   ràng: "Given đã request 2 lần liên tiếp, When dùng link của lần đầu,
   Then phải bị từ chối dù chưa quá 1h."
2. **Không rate-limit request Forgot password**: có thể bị lợi dụng để
   gửi email liên tục tới 1 nạn nhân (không cần sở hữu email, chỉ cần
   biết nó tồn tại và ACTIVE) — dạng harassment nhẹ, không rò rỉ dữ liệu
   nhưng gây phiền.
3. **Reset password không yêu cầu xác thực lại danh tính nào khác** (chỉ
   cần sở hữu link email) — đây là rủi ro vốn có của mọi cơ chế "reset
   via email" (nếu hộp thư bị chiếm tạm thời, tài khoản bị chiếm theo),
   không phải lỗi implementation, nhưng cần ghi nhận rõ trong spec để
   QC không báo nhầm là bug.
4. **Password mới trùng với password cũ**: không có kiểm tra chặn việc
   đặt lại đúng password hiện tại — hệ thống cho phép (không phải vấn
   đề bảo mật, nhưng là thiếu 1 ràng buộc thường thấy ở hệ thống khác).
5. **SMTP thật mới đổi gần đây sang Gmail** (ghi tại feature-design §6):
   cần test case thực tế gửi-nhận email qua Gmail SMTP thật, không chỉ
   test với mock/log — vì đây là feature **chưa được verify lại** sau
   khi đổi hạ tầng gửi mail.

## 3. Requirements

| # | Requirement | Trace |
|---|---|---|
| FR1 | Response của `forgotPassword` phải giống hệt nhau bất kể email tồn tại/trạng thái nào | feature-design §3 bước 3, §4 AC2 |
| FR2 | Chỉ thực sự gửi email khi `status=ACTIVE` | feature-design §3 bước 3, §4 AC1/AC2 |
| FR3 | Reset token dùng 1 lần, xoá ngay sau khi dùng thành công | feature-design §3 bước 7 |
| FR4 | `status` của user không đổi sau khi reset password (chỉ đổi `passwordHash`) | feature-design §3 bước 7, §4 AC3 |
| NFR1 | Reset token hết hạn sau 1 giờ (ngắn hơn activation 24h) | feature-design §5 |
| NFR2 | Password mới tối thiểu 8 ký tự | feature-design §5 |

## 4. Key entities

**User**: `resetPasswordToken` (hash SHA-256, nullable),
`resetPasswordExpires` (nullable), `passwordHash`, `status` (không đổi
bởi feature này).

## 5. Success criteria

- AC1–AC6 trong feature-design mục 5 pass.
- **Đã verify lại thật** việc gửi email reset qua Gmail SMTP hiện tại
  (không chỉ qua code review) — điều kiện bắt buộc để đóng rủi ro đã ghi
  ở feature-design §6, không coi feature "Done" nếu bước này chưa làm.
- Response của Forgot password giống hệt nhau (so ký tự-cho-ký-tự) giữa
  trường hợp email không tồn tại và email tồn tại nhưng `PENDING`.

## 6. Assumptions

1. **Không có rate-limit cho request Forgot password** — CẦN HỎI BA: có
   cần giới hạn số lần gọi/email/IP trong 1 khoảng thời gian? *Trạng
   thái: đang chờ xác nhận.*
2. **Chưa verify lại luồng thật sau khi đổi sang Gmail SMTP** (đã ghi
   nhận là rủi ro ngay trong feature-design) — CẦN QC xác nhận đã test
   thật trước khi đóng feature này. *Trạng thái: đang chờ xác nhận —
   BLOCKING cho việc coi feature production-ready.*
