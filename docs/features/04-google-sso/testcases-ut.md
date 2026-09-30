# Testcases UT — Google SSO

| ID | Given | When | Then | Trace |
|---|---|---|---|---|
| UT4.1 | `verifyIdToken` trả payload `email_verified=false` | `POST /google` | 400 "Google account email is not verified"; không gọi `User.create`/`save` | AC3 |
| UT4.2 | `verifyIdToken` hợp lệ; `User.findOne({googleId})` → null; `User.findOne({email})` → null | `POST /google` | `User.create` với `provider=GOOGLE`, `status=ACTIVE`, `googleId` đúng | AC1 |
| UT4.3 | `verifyIdToken` hợp lệ; `User.findOne({googleId})` → user có sẵn | `POST /google` | KHÔNG gọi `User.create`; `user.save()` với `status=ACTIVE` | US4.2 |
| UT4.4 | `verifyIdToken` hợp lệ; `User.findOne({googleId})` → null; `User.findOne({email})` → user LOCAL có sẵn (có `passwordHash`) | `POST /google` | `user.googleId` được gán, `passwordHash` cũ **không đổi**, `status=ACTIVE` | AC2 |
| UT4.5 | `env.google.clientId` rỗng | `POST /google` | 500 "Google Sign-In is not configured..." | AC5 |
| UT4.6 | `payload.name` rỗng, `payload.email="x@test.com"` | `POST /google` (nhánh tạo mới) | `User.create` với `name="x"` (fallback split `@`) | (as-built, không phải AC riêng) |
