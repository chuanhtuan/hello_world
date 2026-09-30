# Testcases IT-ST — Profile

| ID | Given | When | Then | Trace |
|---|---|---|---|---|
| IT7.1 | Seed user A, JWT hợp lệ của A | `GET /api/users/me` | 200; đúng thông tin của A, không có `passwordHash` trong response | AC1 |
| IT7.2 | Seed user A, JWT của A | `PUT /api/users/me` với `{name:"A2", email:"a2@test.com"}` | 200; DB: A có tên/email mới | AC2 |
| IT7.3 | Seed user A và B (`B.email="b@test.com"`), JWT của A | `PUT /api/users/me` với `email="b@test.com"` | 409; DB: A không đổi | AC3 |
| IT7.4 | Seed user A, JWT của A, mock S3 module-level | `POST /api/users/me/avatar` với file ảnh hợp lệ | 200; DB: `avatarUrl` của A được set | AC4 |
| IT7.5 | Seed user A, JWT của A | `POST /api/users/me/avatar` với file `.txt` (mimetype `text/plain`) | 400 (chặn bởi `fileFilter`); DB: `avatarUrl` không đổi | AC5 |
