# Testcases IT-ST — Forgot / Reset Password

| ID | Given | When | Then | Trace |
|---|---|---|---|---|
| IT5.1 | Seed 1 user `ACTIVE` | `POST /forgot-password` đúng email, sau đó `POST /reset-password/:rawToken` với password mới hợp lệ | 200 cả 2 bước; DB: `passwordHash` đổi, `resetPasswordToken=null`, `status` vẫn `ACTIVE` | AC1, AC3 |
| IT5.2 | Không seed user nào | `POST /forgot-password` với email bất kỳ | 200, response giống hệt IT5.1 (không phân biệt được qua response) | AC2 |
| IT5.3 | Seed 1 user `ACTIVE` | `POST /forgot-password` 2 lần liên tiếp (2 token khác nhau), rồi `POST /reset-password/:rawToken1` (token của lần đầu) | 400 "invalid or has expired" (đã bị ghi đè bởi lần 2) | spec.md Edge case #1 |
| IT5.4 | Seed 1 user `provider=GOOGLE`, `status=ACTIVE`, `passwordHash=null` | `POST /forgot-password` rồi `POST /reset-password/:rawToken` với password mới | 200 cả 2 bước; DB: user giờ có `passwordHash` — từ đây login bằng password cũng hoạt động (xem feature 03) | AC6 |
