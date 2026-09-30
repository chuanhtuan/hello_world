# Testcases IT-ST — User Admin

| ID | Given | When | Then | Trace |
|---|---|---|---|---|
| IT8.1 | Seed 25 user, JWT admin | `GET /api/users` (không kèm query, đúng hành vi UI hiện tại) | 200; `users.length === 20` (mặc định `pageSize`), `total === 25` — **khẳng định lại gap đã ghi ở spec.md**: 5 user cũ nhất "biến mất" khỏi kết quả mặc định | spec.md Edge case #1 |
| IT8.2 | JWT `role=USER` | `GET /api/users` | 403 | AC1 |
| IT8.3 | JWT admin, DB chưa có email đó | `POST /api/users` `{name, email, role:"ADMIN"}` | 201; DB có user mới `status=PENDING`, `role=ADMIN` | AC3 |
| IT8.4 | JWT admin, email đã tồn tại (`PENDING` hoặc `ACTIVE`) | `POST /api/users` cùng email | 409; DB không đổi, không có email thứ 2 nào được gửi thêm cho user cũ | AC4 |
| IT8.5 | Seed user A (thường) và admin M, JWT của A | `GET /api/users/:idCủaM` | 403 | AC6 |
| IT8.6 | JWT admin M, seed user A | `DELETE /api/users/:idCủaM` (M tự xoá mình) | 400; DB: M vẫn còn | AC8 |
| IT8.7 | JWT admin M, seed user A | `DELETE /api/users/:idCủaA` | 200; DB: A không còn tồn tại (hard delete, `findByPk` sau đó trả `null`) | AC7 |
