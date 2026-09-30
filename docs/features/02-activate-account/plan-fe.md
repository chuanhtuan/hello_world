# Plan FE — Activate Account

> Tham chiếu: `docs/plan/contracts/auth-contracts.md` §activate,
> `docs/plan/constraints.md`. Status: **locked** (as-built, retroactive).

## As-built (không đổi)

- **Route**: `/activate/:token` (public, `App.tsx`).
- **Page**: `frontend/src/pages/ActivateAccount.tsx`.
- **State**: `checkState` (`checking`/`valid`/`invalid`), `name`,
  `password`, `confirmPassword`, `error`, `submitting`.
- **Gọi API**: `GET /auth/activate/:token` khi mount (qua `api` trực
  tiếp, không qua `AuthContext`); `useAuth().activateAccount(token, password)`
  → `POST /auth/activate/:token` khi submit.
- Sau khi thành công: `AuthContext` tự lưu session (giống Login), điều
  hướng `/profile`.

## Việc cần làm ở bước Plan & Task này

| Task | Mô tả |
|---|---|
| F02-01 | Component test `ActivateAccount.tsx` theo `testcases-ut.md` (kế thừa tooling từ F01-00) |

Không có UI/component mới.
