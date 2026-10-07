# Test Viewpoint — Login

> Retroactive — xem ghi chú ở `01-signup/test-viewpoint.md`, áp dụng tương tự
> ở đây.

## Màn hình: Login form (`frontend/src/pages/Login.tsx`)

| Khía cạnh | Trạng thái | Ghi chú |
|---|---|---|
| Access | ⚠️ as-built, chưa chốt AC | UT3.11 ghi nhận: KHÔNG có guard chặn user đã login vào lại `/login` — hành vi hiện tại, chưa phải AC chính thức, cần BA xác nhận (giống gap tương tự ở feature 01). |
| UI | ✅ | AC6 test ở UT3.10 (FE). |
| Function | ✅ | UT3.1–UT3.9 + IT3.1–IT3.6 phủ đủ AC1–AC5. |
| Security | ⚠️ GAP — KHÔNG thể đóng bằng testcase | Không có rate-limit/account-lockout cho login sai nhiều lần — đã kiểm tra code, xác nhận chưa có. Đây là endpoint rủi ro cao nhất trong 8 feature (brute-force password) — cần 1 task Dev riêng trước khi viết testcase. Xem ghi chú chung ở `docs/plan/constraints.md`. |
| Data | ✅ | TTL session theo remember test ở cả JWT decode (UT3.8/3.9) và `Set-Cookie` thật (IT3.1/IT3.2). |

## Gaps cần Test Lead quyết định

~~1. Rate-limit / account-lockout.~~ → Xác nhận là thiếu tính năng (không có code) — đã ghi nhận vào `constraints.md` để lên task Dev riêng, **ưu tiên cao nhất** trong toàn bộ các gap phát hiện (endpoint rủi ro cao nhất).
~~2. Hành vi "đã login mà vào lại /login".~~ → Đã ghi nhận as-built ở UT3.11, chờ BA xác nhận.

**Còn lại**: Test Lead review UT3.11 + toàn bộ testcase cũ, chuyển status `approved`. Riêng mục Security vẫn mở cho tới khi Dev thêm rate-limit — không chặn các bước khác của pipeline, nhưng không nên coi feature này "an toàn" cho tới khi xử lý.
