# Test Viewpoint — Logout

> Retroactive — xem ghi chú ở `01-signup/test-viewpoint.md`, áp dụng tương tự
> ở đây.

## Màn hình: Nút Logout trong Navbar (`Navbar.tsx`)

| Khía cạnh | Trạng thái | Ghi chú |
|---|---|---|
| Access | ✅ | AC1 test ở UT6.2 (FE). |
| UI | ✅ | UT6.3 (FE). |
| Function | ✅ | UT6.1 + IT6.1/IT6.2. |
| Security | ✅ (vừa bổ sung) | AC3 giờ có UT6.4 — unit test trực tiếp trên `<PrivateRoute />` (RTL + MemoryRouter, mock `user=null`), rẻ hơn và đủ tin cậy so với phương án ban đầu định dùng Playwright/`qc-automation` cho việc này. IT6.3 (API trả 401) vẫn giữ nguyên làm bằng chứng tầng backend. |
| Data | — | Không áp dụng. |

## Gaps cần Test Lead quyết định

~~1. Bổ sung testcase xác nhận PrivateRoute redirect.~~ → Đã bổ sung UT6.4.

**Còn lại**: Test Lead review UT6.4 + toàn bộ testcase cũ, chuyển status `approved`.
