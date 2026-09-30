# Testcases UT — Forgot / Reset Password

| ID | Given | When | Then | Trace |
|---|---|---|---|---|
| UT5.1 | `User.findOne` → `null` | `POST /forgot-password` | response `{message: "If that email is registered, a reset link has been sent."}`; `sendPasswordResetEmail` KHÔNG gọi | AC2 |
| UT5.2 | `User.findOne` → user `status=PENDING` | `POST /forgot-password` | response **giống hệt UT5.1** (so ký tự-cho-ký-tự); `sendPasswordResetEmail` KHÔNG gọi | AC2 |
| UT5.3 | `User.findOne` → user `status=ACTIVE` | `POST /forgot-password` | response **giống hệt UT5.1**; `sendPasswordResetEmail` **được gọi** 1 lần với đúng URL chứa raw token | AC1 |
| UT5.4 | `User.findOne` (theo `resetPasswordToken` hash) → `null` | `POST /reset-password/:token` | 400 "Password reset link is invalid or has expired" | AC4 |
| UT5.5 | user tìm thấy, `password="short12"` (8 ký tự nhưng test biên) | `POST /reset-password/:token` | pass (đúng biên 8 ký tự) | NFR2 |
| UT5.6 | user tìm thấy, `password="short"` (5 ký tự) | `POST /reset-password/:token` | 400 | AC5 |
| UT5.7 | user tìm thấy, token hợp lệ, password hợp lệ, `status` trước đó là `ACTIVE` | `POST /reset-password/:token` | `passwordHash` đổi, `resetPasswordToken=null`; **`status` vẫn `ACTIVE`** (không đổi) | AC3 |
