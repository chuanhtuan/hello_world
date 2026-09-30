# Plan FE — Signup

> Tham chiếu: `docs/plan/contracts/auth-contracts.md` §signup,
> `docs/plan/constraints.md`. Status: **locked** (as-built, retroactive).

## As-built (không đổi)

- **Route**: `/signup` (public, `App.tsx`).
- **Page**: `frontend/src/pages/Signup.tsx`.
- **State**: local `useState` (`name`, `email`, `error`, `message`, `submitting`) — không cần state toàn cục.
- **Gọi API**: qua `useAuth().signup(name, email)` → `POST /api/auth/signup` (xem contract).
- Nút "Sign in with Google" trên cùng trang thuộc **feature 04**, không nằm trong scope plan này.

## Việc cần làm ở bước Plan & Task này

Không có UI/component mới — feature đã triển khai xong. Việc duy nhất
còn thiếu là **test coverage** (dự án chưa có bất kỳ FE test nào, xem
`docs/plan/research.md` §2).

| Task | Mô tả |
|---|---|
| F01-00 | Setup Vitest + Testing Library cho `frontend` (one-time, xem `docs/plan/constraints.md` §Task ID) |
| F01-01 | Viết component test cho `Signup.tsx` theo `testcases-ut.md` |

Không có task nào thay đổi UI/behavior — mọi gap từ `spec.md` (name
không trim, email không normalize) là vấn đề **backend** (data layer),
không xử lý ở FE.
