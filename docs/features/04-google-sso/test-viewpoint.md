# Test Viewpoint — Google SSO

> Retroactive — xem ghi chú ở `01-signup/test-viewpoint.md`, áp dụng tương tự
> ở đây.

## Màn hình: Nút Google trong Login + Signup (`Login.tsx`, `Signup.tsx`)

| Khía cạnh | Trạng thái | Ghi chú |
|---|---|---|
| Access | ✅ | Public, cùng điều kiện truy cập với Login/Signup — không cần testcase riêng. |
| UI | ⚠️ GAP | AC6 (Google `onError` → hiển thị "Google sign-in failed", KHÔNG gọi backend) **không có testcase nào** — đây là 1 AC tường minh trong feature-design nhưng 0 testcase UT/IT nào trace về nó. |
| Function | ✅ | UT4.2–UT4.4 + IT4.1–IT4.2 phủ đủ AC1 (tạo mới), AC2 (liên kết tài khoản LOCAL có sẵn). |
| Security | ✅ | AC3 (email chưa verify bị chặn) test ở cả UT4.1 lẫn IT4.3; AC5 (server chưa cấu hình `GOOGLE_CLIENT_ID`) test ở UT4.5. |
| Data | ⚠️ GAP | AC4 (Remember me từ trang Login áp dụng đúng khi login qua Google) **không có testcase nào** — đây cũng là AC tường minh nhưng chưa được verify, kể cả ở mức unit (`issueSession` có nhận đúng `remember` khi đi qua nhánh Google hay không). |

## Gaps cần Test Lead quyết định

1. **Ưu tiên cao**: bổ sung testcase cho AC4 (remember me qua Google) — hiện là lỗ hổng rõ ràng nhất trong cả 8 feature vì AC có ghi tường minh nhưng 0% được test.
2. Bổ sung testcase FE cho AC6 (Google onError).
