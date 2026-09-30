# Tasks FE — Google SSO

| ID | Task | Input | Output | Trace |
|---|---|---|---|---|
| F04-01 | Bổ sung case Google vào `Login.test.tsx` + `Signup.test.tsx` (đã tạo ở F03-01/F01-01): mock `@react-oauth/google` `GoogleLogin` để tự bắn `onSuccess`/`onError`, verify `loginWithGoogle(credential, remember)` gọi đúng `remember` theo từng trang | `testcases-ut.md`, F01-01, F03-01 | Cập nhật 2 file test đã có | spec.md US4.1-US4.2 |
