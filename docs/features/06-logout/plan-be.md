# Plan BE — Logout

> Tham chiếu: `docs/plan/contracts/auth-contracts.md` §logout.
> Status: **locked** (as-built, retroactive).

## As-built (không đổi)

- **Route**: `POST /api/auth/logout` — **không** qua `authenticate`
  middleware (xem `auth.routes.ts`), nên luôn chạy được.
- **Controller**: `logout()` gọi `clearSession()` (`session.ts`).

## Việc cần làm ở bước Plan & Task này

| Task | Mô tả | Loại |
|---|---|---|
| B06-01 | UT `logout()`: verify `clearCookie` được gọi với đúng tên cookie + đúng options như lúc set; verify response luôn 200 kể cả khi request không có cookie nào | UT |
| B06-02 | IT-ST: supertest gọi `/logout` không kèm cookie (case chưa từng đăng nhập) và có kèm cookie hợp lệ — cả 2 đều 200; verify header `Set-Cookie` xoá đúng cookie | IT-ST |
| B06-03 | *(Chờ BA)* Không code — theo dõi Assumption dùng chung với mục 3/8: JWT không có cơ chế thu hồi | Chờ BA |
