# Plan BE — Forgot / Reset Password

> Tham chiếu: `docs/plan/contracts/auth-contracts.md` §forgot/reset.
> Status: **locked** (as-built, retroactive).

## As-built (không đổi)

- **Routes**: `POST /api/auth/forgot-password`, `POST /api/auth/reset-password/:token`.
- **Controllers**: `forgotPassword`, `resetPassword` (`auth.controller.ts`).
- Token cùng cơ chế `hashToken()` như Activate (mục 2) nhưng field/hạn
  dùng riêng (`resetPasswordToken`, 1h).

## Việc cần làm ở bước Plan & Task này

| Task | Mô tả | Loại |
|---|---|---|
| B05-01 | UT `forgotPassword()` — mock `User`, verify response GIỐNG HỆT nhau (so ký tự-cho-ký-tự) giữa case email không tồn tại / PENDING / ACTIVE; verify `sendPasswordResetEmail` chỉ gọi ở case ACTIVE | UT |
| B05-02 | UT `resetPassword()` — mock `User`, cover token sai/hết hạn/password ngắn/hợp lệ; verify `status` KHÔNG đổi sau khi reset | UT |
| B05-03 | IT-ST: supertest full luồng forgot → reset trên SQLite test DB; test riêng case "request 2 lần liên tiếp, dùng link đầu tiên → bị từ chối" (spec.md Edge case #1) | IT-ST |
| B05-04 | **QC thủ công, KHÔNG tự động hoá**: verify gửi email thật qua Gmail SMTP hiện tại (rủi ro đã ghi ở feature-design mục 5 §6) | QC thủ công |
| B05-05 | *(Chờ BA)* Không code — theo dõi Assumption "chưa có rate-limit forgot-password" | Chờ BA |
