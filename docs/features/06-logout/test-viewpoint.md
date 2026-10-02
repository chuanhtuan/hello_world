# Test Viewpoint — Logout

> Retroactive — xem ghi chú ở `01-signup/test-viewpoint.md`, áp dụng tương tự
> ở đây.

## Màn hình: Nút Logout trong Navbar (`Navbar.tsx`)

| Khía cạnh | Trạng thái | Ghi chú |
|---|---|---|
| Access | ✅ | AC1 (nút chỉ hiện khi đã login) test ở UT6.2 (FE). |
| UI | ✅ | UT6.3 (FE, click gọi đúng `logout()` rồi `navigate`). |
| Function | ✅ | UT6.1 + IT6.1/IT6.2 (idempotent khi không có cookie). |
| Security | ⚠️ GAP (một phần) | AC3 (sau logout, route cần đăng nhập bị chặn) được test ở tầng API (IT6.3: `/users/me` trả 401 khi không còn cookie), nhưng KHÔNG có testcase xác nhận `PrivateRoute` ở FE thực sự điều hướng về `/login` khi session đã mất — hiện chỉ suy luận gián tiếp từ 401. |
| Data | — | Không áp dụng cho feature này. |

## Gaps cần Test Lead quyết định

1. Bổ sung 1 testcase FE (Playwright, chạy ở `qc-automation`) xác nhận `PrivateRoute` redirect về `/login` thật sự xảy ra khi truy cập `/profile` sau khi đã logout — hiện AC3 mới chỉ được chứng minh một nửa (tầng API), chưa chứng minh ở tầng UI.
