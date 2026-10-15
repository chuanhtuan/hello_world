# Test Viewpoint — Google SSO

> **Trạng thái duyệt**: `approved` — Test Lead (Chu Anh Tuan) sign-off ngày 2026-10-15.

> Retroactive — xem ghi chú ở `01-signup/test-viewpoint.md`, áp dụng tương tự
> ở đây.

## Màn hình: Nút Google trong Login + Signup (`Login.tsx`, `Signup.tsx`)

| Khía cạnh | Trạng thái | Ghi chú |
|---|---|---|
| Access | ✅ | Public, cùng điều kiện truy cập với Login/Signup — không cần testcase riêng. |
| UI | ✅ (vừa bổ sung) | AC6 giờ có UT4.9 (FE). |
| Function | ✅ | UT4.2–UT4.4 + IT4.1–IT4.2 phủ đủ AC1 (tạo mới), AC2 (liên kết tài khoản LOCAL có sẵn). |
| Security | ✅ | AC3 (email chưa verify bị chặn) test ở cả UT4.1 lẫn IT4.3; AC5 (server chưa cấu hình `GOOGLE_CLIENT_ID`) test ở UT4.5. |
| Data | ✅ (vừa bổ sung) | AC4 giờ có UT4.7/UT4.8 (unit, xác nhận `issueSession` nhận đúng `remember` + default) và IT4.4 (integration, xác nhận `Set-Cookie Max-Age` 30 ngày). |

## Gaps cần Test Lead quyết định

~~1. Bổ sung testcase cho AC4 (remember me qua Google).~~ → Đã bổ sung UT4.7/UT4.8/IT4.4.
~~2. Bổ sung testcase FE cho AC6 (Google onError).~~ → Đã bổ sung UT4.9.

Cả 2 file (`testcases-ut.md` + `testcases-it-st.md`) đã có đủ coverage theo Test Viewpoint và đã được Test Lead duyệt (xem trạng thái ở đầu file) — `qc-automation` được phép chạy trên bộ testcase này.
