# Plan FE — Profile

> Tham chiếu: `docs/plan/contracts/user-contracts.md` §me/§avatar.
> Status: **locked** (as-built, retroactive).

## As-built (không đổi)

- **Routes**: `/profile`, `/profile/edit` (dưới `PrivateRoute`).
- **Pages**: `Profile.tsx` (xem + đổi avatar), `EditProfile.tsx` (sửa tên/email).
- **Gọi API**: `api.post('/users/me/avatar', formData)`,
  `api.put('/users/me', {name, email})`, sau đó `refreshProfile()`
  (`AuthContext`) để đồng bộ lại `user` toàn cục.

## Việc cần làm ở bước Plan & Task này

| Task | Mô tả |
|---|---|
| F07-01 | Component test `Profile.tsx`: hiển thị đúng field, upload avatar thành công gọi `refreshProfile`, upload lỗi hiển thị message | 
| F07-02 | Component test `EditProfile.tsx`: submit thành công điều hướng `/profile`, lỗi 409 hiển thị đúng message và giữ nguyên input |
