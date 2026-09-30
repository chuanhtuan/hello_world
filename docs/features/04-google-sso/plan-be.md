# Plan BE — Google SSO

> Tham chiếu: `docs/plan/contracts/auth-contracts.md` §google,
> `docs/plan/research.md` §2.4 (mock `google-auth-library`).
> Status: **locked** (as-built, retroactive).

## As-built (không đổi)

- **Route**: `POST /api/auth/google` (`auth.routes.ts`).
- **Controller**: `googleAuth()` (`auth.controller.ts`), dùng
  `OAuth2Client` (`google-auth-library`).

## Việc cần làm ở bước Plan & Task này

| Task | Mô tả | Loại |
|---|---|---|
| B04-01 | UT `googleAuth()` — mock `OAuth2Client.prototype.verifyIdToken` trả payload giả, cover: email chưa verify / tạo mới / liên kết theo `googleId` / liên kết theo `email` (tài khoản LOCAL có sẵn) / thiếu `GOOGLE_CLIENT_ID` | UT |
| B04-02 | IT-ST: supertest `POST /api/auth/google` trên SQLite test DB (mock `verifyIdToken` ở tầng module), verify DB state sau khi tạo mới và sau khi liên kết | IT-ST |
| B04-03 | *(Chờ BA)* Không code — theo dõi 2 Assumption ở `spec.md` mục 4 (dọn `activationToken` rác, không tick được Remember me từ Signup) | Chờ BA |
