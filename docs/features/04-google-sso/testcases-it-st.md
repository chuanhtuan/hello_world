# Testcases IT-ST — Google SSO

| ID | Given | When | Then | Trace |
|---|---|---|---|---|
| IT4.1 | DB trống, mock `verifyIdToken` trả payload hợp lệ mới | `POST /api/auth/google` | 201/200; DB có 1 user mới `status=ACTIVE`, `provider=GOOGLE` | AC1 |
| IT4.2 | Seed 1 user LOCAL `status=PENDING`, `email` trùng payload Google | `POST /api/auth/google` cùng email | 200; DB: user đó `status=ACTIVE`, `googleId` được gán, **không** tạo user thứ 2 | AC2 |
| IT4.3 | mock `verifyIdToken` trả `email_verified=false` | `POST /api/auth/google` | 400; DB không đổi | AC3 |
| IT4.4 | DB trống, mock `verifyIdToken` trả payload hợp lệ mới | `POST /api/auth/google` với `remember=true` | 200; `Set-Cookie` có `Max-Age` ≈ 2592000 (30 ngày) — đúng hành vi remember giống hệt Login thường (xem feature 03, IT3.2) | AC4 |
