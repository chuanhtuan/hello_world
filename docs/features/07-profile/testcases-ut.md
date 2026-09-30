# Testcases UT — Profile

| ID | Given | When | Then | Trace |
|---|---|---|---|---|
| UT7.1 | user hiện tại, `data={name:"New Name"}` | `PUT /users/me` | `user.name` đổi, `user.email` không đổi, không query kiểm tra trùng email | AC2 |
| UT7.2 | `data={email: "new@test.com"}`, `User.findOne({email:"new@test.com"})` → user khác | `PUT /users/me` | 409 "Email already in use"; `user.save()` KHÔNG được gọi | AC3 |
| UT7.3 | `data={email: user.email}` (giống hệt hiện tại) | `PUT /users/me` | KHÔNG gọi `User.findOne` kiểm tra trùng (do check `!==`); `save()` vẫn chạy bình thường | (as-built) |
| UT7.4 | `req.file` = `undefined` | `POST /users/me/avatar` | 400 "No file uploaded" | AC5 |
| UT7.5 | `req.file` hợp lệ (`originalname="a.png"`, `mimetype="image/png"`) | `POST /users/me/avatar` | `S3Client.send` gọi với `Key` dạng `avatars/{userId}/{uuid}.png`; `user.avatarUrl` set đúng format URL S3; `user.save()` được gọi | AC4 |
| UT7.6 (FE) | upload lỗi (API trả 400) | chọn file, upload | hiển thị message lỗi, `avatarUrl` hiển thị KHÔNG đổi (vẫn ảnh cũ/placeholder) | AC5 |
