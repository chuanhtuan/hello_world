# Plan BE — Activate Account

> Tham chiếu: `docs/plan/contracts/auth-contracts.md` §activate,
> `docs/plan/data-model.md` §3 (vòng đời token).
> Status: **locked** (as-built, retroactive).

## As-built (không đổi)

- **Routes**: `GET /api/auth/activate/:token`, `POST /api/auth/activate/:token`,
  `POST /api/auth/resend-activation` (`auth.routes.ts`).
- **Controllers**: `getActivation`, `activateAccount`, `resendActivation`
  (`auth.controller.ts`).
- **Hàm dùng chung**: `hashToken()` (`activation.service.ts`) — pure
  function, dùng chung với Signup (mục 1), Admin invite (mục 8), Reset
  password (mục 5, cùng thuật toán khác field).

## Việc cần làm ở bước Plan & Task này

| Task | Mô tả | Loại |
|---|---|---|
| B02-01 | UT `hashToken()` (pure function — input/output cố định, không cần mock gì) | UT |
| B02-02 | UT `getActivation`/`activateAccount`/`resendActivation` — mock `User` model, cover token hợp lệ/hết hạn/đã dùng, password ngắn/không khớp | UT |
| B02-03 | IT-ST: supertest full luồng GET → POST activate trên SQLite test DB, verify token bị xoá sau khi dùng (dùng 1 lần), verify session trả về hợp lệ | IT-ST |
| B02-04 | *(Chờ BA)* Không code — theo dõi 2 Assumption ở `spec.md` mục 2 (rate-limit resend, race condition 2-tab) | Chờ BA |
