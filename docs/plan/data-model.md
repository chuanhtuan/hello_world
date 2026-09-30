# Data Model — Auth & User Management (dùng chung mục 1–8)

> Nguồn: `backend/src/models/user.model.ts`, migrations
> `20250101000000-create-users.js`, `20250115000000-add-auth-fields.js`.
> Toàn bộ 8 feature chỉ thao tác trên **1 entity duy nhất**: `User`.
> Không có bảng phụ (token nằm ngay trên `User`, không có bảng
> `sessions`/`tokens` riêng — session là JWT stateless, không lưu DB).

## 1. Entity: `User` (bảng `users`)

| Field | Kiểu | Ràng buộc | Feature liên quan |
|---|---|---|---|
| `id` | `INTEGER UNSIGNED` | PK, autoincrement | tất cả |
| `name` | `STRING(100)` | NOT NULL, **không trim** (gap đã ghi ở spec.md mục 1, 7) | 1, 7, 8 |
| `email` | `STRING(255)` | NOT NULL, UNIQUE, `isEmail`, **không normalize lowercase** (gap đã ghi ở spec.md mục 1, 3, 8) | 1, 3, 5, 7, 8 |
| `passwordHash` | `STRING(255)` | NULLABLE — null khi `PENDING` hoặc tài khoản GOOGLE-only | 1, 2, 3, 4, 5 |
| `avatarUrl` | `STRING(1024)` | NULLABLE, URL public S3 | 7 |
| `role` | `ENUM('ADMIN','USER')` | NOT NULL, default `USER` | 8 |
| `status` | `ENUM('PENDING','ACTIVE')` | NOT NULL, default `PENDING` | 1, 2, 3, 4, 8 |
| `provider` | `ENUM('LOCAL','GOOGLE')` | NOT NULL, default `LOCAL` | 1, 4 |
| `googleId` | `STRING(255)` | NULLABLE, UNIQUE | 4 |
| `activationToken` | `STRING(255)` | NULLABLE, lưu **hash SHA-256** của raw token | 1, 2, 8 |
| `activationTokenExpires` | `DATE` | NULLABLE, mặc định now+24h | 1, 2, 8 |
| `resetPasswordToken` | `STRING(255)` | NULLABLE, lưu **hash SHA-256** | 5 |
| `resetPasswordExpires` | `DATE` | NULLABLE, mặc định now+1h | 5 |
| `createdAt`/`updatedAt` | `DATE` | tự động (Sequelize timestamps) | 8 (hiển thị "Joined") |

**Không có quan hệ (relation) nào khác** — đây là bảng độc lập, không có
FK trỏ tới bảng nào khác trong hệ thống hiện tại.

## 2. State machine — `status`

```
[Signup tự đăng ký]  ──┐
                        ├──► PENDING ──(activate thành công, mục 2)──► ACTIVE
[Admin invite, mục 8] ──┘         │
                                   └──(Google login cùng email, mục 4)──► ACTIVE (bỏ qua activate)

[Google signup mới, mục 4] ──────────────────────────────────────────► ACTIVE (ngay từ đầu)
```

Không có trạng thái nào khác (không có `SUSPENDED`/`DELETED` — xoá là
hard delete, xem feature-design mục 8 §6).

## 3. Vòng đời token (dùng chung 1 pattern cho 2 loại token)

| | `activationToken` | `resetPasswordToken` |
|---|---|---|
| Sinh khi nào | Signup (mục 1), admin-invite (mục 8), resend (mục 2) | Forgot password (mục 5) |
| Raw token | `crypto.randomBytes(32).toString('hex')` (64 ký tự hex) | giống hệt |
| Lưu DB | `sha256(raw)` | `sha256(raw)` |
| Hạn dùng | 24h (`env.activationTokenTtlMs`) | 1h (hard-code `60*60*1000`) |
| Dùng 1 lần | Có — bị set `null` sau khi activate thành công | Có — bị set `null` sau khi reset thành công |
| Bị ghi đè bởi | Signup lại / resend / admin mời lại | Request forgot-password lại |

## 4. Public shape trả về client — `toPublicJSON()`

```ts
{ id, name, email, avatarUrl, role, status, provider, createdAt, updatedAt }
```

**Không bao giờ** trả `passwordHash`, `activationToken`,
`resetPasswordToken`, `googleId` ra ngoài — đây là hợp đồng đã khoá,
mọi endpoint mới/sửa phải tiếp tục dùng `toPublicJSON()`, không tự
`JSON.stringify(user)` hay trả field thô.

## 5. Rủi ro dữ liệu đã biết (mang từ spec.md sang, KHÔNG tự sửa ở bước Plan)

- `email` không normalize lowercase trước khi lưu/so khớp.
- `name` không `trim()`, chấp nhận chuỗi toàn khoảng trắng.
- `activationToken` không bị dọn khi tài khoản được kích hoạt tức thời
  qua Google (mục 4) — dữ liệu rác vô hại, tự hết hạn.

Các điểm này **không** được tự ý sửa trong bước Plan & Task — chờ BA
xác nhận theo Assumption đã ghi trong từng `spec.md`. Nếu BA chốt cần
sửa, sẽ có task riêng (không nằm trong phạm vi "retroactive test coverage"
của các tasks-be.md hiện tại).
