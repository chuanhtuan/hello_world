# Test Viewpoint — Profile

> Retroactive — xem ghi chú ở `01-signup/test-viewpoint.md`, áp dụng tương tự
> ở đây.

## Màn hình: Xem Profile (`Profile.tsx`) + Edit Profile (`EditProfile.tsx`)

| Khía cạnh | Trạng thái | Ghi chú |
|---|---|---|
| Access | ✅ (gián tiếp) | Yêu cầu đăng nhập qua `PrivateRoute` — dùng chung cơ chế đã test ở feature 06 (IT6.3), không cần lặp lại testcase riêng ở đây. |
| UI | ⚠️ GAP | KHÔNG có testcase FE nào cho cả 2 màn (hiển thị đúng field ở Profile — AC1, pre-fill đúng ở Edit Profile) — toàn bộ testcase của feature này là backend (trừ UT7.6 là phản ứng lỗi, không phải hiển thị đúng). |
| Function | ✅ | UT7.1–UT7.5 + IT7.1–IT7.5 phủ đủ AC2 (sửa tên/email), AC3 (email trùng), AC4/AC5 (avatar). |
| Security | ✅ (gián tiếp) | AC6 (chỉ sửa được hồ sơ chính mình) đảm bảo vì API luôn dùng `/users/me` (không nhận `:id` từ client) — không cần testcase IDOR riêng ở đây, đã được feature 08 (AC6, UT8.6/8.7) test ở endpoint `/users/:id` dùng chung. |
| Data | ✅ | Avatar mimetype + size limit test đủ (UT7.4/7.5, IT7.4/7.5). |

## Gaps cần Test Lead quyết định

1. Bổ sung testcase FE cho AC1 (Profile hiển thị đúng field của chính user, kể cả placeholder chữ cái đầu khi chưa có avatar) và cho việc Edit Profile pre-fill đúng dữ liệu hiện tại.
