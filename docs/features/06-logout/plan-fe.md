# Plan FE — Logout

> Tham chiếu: `docs/plan/contracts/auth-contracts.md` §logout.
> Status: **locked** (as-built, retroactive).

## As-built (không đổi)

- **Component**: `Navbar.tsx` — nút Logout chỉ hiện khi `user` khác `null`.
- **Gọi API**: `useAuth().logout()` → `POST /auth/logout`, sau đó xoá
  `localStorage` + `setUser(null)` + điều hướng `/login`.

## Việc cần làm ở bước Plan & Task này

| Task | Mô tả |
|---|---|
| F06-01 | Component test `Navbar.tsx`: verify nút Logout ẩn/hiện đúng theo `user`; verify bấm Logout gọi đúng thứ tự API → xoá localStorage → điều hướng |
| F06-02 | Test tích hợp nhỏ: sau logout, truy cập route `PrivateRoute` phải bị đẩy về `/login` (dùng `MemoryRouter` của Testing Library) |
