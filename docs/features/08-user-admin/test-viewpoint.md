# Test Viewpoint — User Admin

> Retroactive — xem ghi chú ở `01-signup/test-viewpoint.md`, áp dụng tương tự
> ở đây.

## Màn hình: UserList + form mời user (`UserList.tsx`)

| Khía cạnh | Trạng thái | Ghi chú |
|---|---|---|
| Access | ⚠️ GAP (một phần) | AC1 test đủ ở tầng API (IT8.2: role USER → 403), nhưng KHÔNG có testcase FE xác nhận `AdminRoute` thực sự điều hướng user thường về `/profile` / user chưa login về `/login`. |
| UI | ⚠️ GAP | Không có testcase cho bảng hiển thị đúng N dòng/cột (AC2) ở mức render — chỉ có UT8.11 (cancel dialog không gọi API). |
| Function | ✅ | UT8.1–UT8.4 + IT8.1/IT8.3/IT8.4 phủ đủ AC2 (phân trang mặc định), AC3, AC4. |
| Security | ✅ (mạnh) | Đây là feature có coverage bảo mật tốt nhất: AC6 (IDOR giữa user thường/admin, UT8.6/8.7, IT8.5) và AC8 (admin tự xoá chính mình, UT8.8, IT8.6) đều được test tường minh ở cả 2 tầng. |
| Data | ✅ | Pagination clamp 100 (UT8.2) — lưu ý đã biết: UI chưa dùng phân trang (NFR gap, không phải test gap, đã ghi trong feature-design mục 5). |

## Màn hình: UserDetail (`UserDetail.tsx`)

| Khía cạnh | Trạng thái | Ghi chú |
|---|---|---|
| Access | ✅ | AC6 test đủ (UT8.6/8.7, IT8.5). |
| UI | ⚠️ GAP | AC5 (hiển thị đúng hồ sơ người khác, không phải của admin) không có testcase render FE riêng, chỉ có API test (UT8.5). |
| Function | ✅ | Xem bảng trên. |
| Security | ✅ | Xem bảng trên. |
| Data | — | — |

## Gaps cần Test Lead quyết định

1. Bổ sung testcase FE cho `AdminRoute` (redirect đúng cho user thường / chưa login).
2. Bổ sung testcase render cho bảng UserList (AC2) và trang UserDetail (AC5).
3. Rủi ro hard-delete (đã ghi trong feature-design) — xác nhận lại với PM có cần soft-delete trước khi feature này coi là ổn định lâu dài, không phải việc của testcase nhưng nên nhắc lại ở đây để Test Lead không bỏ sót khi review.
