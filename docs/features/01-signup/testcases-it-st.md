# Testcases IT-ST — Signup

> IT-ST = supertest gọi thật `app` (Express) + SQLite test DB (thật,
> không mock DB) + mock `mailer.ts` (không gửi email thật).

| ID | Given | When | Then | Trace |
|---|---|---|---|---|
| IT1.1 | DB trống | `POST /api/auth/signup` với `{name:"Alice", email:"alice@test.com"}` | 201; DB có 1 user `status=PENDING`, `passwordHash=null`; `activationToken` là chuỗi hash (không phải raw); `activationTokenExpires` ≈ now+24h | AC2, AC3 |
| IT1.2 | Đã có user `email=bob@test.com, status=ACTIVE` | `POST /api/auth/signup` cùng email | 409; body `{message: "An account with this email already exists. Try logging in instead."}`; DB không đổi | AC4 |
| IT1.3 | Đã có user `email=carol@test.com, status=PENDING`, `activationToken=T_old` | `POST /api/auth/signup` cùng email, tên khác | 200; DB: `activationToken != T_old`; chỉ 1 record với email đó (không tạo thêm) | AC5 |
| IT1.4 | DB trống | `POST /api/auth/signup` với `{name:"", email:"x@test.com"}` | 400; body có `errors: [{path:"name", ...}]`; DB không có user nào được tạo | AC6 |
| IT1.5 | DB trống | `POST /api/auth/signup` với `{name:"X", email:"not-valid"}` | 400; DB không có user nào được tạo | AC6 |
| IT1.6 `@requires-mysql` | DB trống, chạy trên **MySQL thật** (không phải SQLite — xem research.md §2.3) | `POST /api/auth/signup` với `email="Test@Example.com"`, sau đó lại với `email="test@example.com"` | Ghi lại kết quả thực tế (có tạo 2 record hay bị coi trùng) — **kết quả này trả lời trực tiếp Assumption #2 ở spec.md**, feed ngược lại BA | spec.md Edge case #2 |
