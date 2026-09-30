# Feature Design — Đăng xuất (Logout)

> Nguồn: `docs/product/raw-business-requirements.md` mục 6.
> Trạng thái: Đã triển khai.
> Tài liệu này sinh **retroactive** từ code đã có
> (`frontend/src/components/Navbar.tsx`,
> `backend/src/controllers/auth.controller.ts` — `logout`,
> `backend/src/utils/session.ts` — `clearSession`) — dùng để
> review/onboarding, và làm nền khi cần sửa/mở rộng feature.

## 1. Business intent

Người dùng cần cách chấm dứt phiên đăng nhập trên thiết bị đang dùng —
đặc biệt quan trọng nếu dùng máy chung/máy công cộng, nơi để phiên đăng
nhập tồn tại sau khi rời đi là rủi ro bảo mật cho chính user đó (đặc biệt
với user đã bật "Remember me", session của họ tồn tại tới 30 ngày — xem
**feature-design mục 3**).

**Đối tượng dùng:** Mọi user đã đăng nhập (không phân biệt role hay
provider).

## 2. Phạm vi (Scope)

Feature này chỉ bao gồm: nút Logout trong Navbar và hành động chấm dứt
phiên hiện tại. Không bao gồm "đăng xuất khỏi tất cả thiết bị" (không có
trong yêu cầu, không có trong code).

## 3. Logic flow

1. User đã đăng nhập thấy nút "Logout" trong Navbar (chỉ hiển thị khi có
   `user`, thay cho link Login/Sign up).
2. User bấm "Logout".
3. Frontend gọi `POST /api/auth/logout`.
4. Backend xoá cookie phiên (`clearSession` — cùng tên cookie, cùng
   thuộc tính `httpOnly`/`secure`/`sameSite` như lúc set, để trình duyệt
   thực sự xoá được cookie) và trả về `{ message: 'Logged out' }`.
5. Frontend xoá token phía client (state auth context) sau khi nhận
   response thành công.
6. Frontend điều hướng về `/login`.

## 4. Acceptance Criteria

- **AC1 — Nút Logout chỉ hiện khi đã đăng nhập:**
  Given user chưa đăng nhập,
  When xem Navbar,
  Then **không** thấy nút Logout — chỉ thấy link Login/Sign up.

- **AC2 — Logout xoá phiên và điều hướng về Login:**
  Given user đã đăng nhập (bất kỳ role/provider nào),
  When bấm Logout,
  Then cookie phiên bị xoá phía server, state đăng nhập phía client bị
  xoá, và trình duyệt điều hướng tới `/login`.

- **AC3 — Sau khi Logout, các trang cần đăng nhập bị chặn lại:**
  Given user vừa Logout thành công,
  When cố truy cập trực tiếp 1 route cần đăng nhập (VD `/profile`),
  Then hệ thống điều hướng lại về `/login` (theo `PrivateRoute`), không
  cho xem nội dung trang đó.

## 5. NFR liên quan

Không có (đúng như raw-business-requirements đã ghi — không có ngưỡng số
nào áp dụng cho hành động này).

## 6. Screen refs

| Màn hình | File | Loại tham chiếu UI |
|---|---|---|
| Nút Logout trong Navbar | `frontend/src/components/Navbar.tsx` | Tự viết tay, đã triển khai |

## 7. Self-check

- [x] Mỗi màn hình liên quan đã ghi rõ loại tham chiếu UI.
- [x] Mọi AC ở dạng Given/When/Then, kiểm chứng được.
- [x] Business intent trả lời "ai đau, tại sao cần".
- [x] NFR không bịa số (ghi rõ "không có" theo đúng nguồn).
- [ ] Gắn vào backlog task / tạo GitHub issue — cần review trước.
