# Tasks FE — User Admin

| ID | Task | Input | Output | Trace |
|---|---|---|---|---|
| F08-01 | Component test `UserList.tsx`: mock `api`; verify render bảng từ `GET /users`, mời user thành công (`POST /users`) chèn đầu danh sách, mời trùng email hiển thị lỗi 409, xoá (confirm=true/false) | `testcases-ut.md` | `UserList.test.tsx` | AC2-AC4, AC7, AC9 |
| F08-02 | Component test `UserDetail.tsx`: mock `api.get`; verify hiển thị đủ field kể cả "Joined" (format date), lỗi 403/404 hiển thị message | `testcases-ut.md` | `UserDetail.test.tsx` | AC5, AC6 |
| F08-03 | Test `AdminRoute` (đã có `PrivateRoute.tsx`): case `user=null` → `/login`; `user.role='USER'` → `/profile`; `user.role='ADMIN'` → render `Outlet` | `PrivateRoute.tsx` | `PrivateRoute.test.tsx` (dùng chung với F06-02) | AC1 |
