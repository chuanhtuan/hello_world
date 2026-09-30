# Testcases UT — Activate Account

| ID | Given | When | Then | Trace |
|---|---|---|---|---|
| UT2.1 | raw token bất kỳ | `hashToken(raw)` gọi 2 lần | trả về đúng 2 lần cùng 1 giá trị (SHA-256 hex, 64 ký tự) | data-model §3 |
| UT2.2 | `User.findOne` trả `null` (token sai) | `GET /activate/:token` | 400 "invalid or has expired" | AC2 |
| UT2.3 | `User.findOne` trả user (token khớp, chưa hết hạn) | `GET /activate/:token` | 200 `{name, email}` đúng của user đó | AC1 |
| UT2.4 | token hợp lệ, `password="short"` (6 ký tự) | `POST /activate/:token` | 400 "Password must be at least 8 characters"; `activateAccount` KHÔNG được gọi tới `user.save()` | AC4 |
| UT2.5 | token hợp lệ, `password` hợp lệ | `POST /activate/:token` | `user.save()` được gọi với `status=ACTIVE`, `activationToken=null`, `activationTokenExpires=null`, `passwordHash` đã bcrypt; response có `token`+`user` | AC5 |
| UT2.6 | `User.findOne` trả `null` ở bước POST (token đã bị xoá/hết hạn giữa chừng) | `POST /activate/:token` | 400, không set gì | AC2 |
| UT2.7 (FE) | `checkState='checking'` | render | hiển thị "Checking activation link..." | US2.3 |
| UT2.8 (FE) | password và confirmPassword khác nhau | submit | báo lỗi "Passwords do not match" ngay, KHÔNG gọi `activateAccount` | AC3 |
| UT2.9 | `User.findOne` trả `null` (email không tồn tại hoặc không PENDING) | `POST /resend-activation` | response 200 message trung lập, `sendActivationEmail` KHÔNG được gọi | AC7 |
| UT2.10 | `User.findOne` trả user `status=PENDING` | `POST /resend-activation` | response 200 **cùng message** như UT2.9, `sendActivationEmail` **được gọi** | AC7 |
