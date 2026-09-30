# Feature Design — Đăng nhập bằng Email + Password, kèm "Remember me"

> Nguồn: `docs/product/raw-business-requirements.md` mục 3.
> Trạng thái: Đã triển khai.
> Tài liệu này sinh **retroactive** từ code đã có
> (`frontend/src/pages/Login.tsx`,
> `backend/src/controllers/auth.controller.ts` — `login`,
> `backend/src/utils/session.ts`) — dùng để review/onboarding, và làm nền
> khi cần sửa/mở rộng feature.

## 1. Business intent

Người dùng đã có tài khoản cần đăng nhập lại để tiếp tục dùng hệ thống.
Người dùng thường xuyên truy cập không muốn phải nhập lại email/password
mỗi lần mở trình duyệt — "Remember me" giải quyết friction này bằng cách
kéo dài thời gian phiên đăng nhập, đổi lại là rủi ro bảo mật cao hơn nếu
dùng máy chung (nên mặc định KHÔNG bật).

**Đối tượng dùng:** User đã `ACTIVE`, có password (`provider = LOCAL`).

## 2. Phạm vi (Scope)

Feature này bao gồm: form Login (email, password, checkbox Remember me),
xử lý phiên đăng nhập theo remember me, và các thông báo lỗi hướng dẫn
đúng cách đăng nhập khi tài khoản chưa đủ điều kiện.

**Ngoài phạm vi** (chỉ tham chiếu):

- Nút "Sign in with Google" hiển thị cùng trang Login → xem
  **feature-design mục 4 — Google SSO**.
- Link "Forgot password?" → xem **feature-design mục 5**.
- Đăng ký tài khoản mới → xem **feature-design mục 1**.

## 3. Logic flow

1. User vào trang `/login`, thấy form Email + Password + checkbox
   "Remember me" (mặc định **không** check) + nút Google + link "Forgot
   password?" / "Sign up".
2. User nhập email + password, tuỳ chọn tick "Remember me", bấm "Log in".
3. Frontend gọi `POST /api/auth/login` với `{ email, password, remember }`.
4. Backend tìm user theo email:
   - **Không tồn tại** → trả lỗi 401 "Invalid email or password" (không
     tiết lộ email có tồn tại hay không).
   - **Tồn tại nhưng `passwordHash = null`:**
     - Nếu `provider = GOOGLE` → lỗi 400 "This account uses Google
       Sign-In. Please continue with Google." (hướng dẫn đúng cách đăng
       nhập).
     - Ngược lại (tài khoản LOCAL nhưng chưa activate) → lỗi 403 "Please
       activate your account first - check your email for the
       activation link."
   - **Tồn tại, có password, nhưng `status != ACTIVE`** → lỗi 403 tương
     tự (chưa activate).
   - **Tồn tại, có password, `status = ACTIVE`** → so sánh password
     (bcrypt); sai → lỗi 401 "Invalid email or password"; đúng → tiếp
     bước 5.
5. Backend issue session: sinh JWT + set cookie.
   - `remember = false` → cookie session (mất khi đóng trình duyệt),
     JWT hết hạn theo `JWT_EXPIRES_IN_DEFAULT` (mặc định 1 ngày).
   - `remember = true` → cookie tồn tại 30 ngày (`maxAge`), JWT hết hạn
     theo `JWT_EXPIRES_IN_REMEMBER` (mặc định 30 ngày).
6. Frontend nhận `{ token, user }` thành công → điều hướng tới
   `/profile`.
7. Lỗi ở bất kỳ bước nào (400/401/403) → frontend hiển thị message lỗi
   trên form, giữ nguyên input để user sửa/thử lại.

## 4. Acceptance Criteria

- **AC1 — Đăng nhập thành công, không Remember me:**
  Given user `ACTIVE`, có password đúng, checkbox Remember me **không**
  tick,
  When submit,
  Then đăng nhập thành công, điều hướng `/profile`, và session là cookie
  phiên (hết khi đóng browser) với JWT hết hạn theo `JWT_EXPIRES_IN_DEFAULT`
  (mặc định 1 ngày).

- **AC2 — Đăng nhập thành công, có Remember me:**
  Given user `ACTIVE`, có password đúng, checkbox Remember me **có**
  tick,
  When submit,
  Then đăng nhập thành công, và cookie session tồn tại 30 ngày với JWT
  hết hạn theo `JWT_EXPIRES_IN_REMEMBER` (mặc định 30 ngày).

- **AC3 — Sai email hoặc sai password:**
  Given email không tồn tại, hoặc email tồn tại nhưng password sai,
  When submit,
  Then hệ thống trả lỗi 401 "Invalid email or password" — thông báo
  **giống nhau** cho cả 2 trường hợp (không tiết lộ email có tồn tại).

- **AC4 — Tài khoản chưa activate (LOCAL):**
  Given user tồn tại với `provider = LOCAL` nhưng `status = PENDING`
  (chưa từng activate, kể cả trường hợp chưa có password),
  When submit đúng email (password bất kỳ),
  Then hệ thống trả lỗi 403 hướng dẫn "Please activate your account
  first - check your email for the activation link."

- **AC5 — Tài khoản Google chưa từng đặt password:**
  Given user tồn tại với `provider = GOOGLE` và chưa từng set password
  (`passwordHash = null`),
  When submit form Login bằng email/password của tài khoản đó,
  Then hệ thống trả lỗi 400 "This account uses Google Sign-In. Please
  continue with Google." — không nhầm lẫn với lỗi sai password.

- **AC6 — Lỗi hiển thị đúng chỗ, giữ input:**
  Given bất kỳ lỗi nào ở AC3–AC5,
  When frontend nhận lỗi,
  Then message lỗi hiển thị ngay trên form Login, email/password đã nhập
  **không bị xoá** để user sửa lại.

## 5. NFR liên quan

- **Thời hạn phiên mặc định:** 1 ngày (`JWT_EXPIRES_IN_DEFAULT`, mặc
  định code là `1d`) — đã chốt trong code, có thể override qua biến môi
  trường.
- **Thời hạn phiên Remember me:** 30 ngày (`JWT_EXPIRES_IN_REMEMBER`,
  mặc định code là `30d`), cookie tương ứng cũng set `maxAge` 30 ngày.
- **Cookie:** `httpOnly`, `sameSite=lax`, `secure` chỉ bật ở production
  (`isProd`) — đã chốt trong code, ghi lại làm tham chiếu bảo mật.

## 6. Screen refs

| Màn hình | File | Loại tham chiếu UI |
|---|---|---|
| Login form | `frontend/src/pages/Login.tsx` | Tự viết tay, đã triển khai |

## 7. Self-check

- [x] Mỗi màn hình liên quan đã ghi rõ loại tham chiếu UI.
- [x] Mọi AC ở dạng Given/When/Then, kiểm chứng được.
- [x] Business intent trả lời "ai đau, tại sao cần".
- [x] NFR không bịa số khi chưa có ngưỡng chính thức (ở đây các số đã
      chốt sẵn trong code nên được ghi trực tiếp).
- [ ] Gắn vào backlog task / tạo GitHub issue — cần review trước.
