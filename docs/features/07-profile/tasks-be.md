# Tasks BE — Profile

| ID | Task | Input | Output | Trace |
|---|---|---|---|---|
| B07-01 | UT `updateMyProfile()`: mock `User.findByPk`/`findOne`/`save`; cover đổi tên/email hợp lệ, email trùng user khác (409), email = chính mình (không lỗi) | `user.controller.ts` | `user.profile.test.ts` | testcases-ut.md #UT7.x |
| B07-02 | UT `uploadMyAvatar()`: mock `@aws-sdk/client-s3`, `uuid`; cover thiếu file (400), thành công (verify `PutObjectCommand` params + `avatarUrl` format) | `user.controller.ts` | `user.avatar.test.ts` | testcases-ut.md #UT7.x |
| B07-03 | IT-ST: supertest `GET`/`PUT /api/users/me`, `POST /api/users/me/avatar` (mock S3 module-level) trên SQLite test DB, cần JWT hợp lệ trong header | `app.ts` | `user.profile.it.test.ts` | testcases-it-st.md #IT7.x |
| B07-04 | *(Chờ BA)* Không code — theo dõi Assumption `spec.md` mục 7 (#1 QUAN TRỌNG: re-verify email mới, #2, #3) | spec.md §6 | Issue "chờ BA" | spec.md Assumption 1-3 |
