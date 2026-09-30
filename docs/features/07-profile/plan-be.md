# Plan BE — Profile

> Tham chiếu: `docs/plan/contracts/user-contracts.md` §me/§avatar,
> `docs/plan/research.md` §2.4 (mock S3).
> Status: **locked** (as-built, retroactive).

## As-built (không đổi)

- **Routes**: `GET/PUT /api/users/me`, `POST /api/users/me/avatar`
  (`user.routes.ts`, sau `authenticate`).
- **Controllers**: `getMyProfile`, `updateMyProfile`, `uploadMyAvatar`
  (`user.controller.ts`).
- **Middleware**: `avatarUpload` (multer, memory storage, 5MB,
  `image/*` only).

## Việc cần làm ở bước Plan & Task này

| Task | Mô tả | Loại |
|---|---|---|
| B07-01 | UT `updateMyProfile()` — mock `User`, cover: đổi tên/email hợp lệ, đổi sang email trùng user khác (409), đổi sang chính email hiện tại (không query trùng thừa) | UT |
| B07-02 | UT `uploadMyAvatar()` — mock `S3Client.send`, `User`; cover: không có file (400), upload thành công (verify `Key` đúng format `avatars/{id}/{uuid}.{ext}`) | UT |
| B07-03 | IT-ST: supertest `PUT /api/users/me` trên SQLite test DB (auth giả lập qua JWT test helper); `POST /api/users/me/avatar` với S3 mock ở module level | IT-ST |
| B07-04 | *(Chờ BA)* Không code — theo dõi 3 Assumption ở `spec.md` mục 7 (đổi email không re-verify — QUAN TRỌNG, name không trim, không dọn S3 rác) | Chờ BA |
