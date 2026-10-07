# Testcases UT — Logout

| ID | Given | When | Then | Trace |
|---|---|---|---|---|
| UT6.1 | request bất kỳ (có/không cookie) | `logout()` được gọi | `res.clearCookie(cookieName, {httpOnly, secure, sameSite:'lax'})` được gọi đúng 1 lần; response `{message:"Logged out"}` | AC2 |
| UT6.2 (FE) | `user=null` | render `Navbar` | KHÔNG có nút "Logout", chỉ có "Login"/"Sign up" | AC1 |
| UT6.3 (FE) | `user={...}` | render `Navbar`, click "Logout" | gọi `logout()` (context) rồi `navigate('/login')` | AC2 |
| UT6.4 (FE) | `user=null` (chưa đăng nhập hoặc vừa logout) trong AuthContext | render `<PrivateRoute />` bọc 1 route con bất kỳ, qua `MemoryRouter` | `<Navigate to="/login" replace />` được trigger — route con KHÔNG render | AC3 |
