# Contracts — `/api/users/*` (LOCKED)

> Nguồn đối chiếu: `backend/src/routes/user.routes.ts`,
> `backend/src/controllers/user.controller.ts`. Mọi route đi qua
> `authenticate` trước (yêu cầu đăng nhập). Status: **locked**.

## GET /api/users/me — feature 07

**Response 200**: `{ "user": <PublicUser> }` (shape xem `data-model.md` §4).
**Response 401**: chưa đăng nhập / token invalid — `{ message }`.

## PUT /api/users/me — feature 07

**Request** (cả 2 field optional, nhưng FE luôn gửi cả 2 vì form đánh dấu `required`):
```json
{ "name": "string (1-100, optional)", "email": "string (email, optional)" }
```
**Response 200**: `{ "user": <PublicUser> }`
**Response 409**: `{ "message": "Email already in use" }` (email trùng user khác).

## POST /api/users/me/avatar — feature 07

**Request**: `multipart/form-data`, field `avatar` (file ảnh, ≤5MB).
**Response 200**: `{ "user": <PublicUser> }` (với `avatarUrl` mới).
**Response 400**: `{ "message": "No file uploaded" }`, hoặc lỗi từ `fileFilter`/`limits` của multer (không phải ảnh, hoặc >5MB).

---

## GET /api/users — feature 08 (chỉ `ADMIN`)

**Query** (đã hỗ trợ ở BE, **UI hiện chưa dùng** — xem `research.md`/`spec.md` mục 8):
`?page=1&pageSize=20` (pageSize tối đa 100)

**Response 200**:
```json
{ "users": [<PublicUser>, ...], "total": 42, "page": 1, "pageSize": 20 }
```
**Response 403**: role không phải `ADMIN`.

## POST /api/users — feature 08 (chỉ `ADMIN`)

**Request**
```json
{ "name": "string (1-100)", "email": "string", "role": "USER|ADMIN (optional, default USER)" }
```
**Response 201**: `{ "user": <PublicUser> }` (status luôn `PENDING`, đã gửi activation email).
**Response 409**: `{ "message": "A user with this email already exists" }` — **khác** hành vi self-signup (không tự resend).

## GET /api/users/:id — feature 07 + 08 (self hoặc `ADMIN`)

**Response 200**: `{ "user": <PublicUser> }`
**Response 403**: `{ "message": "Forbidden: insufficient permissions" }` — khi người gọi không phải `ADMIN` và `:id` khác chính họ.
**Response 404**: user không tồn tại.

## DELETE /api/users/:id — feature 08 (chỉ `ADMIN`)

**Response 200**: `{ "message": "User deleted" }` (hard delete).
**Response 400**: `{ "message": "Admins cannot delete their own account through this endpoint" }` — khi `:id` trùng chính admin đang gọi.
**Response 404**: user không tồn tại.

---

## `<PublicUser>` (shape dùng chung mọi response ở trên)

```ts
{
  id: number;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: 'ADMIN' | 'USER';
  status: 'PENDING' | 'ACTIVE';
  provider: 'LOCAL' | 'GOOGLE';
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
}
```
