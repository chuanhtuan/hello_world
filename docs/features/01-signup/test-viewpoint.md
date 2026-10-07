# Test Viewpoint — Signup

> Retroactive: testcase (`testcases-ut.md`/`testcases-it-st.md`) đã được viết
> trước khi Test Viewpoint này tồn tại (qua skill cũ `plan-and-tasks`). File
> này suy ngược từ AC (`feature-design.md` §4) + testcase đã có, để xác nhận
> không thiếu khía cạnh nào — đúng mục đích Test Viewpoint, chỉ làm sau thay
> vì trước như quy trình chuẩn.

## Màn hình: Signup form (`frontend/src/pages/Signup.tsx`)

| Khía cạnh | Trạng thái | Ghi chú |
|---|---|---|
| Access | ⚠️ as-built, chưa chốt AC | UT1.13 ghi nhận: KHÔNG có guard chặn user đã login vào lại `/signup` — hành vi hiện tại, chưa phải AC chính thức, cần BA xác nhận. |
| UI | ✅ (vừa bổ sung) | AC1 (UT1.11) + AC7 (UT1.12) giờ có testcase FE. Testcase mới, CHƯA qua Test Lead review. |
| Function | ✅ | UT1.7–UT1.10 (controller) + IT1.1–IT1.5 (supertest) phủ đủ AC2, AC4, AC5, AC6. |
| Security | ⚠️ GAP — KHÔNG thể đóng bằng testcase | Không có rate-limit/chống spam trên `POST /api/auth/signup` — đã kiểm tra `backend/src/app.ts` + toàn bộ middleware, xác nhận chưa có middleware rate-limit nào trong code. Đây là thiếu TÍNH NĂNG, không phải thiếu test — cần 1 task Dev riêng (thêm `express-rate-limit` hoặc tương đương) trước khi viết testcase. Xem ghi chú chung ở `docs/plan/constraints.md`. |
| Data | ✅ | Boundary `name` 101 ký tự (UT1.3), email case-sensitivity trên MySQL thật (IT1.6). |

## Gaps cần Test Lead quyết định

~~1. Bổ sung testcase FE cho AC1 + AC7.~~ → Đã bổ sung UT1.11/UT1.12.
~~2. Quyết định rate-limit.~~ → Xác nhận là thiếu tính năng (không có code), đã ghi nhận vào `constraints.md` để lên task Dev riêng — KHÔNG đóng bằng testcase ở đây.
~~3. Hành vi "đã login mà vào /signup".~~ → Đã ghi nhận as-built ở UT1.13, chờ BA xác nhận có cần chặn hay không.

**Còn lại**: Test Lead review UT1.11–UT1.13 + review lại toàn bộ testcase cũ, chuyển status `approved`.
