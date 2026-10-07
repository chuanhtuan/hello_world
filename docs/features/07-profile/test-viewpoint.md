# Test Viewpoint — Profile

> Retroactive — xem ghi chú ở `01-signup/test-viewpoint.md`, áp dụng tương tự
> ở đây.

## Màn hình: Xem Profile (`Profile.tsx`) + Edit Profile (`EditProfile.tsx`)

| Khía cạnh | Trạng thái | Ghi chú |
|---|---|---|
| Access | ✅ (gián tiếp) | Dùng chung `PrivateRoute`, đã test ở feature 06 (UT6.4, IT6.3) — không lặp lại ở đây. |
| UI | ✅ (vừa bổ sung) | AC1 (Profile hiển thị đúng field + placeholder) giờ có UT7.7; Edit Profile pre-fill giờ có UT7.8. Testcase mới, CHƯA qua Test Lead review. |
| Function | ✅ | UT7.1–UT7.5 + IT7.1–IT7.5 phủ đủ AC2, AC3, AC4, AC5. |
| Security | ✅ (gián tiếp) | AC6 đảm bảo qua thiết kế API (`/users/me`), test IDOR ở feature 08 (UT8.6/8.7, IT8.5) dùng chung endpoint `/users/:id`. |
| Data | ✅ | Avatar mimetype + size limit (UT7.4/7.5, IT7.4/7.5). |

## Gaps cần Test Lead quyết định

~~1. Bổ sung testcase FE cho AC1 + Edit Profile pre-fill.~~ → Đã bổ sung UT7.7/UT7.8.

**Còn lại**: Test Lead review UT7.7/UT7.8 + toàn bộ testcase cũ, chuyển status `approved`.
