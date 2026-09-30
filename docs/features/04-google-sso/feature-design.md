# Feature Design — Đăng nhập / Đăng ký qua Google (SSO)

> Nguồn: `docs/product/raw-business-requirements.md` mục 4.
> Trạng thái: Đã triển khai, đã verify hoạt động trên production.
> Tài liệu này sinh **retroactive** từ code đã có
> (`frontend/src/pages/Login.tsx`, `frontend/src/pages/Signup.tsx`,
> `backend/src/controllers/auth.controller.ts` — `googleAuth`) — dùng để
> review/onboarding, và làm nền khi cần sửa/mở rộng feature.

## 1. Business intent

Người dùng đã có sẵn Google account không muốn phải nhớ thêm một password
mới cho hệ thống này — giảm friction đăng ký/đăng nhập. Vì Google đã xác
thực email thay hệ thống, tài khoản tạo qua Google có thể `ACTIVE` ngay,
bỏ qua hoàn toàn bước activation qua email (xem **feature-design mục 2**)
— vừa nhanh hơn cho user, vừa giảm rủi ro "email không xác thực được"
(vốn là lý do activation tồn tại ở luồng LOCAL).

**Đối tượng dùng:** User mới (chưa từng có tài khoản) hoặc user cũ (đã
đăng ký bằng email/password) muốn dùng thêm/thay bằng Google.

## 2. Phạm vi (Scope)

Feature này bao gồm: nút "Sign in with Google" trên cả 2 trang Login và
Signup, xác thực ID token phía backend, tạo mới hoặc liên kết tài khoản,
và áp dụng Remember me giống luồng đăng nhập thường.

**Ngoài phạm vi:** luồng LOCAL signup/login/activation (feature-design
mục 1, 2, 3) — chỉ tham chiếu khi mô tả cách 2 luồng giao nhau (liên kết
tài khoản cùng email).

## 3. Logic flow

1. User bấm nút "Sign in with Google" (xuất hiện cả ở `/login` và
   `/signup`, cùng component `GoogleLogin` từ `@react-oauth/google`, cấu
   hình `GoogleOAuthProvider` ở `main.tsx`).
2. Google trả về `credential` (ID token) cho frontend qua callback
   `onSuccess`.
   - Nếu Google báo lỗi (`onError`) → frontend hiển thị "Google sign-in
     failed" ngay, **không** gọi backend.
3. Frontend gọi `POST /api/auth/google` với `{ credential, remember }`:
   - Từ trang Login: `remember` lấy theo checkbox "Remember me" user đã
     tick trên form Login.
   - Từ trang Signup: luôn gửi `remember = false` (trang Signup không có
     checkbox Remember me).
4. Backend verify ID token với Google (`verifyIdToken`, kiểm tra đúng
   `audience` = Client ID đã cấu hình):
   - Token không hợp lệ, hoặc email trong token **chưa được Google xác
     thực** (`email_verified = false`) → lỗi 400 "Google account email
     is not verified" — dừng luồng, không tạo/sửa user.
   - Server chưa cấu hình `GOOGLE_CLIENT_ID` → lỗi 500 "Google Sign-In is
     not configured on the server".
5. Backend tìm user theo `googleId` (ưu tiên) rồi theo `email`:
   - **Tìm thấy theo googleId, hoặc theo email (tài khoản LOCAL có sẵn
     cùng email)** → **liên kết**: gán `googleId` nếu chưa có, set
     `status = ACTIVE`, set `avatarUrl` từ Google nếu user chưa có avatar
     riêng. Tài khoản LOCAL cũ (nếu có password) **vẫn giữ được** password
     đó — user có thể đăng nhập bằng cả 2 cách sau bước này.
   - **Không tìm thấy** → tạo user mới: `name` lấy từ Google profile (hoặc
     phần trước `@` của email nếu Google không trả tên), `provider =
     GOOGLE`, `status = ACTIVE` ngay, `avatarUrl` từ Google, không có
     `passwordHash`.
6. Backend issue session (JWT + cookie) giống hệt luồng Login thường (xem
   **feature-design mục 3**), tôn trọng `remember`.
7. Frontend nhận `{ token, user }` → điều hướng tới `/profile`.

## 4. Acceptance Criteria

- **AC1 — Đăng ký mới qua Google, không cần activation:**
  Given email trong Google account chưa từng tồn tại trong hệ thống,
  When user đăng nhập thành công qua Google,
  Then hệ thống tạo user mới với `status = ACTIVE` ngay lập tức,
  `provider = GOOGLE`, **không** gửi activation email, và user được đăng
  nhập thẳng vào `/profile`.

- **AC2 — Liên kết vào tài khoản LOCAL có sẵn cùng email:**
  Given đã tồn tại 1 tài khoản `provider = LOCAL` với email trùng với
  Google account,
  When user đăng nhập bằng Google với email đó,
  Then hệ thống liên kết `googleId` vào đúng user đó (không tạo user
  trùng), set `status = ACTIVE` nếu trước đó đang `PENDING`, và
  `passwordHash` cũ (nếu có) **không bị xoá** — user vẫn đăng nhập được
  bằng password cũ sau này.

- **AC3 — Email Google chưa xác thực bị chặn:**
  Given ID token trả về có `email_verified = false`,
  When backend verify token,
  Then hệ thống từ chối với lỗi 400 "Google account email is not
  verified", không tạo/sửa user nào.

- **AC4 — Remember me áp dụng đúng khi đăng nhập qua Google từ trang Login:**
  Given user tick "Remember me" trên trang Login rồi chọn "Sign in with
  Google",
  When đăng nhập Google thành công,
  Then session được cấp theo đúng NFR "remember" (30 ngày) — giống hệt
  hành vi Remember me của login thường (xem feature-design mục 3, AC2).

- **AC5 — Google chưa cấu hình trên server:**
  Given biến môi trường `GOOGLE_CLIENT_ID` chưa được set,
  When user cố đăng nhập qua Google,
  Then hệ thống trả lỗi 500 rõ ràng "Google Sign-In is not configured on
  the server (missing GOOGLE_CLIENT_ID)." thay vì lỗi mơ hồ.

- **AC6 — Lỗi từ chính Google (huỷ popup, mất mạng...):**
  Given Google trả lỗi ở bước xin credential (chưa tới được backend),
  When `onError` được gọi,
  Then frontend hiển thị "Google sign-in failed" ngay, không gọi
  `POST /api/auth/google`.

## 5. NFR liên quan

- Không có ngưỡng số riêng cho luồng này; độ trễ phụ thuộc Google OAuth
  (đúng như raw-business-requirements đã ghi — chưa cần bổ sung số nào).
- **Cấu hình bắt buộc:** `GOOGLE_CLIENT_ID` (backend), Client ID +
  domain HTTPS thật cho `GoogleOAuthProvider` (frontend) — đã cấu hình
  trên production (`https://46.137.205.212.nip.io`).

## 6. Screen refs

| Màn hình | File | Loại tham chiếu UI |
|---|---|---|
| Nút Google trong Login | `frontend/src/pages/Login.tsx` | Tự viết tay, đã triển khai |
| Nút Google trong Signup | `frontend/src/pages/Signup.tsx` | Tự viết tay, đã triển khai |

## 7. Self-check

- [x] Mỗi màn hình liên quan đã ghi rõ loại tham chiếu UI.
- [x] Mọi AC ở dạng Given/When/Then, kiểm chứng được.
- [x] Business intent trả lời "ai đau, tại sao cần".
- [x] NFR không bịa số khi chưa có ngưỡng chính thức.
- [ ] Gắn vào backlog task / tạo GitHub issue — cần review trước.
