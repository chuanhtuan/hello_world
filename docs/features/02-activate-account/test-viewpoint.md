# Test Viewpoint — Activate Account

> Retroactive — xem ghi chú ở `01-signup/test-viewpoint.md`, áp dụng tương tự
> ở đây.

## Màn hình: Activate Account (`frontend/src/pages/ActivateAccount.tsx`)

| Khía cạnh | Trạng thái | Ghi chú |
|---|---|---|
| Access | ✅ | Public, xác thực qua token trong URL, không cần đăng nhập. |
| UI | ✅ | UT2.7 (checking state), UT2.8 (confirm mismatch); AC2 (màn lỗi) đã xác nhận đúng qua code (`ActivateAccount.tsx` render heading "Activation link invalid" + message + link Login khi `checkState==='invalid'`) — testcase API (UT2.2, IT2.2/2.3) coi là đủ vì component chỉ render thẳng theo state, không có logic phụ cần test riêng ở FE. |
| Function | ✅ | UT2.1–UT2.11 + IT2.1–IT2.5 phủ đủ AC1, AC2, AC4, AC5, AC6, AC7. |
| Security | ✅ | Token hash SHA-256 (UT2.1), one-time use (AC6, IT2.2), resend không lộ thông tin tài khoản (UT2.9/2.10). |
| Data | ✅ (vừa bổ sung) | Boundary password = 8 ký tự giờ có UT2.11, nhất quán với feature 05. |

## Gaps cần Test Lead quyết định

~~1. Bổ sung testcase FE cho màn lỗi AC2.~~ → Xác nhận lại code: component chỉ render theo state đã được API test xác nhận đúng, không cần thêm testcase FE riêng (khác AC1/AC7 ở feature 01, nơi có logic điều kiện phức tạp hơn ở FE).
~~2. Bổ sung testcase boundary password = 8 ký tự.~~ → Đã bổ sung UT2.11.

**Còn lại**: Test Lead review UT2.11 + toàn bộ testcase cũ, chuyển status `approved`.
