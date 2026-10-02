# Test Viewpoint — Activate Account

> Retroactive — xem ghi chú ở `01-signup/test-viewpoint.md`, áp dụng tương tự
> ở đây.

## Màn hình: Activate Account (`frontend/src/pages/ActivateAccount.tsx`)

| Khía cạnh | Trạng thái | Ghi chú |
|---|---|---|
| Access | ✅ | Public, xác thực qua token trong URL, không cần đăng nhập — đúng thiết kế, không cần testcase access/role riêng. |
| UI | ⚠️ GAP (một phần) | UT2.7 (checking state) + UT2.8 (confirm mismatch) có, nhưng AC2 ("Activation link invalid" + link quay Login hiển thị đúng khi token sai) **không có testcase FE** — chỉ test ở tầng API (UT2.2, IT2.2/2.3). |
| Function | ✅ | UT2.1–UT2.10 + IT2.1–IT2.5 phủ đủ AC1, AC2, AC4, AC5, AC6, AC7 (resend). |
| Security | ✅ | Token hash SHA-256 (UT2.1), one-time use (AC6, IT2.2), resend không lộ thông tin tài khoản (UT2.9/2.10 — message giống nhau). |
| Data | ⚠️ GAP | Password boundary **đúng 8 ký tự** (hợp lệ) chưa có testcase riêng — chỉ có case <8 ký tự bị reject (UT2.4, IT2.4). So sánh: feature 05 (Forgot/Reset) có UT5.5 test đúng biên 8 ký tự, feature này thì không. |

## Gaps cần Test Lead quyết định

1. Bổ sung testcase FE cho màn hình lỗi "invalid or expired" (AC2) — hiện chỉ xác nhận ở tầng API.
2. Bổ sung 1 testcase boundary password = 8 ký tự (pass) để nhất quán với feature 05.
