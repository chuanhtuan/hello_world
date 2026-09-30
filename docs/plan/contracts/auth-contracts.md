# Contracts — `/api/auth/*` (LOCKED)

> Nguồn đối chiếu: `backend/src/routes/auth.routes.ts`,
> `backend/src/controllers/auth.controller.ts`. Đây là **nguồn tham
> chiếu chung** giữa FE và BE — không đổi request/response shape mà
> không thông báo lại cả 2 phía.
> Status: **locked** (mô tả đúng hành vi đã triển khai, retroactive).

## POST /api/auth/signup — feature 01

**Request**
```json
{ "name": "string (1-100)", "email": "string (email hợp lệ)" }
```

**Response 201** (email mới)
```json
{ "message": "Account created. Check your email for a link to set your password and activate your account." }
```

**Response 200** (email đã tồn tại, đang PENDING → resend)
```json
{ "message": "This email is already registered but not yet activated. We sent a new activation link." }
```

**Response 409** (email đã ACTIVE)
```json
{ "message": "An account with this email already exists. Try logging in instead." }
```

**Response 400** (validation lỗi — format chung cho mọi ZodError)
```json
{ "message": "Validation error", "errors": [{ "path": "email", "message": "Invalid email" }] }
```

---

## GET /api/auth/activate/:token — feature 02

**Response 200**
```json
{ "name": "string", "email": "string" }
```

**Response 400**
```json
{ "message": "This activation link is invalid or has expired." }
```

## POST /api/auth/activate/:token — feature 02

**Request**
```json
{ "password": "string (>=8)" }
```

**Response 200**
```json
{ "token": "string (JWT)", "user": { "id": 1, "name": "...", "email": "...", "avatarUrl": null, "role": "USER", "status": "ACTIVE", "provider": "LOCAL", "createdAt": "...", "updatedAt": "..." } }
```
Kèm `Set-Cookie` (cookie phiên, xem session contract bên dưới).

**Response 400**: token invalid/expired, hoặc password <8 ký tự.

## POST /api/auth/resend-activation — feature 02

**Request**: `{ "email": "string" }`
**Response 200** (luôn giống nhau, không tiết lộ trạng thái tài khoản):
```json
{ "message": "If that email needs activation, a new link has been sent." }
```

---

## POST /api/auth/login — feature 03

**Request**
```json
{ "email": "string", "password": "string", "remember": "boolean (optional, default false)" }
```

**Response 200**: giống hệt shape ở `activate` (token + user) + `Set-Cookie`.

**Response 401**: `{ "message": "Invalid email or password" }` (dùng chung cho sai email và sai password).

**Response 400**: `{ "message": "This account uses Google Sign-In. Please continue with Google." }`

**Response 403**: `{ "message": "Please activate your account first - check your email for the activation link." }`

### Session cookie (dùng chung cho login/activate/google)

| | `remember=false` | `remember=true` |
|---|---|---|
| Cookie | session cookie (không `maxAge`) | `maxAge=30d` |
| JWT `expiresIn` | `JWT_EXPIRES_IN_DEFAULT` (mặc định `1d`) | `JWT_EXPIRES_IN_REMEMBER` (mặc định `30d`) |
| Thuộc tính cookie | `httpOnly`, `sameSite=lax`, `secure` (chỉ prod) | như bên trái |

Tên cookie: `env.cookieName` (mặc định `hw_token`).

---

## POST /api/auth/google — feature 04

**Request**
```json
{ "credential": "string (Google ID token)", "remember": "boolean (optional, default false)" }
```

**Response 200**: giống shape login (token + user + cookie).
**Response 400**: `{ "message": "Google account email is not verified" }`
**Response 500**: `{ "message": "Google Sign-In is not configured on the server (missing GOOGLE_CLIENT_ID)." }`

---

## POST /api/auth/logout — feature 06

**Request**: không body.
**Response 200**: `{ "message": "Logged out" }` — luôn 200, kể cả khi không có session (idempotent).
Kèm `Set-Cookie` xoá cookie (`clearCookie`).

---

## POST /api/auth/forgot-password — feature 05

**Request**: `{ "email": "string" }`
**Response 200** (luôn giống nhau bất kể email tồn tại/trạng thái nào):
```json
{ "message": "If that email is registered, a reset link has been sent." }
```

## POST /api/auth/reset-password/:token — feature 05

**Request**: `{ "password": "string (>=8)" }`
**Response 200**: `{ "message": "Password has been reset. You can now log in." }`
**Response 400**: token invalid/expired, hoặc password <8 ký tự.

---

## Quy ước lỗi chung (áp dụng mọi endpoint trên)

| Status | Khi nào | Shape |
|---|---|---|
| 400 | `ZodError` (validation) | `{ message: "Validation error", errors: [{path, message}] }` |
| 400 | `ApiError(400, ...)` (nghiệp vụ) | `{ message: string }` |
| 401/403/404/409/500 | `ApiError(status, ...)` | `{ message: string }` |
| 500 (không rõ nguyên nhân) | lỗi runtime không lường trước | `{ message: string }` — production ẩn chi tiết, dev hiện `err.message` |
