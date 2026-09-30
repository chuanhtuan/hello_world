# Tasks BE — Forgot / Reset Password

| ID | Task | Input | Output | Trace |
|---|---|---|---|---|
| B05-01 | UT `forgotPassword()`: mock `User.findOne`, `sendPasswordResetEmail`; so sánh response body giữa 3 case (không tồn tại/PENDING/ACTIVE) phải giống hệt | `auth.controller.ts` | `auth.forgot.test.ts` | testcases-ut.md #UT5.x |
| B05-02 | UT `resetPassword()`: mock `User.findOne`, `bcrypt.hash`; cover token sai/hết hạn/password <8/hợp lệ | `auth.controller.ts` | `auth.reset.test.ts` | testcases-ut.md #UT5.x |
| B05-03 | IT-ST: supertest full luồng trên SQLite; thêm case "request 2 lần, dùng link đầu tiên bị từ chối" | `app.ts` | `auth.forgot-reset.it.test.ts` | testcases-it-st.md #IT5.x |
| B05-04 | QC thủ công: gửi request forgot-password thật qua SMTP Gmail hiện tại, xác nhận nhận được email và link hoạt động | `.env` SMTP thật | Checklist QC ký xác nhận | feature-design §6 (rủi ro) |
| B05-05 | *(Chờ BA)* Không code — theo dõi Assumption rate-limit | spec.md §6 | Issue "chờ BA" | spec.md Assumption #1 |
