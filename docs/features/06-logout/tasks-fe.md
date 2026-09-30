# Tasks FE — Logout

| ID | Task | Input | Output | Trace |
|---|---|---|---|---|
| F06-01 | Component test `Navbar.tsx`: render với `user=null` (không thấy Logout) và với `user` hợp lệ (thấy Logout); click Logout → verify `api.post('/auth/logout')` được gọi | `testcases-ut.md` | `Navbar.test.tsx` | AC1, AC2 |
| F06-02 | Test tích hợp: sau khi `logout()` set `user=null`, render `<PrivateRoute>` con → phải `<Navigate to="/login">` | `PrivateRoute.tsx` | thêm case vào `PrivateRoute.test.tsx` (mới) | AC3 |
