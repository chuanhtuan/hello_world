# Testcases IT-ST — Activate Account

| ID | Given | When | Then | Trace |
|---|---|---|---|---|
| IT2.1 | Seed 1 user `PENDING` với token hợp lệ (raw token biết trước trong test) | `GET /api/auth/activate/:rawToken` rồi `POST` cùng token với password hợp lệ | 200 cả 2 bước; DB: `status=ACTIVE`, `activationToken=null`; response POST có cookie session hợp lệ | AC1, AC5 |
| IT2.2 | Tiếp nối IT2.1 (token đã dùng) | `GET /api/auth/activate/:rawToken` lại (cùng token) | 400 "invalid or has expired" | AC6 |
| IT2.3 | Seed 1 user `PENDING` với `activationTokenExpires` trong quá khứ | `GET /api/auth/activate/:rawToken` | 400 | AC2 |
| IT2.4 | Seed 1 user `PENDING`, token hợp lệ | `POST /api/auth/activate/:rawToken` với `password="1234567"` (7 ký tự) | 400; DB: `status` vẫn `PENDING` | AC4 |
| IT2.5 | Seed 1 user `PENDING` | `POST /api/auth/resend-activation` 2 lần liên tiếp với cùng email | Lần 2 trả token mới; link của lần 1 (`GET /activate/:rawToken1`) sau đó phải trả 400 (bị ghi đè) | spec.md Edge case #4 (khẳng định lại hành vi ghi đè, không phải bug) |
