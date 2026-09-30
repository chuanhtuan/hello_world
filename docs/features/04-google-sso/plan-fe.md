# Plan FE — Google SSO

> Tham chiếu: `docs/plan/contracts/auth-contracts.md` §google.
> Status: **locked** (as-built, retroactive).

## As-built (không đổi)

- **Component dùng chung**: `<GoogleLogin>` từ `@react-oauth/google`,
  nhúng cả trong `Login.tsx` và `Signup.tsx`.
- **Provider**: `GoogleOAuthProvider` bọc toàn app ở `main.tsx`, đọc
  `VITE_GOOGLE_CLIENT_ID`.
- **Gọi API**: `useAuth().loginWithGoogle(credential, remember)` →
  `POST /auth/google`. Từ `Signup.tsx` luôn gọi với `remember=false`
  (không có checkbox trên trang đó).

## Việc cần làm ở bước Plan & Task này

| Task | Mô tả |
|---|---|
| F04-01 | Test nhánh Google trong `Login.test.tsx` (đã tạo ở F03-01) + `Signup.test.tsx` (F01-01): mock `GoogleLogin.onSuccess`/`onError`, verify `loginWithGoogle` được gọi đúng tham số `remember` theo từng trang |

Không tạo file test mới riêng — bổ sung case vào test đã có của
Login/Signup vì Google button là 1 phần UI của 2 trang đó, không phải
component độc lập.
