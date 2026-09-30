# Testcases IT-ST — Logout

| ID | Given | When | Then | Trace |
|---|---|---|---|---|
| IT6.1 | Đã login, có cookie session hợp lệ | `POST /api/auth/logout` | 200; response header `Set-Cookie` xoá cookie (giá trị rỗng/expired) | AC2 |
| IT6.2 | Không có cookie nào (chưa từng đăng nhập) | `POST /api/auth/logout` | 200 (idempotent, không lỗi) | (as-built) |
| IT6.3 | Đã login, sau đó logout | `GET /api/users/me` bằng cookie cũ (đã bị trình duyệt xoá — mô phỏng bằng cách không gửi cookie nữa) | 401 | AC3 |
