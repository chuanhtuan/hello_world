# Plan FE — Login

> Tham chiếu: `docs/plan/contracts/auth-contracts.md` §login,
> `docs/plan/constraints.md`. Status: **locked** (as-built, retroactive).

## As-built (không đổi)

- **Route**: `/login` (public).
- **Page**: `frontend/src/pages/Login.tsx`.
- **State**: local (`email`, `password`, `remember`, `error`, `submitting`).
- **Gọi API**: `useAuth().login(email, password, remember)` →
  `POST /auth/login`.
- `persistSession()` trong `AuthContext.tsx` luôn ghi token vào
  `localStorage` bất kể `remember` — đây chính là root cause của
  Assumption #1 (spec.md mục 3) — **không sửa ở bước Plan này**, chỉ
  viết test để phơi bày rõ hành vi hiện tại, chờ BA quyết định.

## Việc cần làm ở bước Plan & Task này

| Task | Mô tả |
|---|---|
| F03-01 | Component test `Login.tsx` theo `testcases-ut.md` (kế thừa tooling F01-00) |
| F03-02 | Test riêng cho `AuthContext.persistSession` phơi bày rõ hành vi "token luôn vào localStorage bất kể remember" — dùng làm bằng chứng khi hỏi BA (spec.md Assumption #1) |
