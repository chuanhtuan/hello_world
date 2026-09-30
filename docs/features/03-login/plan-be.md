# Plan BE — Login

> Tham chiếu: `docs/plan/contracts/auth-contracts.md` §login + §Session cookie.
> Status: **locked** (as-built, retroactive).

## As-built (không đổi)

- **Route**: `POST /api/auth/login` (`auth.routes.ts`).
- **Controller**: `login()` (`auth.controller.ts`).
- **Hàm dùng chung**: `issueSession()` (`session.ts`) — dùng chung với
  Activate (mục 2), Google SSO (mục 4).

## Việc cần làm ở bước Plan & Task này

| Task | Mô tả | Loại |
|---|---|---|
| B03-01 | UT `login()` controller — mock `User`, `bcrypt.compare`, cover 5 nhánh: không tồn tại / Google-only / chưa activate (LOCAL) / status≠ACTIVE / sai password / đúng | UT |
| B03-02 | UT `issueSession()` — verify đúng `expiresIn`/`maxAge` theo `remember=true/false` (dùng `jsonwebtoken` decode để check payload+exp) | UT |
| B03-03 | IT-ST: supertest `POST /api/auth/login` trên SQLite test DB, verify status code + `Set-Cookie` header khác nhau giữa remember true/false | IT-ST |
| B03-04 | *(Chờ BA)* Không code — theo dõi 3 Assumption ở `spec.md` mục 3 (Bearer-fallback localStorage — QUAN TRỌNG, brute-force, JWT không thu hồi) | Chờ BA |
