# Testcases UT — User Admin

| ID | Given | When | Then | Trace |
|---|---|---|---|---|
| UT8.1 | không truyền `page`/`pageSize` | `GET /users` | `findAndCountAll` gọi với `offset=0, limit=20` | AC2 |
| UT8.2 | `pageSize=500` | `GET /users?pageSize=500` | `limit` bị clamp về 100 | NFR1 (contract) |
| UT8.3 | `User.findOne` → user có sẵn (bất kể status) | `POST /users` | 409 "A user with this email already exists"; `createPendingUserAndSendActivation` KHÔNG được gọi | AC4 |
| UT8.4 | `User.findOne` → `null` | `POST /users` | `createPendingUserAndSendActivation(name, email, role)` được gọi đúng tham số; response 201 | AC3 |
| UT8.5 | `req.user.role='ADMIN'`, `:id` khác chính mình | `GET /users/:id` | 200, trả đúng user | AC5 |
| UT8.6 | `req.user.role='USER'`, `:id` = chính mình | `GET /users/:id` | 200 | AC6 |
| UT8.7 | `req.user.role='USER'`, `:id` khác chính mình | `GET /users/:id` | 403 "Forbidden: insufficient permissions" | AC6 |
| UT8.8 | `req.user.id === :id` (admin tự xoá mình) | `DELETE /users/:id` | 400 "Admins cannot delete their own account..."; `user.destroy()` KHÔNG gọi | AC8 |
| UT8.9 | `:id` không tồn tại trong DB | `DELETE /users/:id` | 404 | (as-built) |
| UT8.10 | `:id` hợp lệ, khác admin đang gọi | `DELETE /users/:id` | `user.destroy()` được gọi; response `{message:"User deleted"}` | AC7 |
| UT8.11 (FE) | click "Delete", confirm dialog trả `false` | | KHÔNG gọi `api.delete` | AC9 |
| UT8.12 (FE) | `user={role:"USER"}` trong AuthContext | render `<AdminRoute />` bọc route `/users` | redirect về `/profile` (route con KHÔNG render) | AC1 |
| UT8.13 (FE) | `user=null` | render `<AdminRoute />` | redirect về `/login` | AC1 |
| UT8.14 (FE) | mock `GET /api/users` trả 2 user | render `<UserList />` | bảng hiển thị đúng 2 dòng, mỗi dòng đủ Name (link)/Email/Role/badge Status/Provider | AC2 |
| UT8.15 (FE) | mock `GET /api/users/:id` trả user B | render `<UserDetail />` với `:id` của B | hiển thị đúng Name/Email/Role/Status/Provider/Joined của **B** (không phải của admin đang xem) | AC5 |
