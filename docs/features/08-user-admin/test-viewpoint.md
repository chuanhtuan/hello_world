# Test Viewpoint — User Admin

> Retroactive — xem ghi chú ở `01-signup/test-viewpoint.md`, áp dụng tương tự
> ở đây.

## Màn hình: UserList + form mời user (`UserList.tsx`)

| Khía cạnh | Trạng thái | Ghi chú |
|---|---|---|
| Access | ✅ (vừa bổ sung) | AC1 giờ có UT8.12/UT8.13 (FE, `AdminRoute` redirect cho role USER / chưa login), bổ sung cho IT8.2 (API 403) đã có từ trước. |
| UI | ✅ (vừa bổ sung) | AC2 giờ có UT8.14 (render bảng đúng dữ liệu mock). |
| Function | ✅ | UT8.1–UT8.4 + IT8.1/IT8.3/IT8.4. |
| Security | ✅ (mạnh) | AC6 (UT8.6/8.7, IT8.5), AC8 (UT8.8, IT8.6). |
| Data | ✅ | Pagination clamp 100 (UT8.2) — lưu ý UI chưa dùng phân trang, đã ghi nhận ở feature-design mục 5, không phải test gap. |

## Màn hình: UserDetail (`UserDetail.tsx`)

| Khía cạnh | Trạng thái | Ghi chú |
|---|---|---|
| Access | ✅ | AC6 (UT8.6/8.7, IT8.5). |
| UI | ✅ (vừa bổ sung) | AC5 giờ có UT8.15 (render đúng hồ sơ của user được xem, không phải của admin). |
| Function | ✅ | Xem bảng trên. |
| Security | ✅ | Xem bảng trên. |
| Data | — | — |

## Gaps cần Test Lead quyết định

~~1. Bổ sung testcase FE cho AdminRoute.~~ → Đã bổ sung UT8.12/UT8.13.
~~2. Bổ sung testcase render cho UserList/UserDetail.~~ → Đã bổ sung UT8.14/UT8.15.
3. Rủi ro hard-delete (đã ghi trong feature-design) — **vẫn còn mở**, đây là quyết định sản phẩm (cần soft-delete hay không), không thể đóng bằng testcase. Nhắc lại để không bị bỏ sót khi review.

**Còn lại**: Test Lead review UT8.12–UT8.15 + toàn bộ testcase cũ, chuyển status `approved`.
