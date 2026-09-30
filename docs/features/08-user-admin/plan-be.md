# Plan BE — User Admin

> Tham chiếu: `docs/plan/contracts/user-contracts.md` §users.
> Status: **locked** (as-built, retroactive).

## As-built (không đổi)

- **Routes**: `GET/POST /api/users`, `GET/DELETE /api/users/:id`
  (`user.routes.ts`).
- **Controllers**: `listUsers`, `createUser`, `getUserById`, `deleteUser`
  (`user.controller.ts`).
- **Dùng chung**: `createPendingUserAndSendActivation()` — cùng hàm với
  Signup (mục 1).

## Việc cần làm ở bước Plan & Task này

| Task | Mô tả | Loại |
|---|---|---|
| B08-01 | UT `listUsers()` — mock `User.findAndCountAll`, verify `page`/`pageSize` mặc định + query param truyền đúng xuống | UT |
| B08-02 | UT `createUser()` — mock `User.findOne`, `createPendingUserAndSendActivation`; cover email đã tồn tại (409, khác hành vi resend của Signup) và email mới (201) | UT |
| B08-03 | UT `getUserById()` — cover 3 case quyền: admin xem người khác, user thường xem chính mình, user thường xem người khác (403) | UT |
| B08-04 | UT `deleteUser()` — cover tự xoá chính mình (400), user không tồn tại (404), xoá hợp lệ | UT |
| B08-05 | IT-ST: supertest full luồng list/create/get/delete trên SQLite test DB với JWT admin/user thường | IT-ST |
| B08-06 | *(Chờ BA)* Không code — theo dõi 3 Assumption ở `spec.md` mục 8 (UI chưa phân trang, không giới hạn số admin, JWT không thu hồi — liên kết chung B03-04/B06-03) | Chờ BA |
