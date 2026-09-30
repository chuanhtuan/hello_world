# Plan FE — User Admin

> Tham chiếu: `docs/plan/contracts/user-contracts.md` §users.
> Status: **locked** (as-built, retroactive).

## As-built (không đổi)

- **Routes**: `/users` (dưới `AdminRoute`), `/users/:id` (dưới `PrivateRoute` — cho phép self-access, không riêng admin).
- **Pages**: `UserList.tsx` (bảng + form mời inline), `UserDetail.tsx`.
- **Gap đã biết** (mang từ `spec.md`): `UserList.tsx` gọi
  `GET /users` KHÔNG kèm `page`/`pageSize` — không có UI phân trang dù
  API hỗ trợ.

## Việc cần làm ở bước Plan & Task này

| Task | Mô tả |
|---|---|
| F08-01 | Component test `UserList.tsx`: mock `api.get/post/delete`; verify render bảng, mời user thành công thêm dòng đầu bảng, mời trùng email hiển thị lỗi, xoá có/không confirm |
| F08-02 | Component test `UserDetail.tsx`: mock `api.get`; verify hiển thị đúng field, lỗi 403/404 hiển thị message |
| F08-03 | Test `AdminRoute`/`PrivateRoute` cho đúng 3 role-case (chưa đăng nhập/`USER`/`ADMIN`) khi vào `/users` |
| F08-04 | *(Chờ BA)* Không code — theo dõi Assumption "UI chưa phân trang" trước khi quyết định có bổ sung UI mới hay không (nếu có, đây sẽ là task F0x mới ở vòng sau) |
