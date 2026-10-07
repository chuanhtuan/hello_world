# Test Viewpoint — Forgot / Reset Password

> Retroactive — xem ghi chú ở `01-signup/test-viewpoint.md`, áp dụng tương tự
> ở đây.

## Màn hình: Forgot password (`ForgotPassword.tsx`) + Reset password (`ResetPassword.tsx`)

| Khía cạnh | Trạng thái | Ghi chú |
|---|---|---|
| Access | ✅ | Public, token-based — không cần testcase access/role riêng. |
| UI | ⚠️ GAP | KHÔNG có testcase FE nào cho cả 2 màn (hiển thị message trung lập, điều hướng về `/login` sau khi reset thành công) — toàn bộ `testcases-ut.md`/`testcases-it-st.md` của feature này là backend. |
| Function | ✅ | UT5.1–UT5.7 + IT5.1–IT5.4 phủ đủ AC1, AC2, AC3, AC4, AC5, AC6, kể cả case ghi đè token khi request 2 lần (IT5.3). |
| Security | ✅ (mạnh) | Chống lộ thông tin tài khoản test rất kỹ — UT5.1/UT5.2/IT5.2 so khớp response y hệt giữa email-tồn-tại-PENDING và email-không-tồn-tại. |
| Data | ✅ | Password boundary đúng 8 ký tự được test tường minh (UT5.5) — đây là ví dụ coverage tốt, nên áp dụng lại cho feature 02 (xem gap đã ghi ở đó). |

## Gaps cần Test Lead quyết định

> **Trạng thái: PENDING (2026-10-07)** — user đã xem 2 gap dưới đây và chủ động xin để lại,
> sẽ cung cấp hướng xử lý sau. KHÔNG tự suy diễn hướng xử lý hoặc tự đóng gap này — chờ input
> tiếp theo từ user trước khi testcase của feature này được chuyển `approved`.

1. Bổ sung testcase FE cho cả 2 màn (message hiển thị, điều hướng sau reset).
2. **Lưu ý riêng từ feature-design mục 6 (Rủi ro)**: hệ thống vừa đổi sang Gmail SMTP thật — testcase hiện tại đều mock `mailer.ts`, chưa có test nào verify luồng gửi email THẬT qua SMTP mới. Cần ít nhất 1 lần verify thủ công (hoặc testcase riêng khi deploy) trước khi coi feature này ổn định.
