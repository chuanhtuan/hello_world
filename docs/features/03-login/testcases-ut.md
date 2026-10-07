# Testcases UT — Login

| ID | Given | When | Then | Trace |
|---|---|---|---|---|
| UT3.1 | `User.findOne` → `null` | `POST /login` | 401 "Invalid email or password" | AC3 |
| UT3.2 | user tồn tại, `passwordHash=null`, `provider=GOOGLE` | `POST /login` | 400 "This account uses Google Sign-In..." | AC5 |
| UT3.3 | user tồn tại, `passwordHash=null`, `provider=LOCAL` | `POST /login` | 403 "Please activate your account first..." | AC4 |
| UT3.4 | user tồn tại, có password, `status=PENDING` | `POST /login` | 403 "Please activate your account first..." | AC4 |
| UT3.5 | user tồn tại, `status=ACTIVE`, `bcrypt.compare` → `false` | `POST /login` | 401 "Invalid email or password" | AC3 |
| UT3.6 | user tồn tại, `status=ACTIVE`, password đúng, `remember=false` | `POST /login` | `issueSession` gọi với `remember=false`; response 200 kèm `token`+`user` | AC1 |
| UT3.7 | giống UT3.6 nhưng `remember=true` | `POST /login` | `issueSession` gọi với `remember=true` | AC2 |
| UT3.8 | `remember=false` | `issueSession(res, user, false)` | JWT decode có `exp` ≈ now + 1 ngày (theo `JWT_EXPIRES_IN_DEFAULT`); cookie set KHÔNG có `maxAge` | AC1 |
| UT3.9 | `remember=true` | `issueSession(res, user, true)` | JWT decode `exp` ≈ now + 30 ngày; cookie có `maxAge=30*24*60*60*1000` | AC2 |
| UT3.10 (FE) | lỗi 401 trả về từ API | submit form | message lỗi hiển thị đúng trên form; input email/password KHÔNG bị xoá | AC6 |
| UT3.11 (FE, as-built — chưa phải AC chính thức) | `user` đã có trong AuthContext (đã đăng nhập) | vào `/login` | KHÔNG có guard nào chặn — trang Login vẫn hiển thị form bình thường, không tự redirect về `/profile`. Cần BA xác nhận có cần chặn hay không trước khi viết AC chính thức. | (gap đã biết, không trace AC) |
