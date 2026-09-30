# Testcases IT-ST — Login

| ID | Given | When | Then | Trace |
|---|---|---|---|---|
| IT3.1 | Seed 1 user `ACTIVE`, password biết trước (hash sẵn qua bcrypt trong seed) | `POST /api/auth/login` đúng email/password, `remember=false` | 200; `Set-Cookie` không có `Max-Age`/`Expires` | AC1 |
| IT3.2 | Giống IT3.1 | `POST /api/auth/login` với `remember=true` | 200; `Set-Cookie` có `Max-Age` ≈ 2592000 (30 ngày) | AC2 |
| IT3.3 | Seed 1 user `provider=GOOGLE`, `passwordHash=null` | `POST /api/auth/login` với email đó + password bất kỳ | 400 "This account uses Google Sign-In..." | AC5 |
| IT3.4 | Seed 1 user `status=PENDING`, có password | `POST /api/auth/login` đúng password | 403 "Please activate your account first..." | AC4 |
| IT3.5 | Không seed user nào | `POST /api/auth/login` với email bất kỳ | 401; message giống hệt IT3.6 (không phân biệt được) | AC3 |
| IT3.6 | Seed 1 user `ACTIVE` | `POST /api/auth/login` đúng email, sai password | 401; message giống hệt IT3.5 | AC3 |
