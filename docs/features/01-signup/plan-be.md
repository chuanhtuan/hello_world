# Plan BE — Signup

> Tham chiếu: `docs/plan/contracts/auth-contracts.md` §signup,
> `docs/plan/data-model.md`, `docs/plan/constraints.md`.
> Status: **locked** (as-built, retroactive).

## As-built (không đổi)

- **Route**: `POST /api/auth/signup` (`backend/src/routes/auth.routes.ts`).
- **Controller**: `signup()` trong `auth.controller.ts`.
- **Validation**: `signupSchema` (Zod, khai báo inline, hiện **chưa
  export**).
- **Service dùng chung**: `createPendingUserAndSendActivation()`
  (`activation.service.ts`) — dùng chung với admin-invite (feature 08).
- **DB**: bảng `User` đã có đủ field, không cần migration mới.

## Việc cần làm ở bước Plan & Task này

Dự án chưa có test framework nào (xem `research.md` §2). Cần setup
1 lần (dùng chung cho mọi feature sau) + viết UT/IT cho riêng feature
này.

| Task | Mô tả | Loại |
|---|---|---|
| B01-00 | Setup Vitest + supertest + SQLite in-memory test DB cho `backend` (one-time, xem `constraints.md` §Task ID); spike xác nhận ENUM/`STRING(1024)` chạy đúng trên SQLite (câu hỏi mở ở `research.md` §3) | Setup |
| B01-01 | Export `signupSchema` (đổi `const signupSchema = ...` → `export const signupSchema = ...`, **không đổi hành vi**) để unit-test trực tiếp; viết UT cho schema (tên rỗng/toàn space/quá 100 ký tự, email sai định dạng) | UT |
| B01-02 | UT cho `signup()` controller — mock `User.findOne`/`User.create`/`sendActivationEmail`, cover đủ 3 nhánh (email mới / PENDING / ACTIVE) | UT |
| B01-03 | IT-ST: supertest gọi thật `POST /api/auth/signup` trên app + SQLite test DB, verify đúng response contract + đúng dữ liệu ghi vào DB (token hash, expiry) cho cả 3 nhánh | IT-ST |
| B01-04 | **Không tự làm** — chỉ tạo issue "chờ BA xác nhận" cho 3 Assumption trong `spec.md` mục 1 (name không trim, email không normalize, race-condition trả 500) trước khi có task sửa code thật | Chờ BA |

B01-04 **không phải task code** — đây là placeholder nhắc lại đúng
nguyên tắc `plan-and-tasks`: không tự quyết thay BA. Khi BA xác nhận,
mới tách thành task code cụ thể.
