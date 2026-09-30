# Plan FE — Forgot / Reset Password

> Tham chiếu: `docs/plan/contracts/auth-contracts.md` §forgot-password/§reset-password.
> Status: **locked** (as-built, retroactive).

## As-built (không đổi)

- **Routes**: `/forgot-password`, `/reset-password/:token` (public).
- **Pages**: `ForgotPassword.tsx`, `ResetPassword.tsx`.
- Gọi thẳng `api.post(...)` (không qua `AuthContext`, khác Login/Signup)
  vì 2 luồng này không tạo session ngay.

## Việc cần làm ở bước Plan & Task này

| Task | Mô tả |
|---|---|
| F05-01 | Component test `ForgotPassword.tsx`: mock `api.post`, verify message hiển thị đúng, form không tiết lộ gì khác thường ở UI dù email tồn tại hay không |
| F05-02 | Component test `ResetPassword.tsx`: mock `api.post`, verify password <8 ký tự bị chặn (`minLength` HTML) và điều hướng `/login` sau khi thành công |
