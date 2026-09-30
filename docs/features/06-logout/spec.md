# Spec — Đăng xuất (Logout)

> Nguồn: `docs/features/06-logout/feature-design.md` (đã review).
> Đối chiếu codebase: `backend/src/controllers/auth.controller.ts` (`logout`),
> `backend/src/utils/session.ts` (`clearSession`),
> `frontend/src/components/Navbar.tsx`, `frontend/src/context/AuthContext.tsx`.

## 1. User Stories

**US6.1** — Là user đã đăng nhập, tôi muốn đăng xuất khỏi thiết bị đang
dùng để bảo vệ tài khoản khi dùng máy chung/máy công cộng.
*(trace feature-design §3, §4 AC2)*

## 2. Edge cases

Đối chiếu `auth.controller.ts`, `session.ts`, `AuthContext.tsx`:

1. **[Liên quan Login US3.1 Edge case #1 và #4]** Logout chỉ xoá cookie
   phía server + xoá `localStorage` phía trình duyệt hiện tại — **JWT
   đã phát hành không bị đưa vào blacklist nào phía server** (thiết kế
   stateless). Nếu token đó đã từng bị copy ra nơi khác (VD dán vào
   Postman, lưu ở 1 tab/thiết bị khác chưa đóng), token đó **vẫn dùng
   được** cho tới khi tự hết hạn (tối đa 30 ngày nếu là phiên Remember
   me) — Logout không thực sự "thu hồi" quyền truy cập trên toàn hệ
   thống, chỉ dừng ở thiết bị hiện tại.
2. **Gọi `POST /api/auth/logout` khi không có session nào** (chưa từng
   đăng nhập, hoặc token đã hết hạn): route này **không** đi qua
   `authenticate` middleware (xem `auth.routes.ts`), nên luôn chạy
   `clearSession` và trả 200 "Logged out" bất kể có cookie hợp lệ hay
   không — hành vi **idempotent**, gọi lại nhiều lần không gây lỗi.
3. **Nhiều tab cùng đăng nhập, logout ở 1 tab**: chỉ tab gọi logout xoá
   được `localStorage` của chính nó (cùng origin nên `localStorage`
   dùng chung giữa các tab) → thực tế các tab khác **cũng mất token**
   ngay khi truy cập lại `localStorage` (vì đã bị xoá), nhưng nếu tab
   khác đã giữ token trong 1 biến JS ở memory (không đọc lại từ
   `localStorage`) thì request tiếp theo của tab đó vẫn có thể dùng
   Bearer cũ cho tới khi tab đó reload — cạnh biên nhỏ, ít ảnh hưởng
   thực tế vì hầu hết action đều gọi lại `localStorage.getItem('token')`
   qua interceptor của `api/client.ts`.

## 3. Requirements

| # | Requirement | Trace |
|---|---|---|
| FR1 | Xoá cookie phiên với đúng thuộc tính đã set lúc login (`httpOnly`/`secure`/`sameSite`) để trình duyệt thực sự xoá được | feature-design §3 bước 4 |
| FR2 | Client phải tự xoá token khỏi `localStorage` sau khi logout thành công (server không quản lý được localStorage) | feature-design §3 bước 5 |
| FR3 | Sau logout, các route cần đăng nhập phải chặn lại truy cập | feature-design §4 AC3 |

## 4. Key entities

Không có entity DB riêng — thao tác thuần trên cookie (server) và
`localStorage` (client). Session là JWT stateless, không lưu bảng riêng.

## 5. Success criteria

- AC1–AC3 trong feature-design mục 6 pass.
- Sau khi logout, gọi lại bất kỳ API nào cần `authenticate` bằng
  cookie/localStorage cũ của trình duyệt đó đều trả 401 (do cookie đã
  bị xoá và `localStorage` đã bị xoá) — token cũ (nếu bị lộ ra ngoài
  trình duyệt đó) vẫn hoạt động cho tới hết hạn, đây là giới hạn kiến
  trúc đã biết (xem Assumption), không phải lỗi cần fix trong scope
  feature này.

## 6. Assumptions

1. **Không có cơ chế thu hồi JWT phía server (stateless, không
   blacklist)** — cùng root cause với assumption đã nêu ở feature-design
   mục 3 (Login) và mục 8 (User Admin, khi xoá user) — CẦN HỎI BA: có
   chấp nhận rủi ro "logout không thu hồi được token đã lộ ra ngoài
   trình duyệt hiện tại" ở quy mô hệ thống hiện tại, hay cần đầu tư
   session lưu server-side (VD Redis blacklist / short-lived token +
   refresh token)? *Trạng thái: đang chờ xác nhận — quyết định này ảnh
   hưởng đồng thời tới Login, Logout, và User Admin (xoá user).*
