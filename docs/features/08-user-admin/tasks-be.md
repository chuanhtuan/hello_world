# Tasks BE — User Admin

| ID | Task | Input | Output | Trace |
|---|---|---|---|---|
| B08-01 | UT `listUsers()`: mock `User.findAndCountAll`; verify default `page=1,pageSize=20`; verify `pageSize` bị clamp về 100 nếu truyền >100 | `user.controller.ts` | `user.list.test.ts` | testcases-ut.md #UT8.x |
| B08-02 | UT `createUser()`: mock `User.findOne` (tồn tại → 409, không resend), mock `createPendingUserAndSendActivation` (mới → 201) | `user.controller.ts` | `user.create.test.ts` | testcases-ut.md #UT8.x |
| B08-03 | UT `getUserById()`: 3 case quyền (admin/self/khác-role-USER) | `user.controller.ts` | `user.getById.test.ts` | testcases-ut.md #UT8.x |
| B08-04 | UT `deleteUser()`: tự xoá chính mình (400), không tồn tại (404), hợp lệ (200 + `user.destroy()` được gọi) | `user.controller.ts` | `user.delete.test.ts` | testcases-ut.md #UT8.x |
| B08-05 | IT-ST: supertest `GET/POST /api/users`, `GET/DELETE /api/users/:id` trên SQLite test DB, JWT admin và JWT user thường | `app.ts` | `user.admin.it.test.ts` | testcases-it-st.md #IT8.x |
| B08-06 | *(Chờ BA)* Không code — theo dõi Assumption `spec.md` mục 8 (#1 phân trang UI, #2 giới hạn admin, #3 JWT không thu hồi — cùng issue với B03-04/B06-03) | spec.md §6 | Issue "chờ BA" | spec.md Assumption 1-3 |
