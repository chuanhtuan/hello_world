# Feature Design — Kích hoạt tài khoản qua email (Activate Account)

> Nguồn: `docs/product/raw-business-requirements.md` mục 2.
> Trạng thái: Đã triển khai.
> Tài liệu này sinh **retroactive** từ code đã có
> (`frontend/src/pages/ActivateAccount.tsx`,
> `backend/src/controllers/auth.controller.ts` — `getActivation`,
> `activateAccount`, `resendActivation`) — dùng để review/onboarding, và
> làm nền khi cần sửa/mở rộng feature.

## 1. Business intent

Hệ thống cần xác thực rằng người dùng thực sự sở hữu email đã đăng ký
trước khi cho phép họ đăng nhập — giảm rủi ro tài khoản ảo / nhập sai
email lúc đăng ký (xem **feature-design mục 1 — Signup**). Đồng thời, để
người dùng tự đặt password của chính họ (thay vì hệ thống sinh hộ và phải
gửi qua kênh nào đó), giúp password không bao giờ lộ qua bất kỳ log/email
nào ở dạng plaintext.

**Đối tượng dùng:** User vừa Signup (`status = PENDING`), hoặc user được
admin mời (xem **feature-design mục 8**) — cả hai đều đi qua đúng 1 luồng
activation này, không có luồng riêng cho admin-invite.

## 2. Phạm vi (Scope)

Feature này bao gồm: xác thực token khi mở link activate, form đặt
password, chuyển `status → ACTIVE`, tự động đăng nhập sau khi activate
thành công, và endpoint resend khi token hết hạn/thất lạc.

**Ngoài phạm vi:** việc tạo user `PENDING` + sinh token ban đầu (thuộc
feature-design mục 1 — Signup, hoặc mục 8 — admin invite).

## 3. Logic flow

1. User click link trong email dạng `{clientUrl}/activate/{token}`.
2. Frontend gọi `GET /api/auth/activate/:token` để kiểm tra token còn
   hiệu lực trước khi hiển thị form (tránh cho nhập password rồi mới báo
   lỗi).
3. Backend tìm user có `activationToken` khớp (so theo SHA-256 hash của
   token trong URL) **và** `activationTokenExpires` còn trong tương lai:
   - **Không tìm thấy / đã hết hạn** → trả lỗi 400 "This activation link
     is invalid or has expired." → FE hiển thị màn "Activation link
     invalid" kèm link quay về Login, **dừng luồng** (rẽ nhánh lỗi,
     không hiển thị form đặt password).
   - **Tìm thấy, còn hiệu lực** → trả về `{ name, email }` → FE hiển thị
     "Welcome, {name}" + form đặt password.
4. User nhập password + confirm password, bấm "Activate account".
5. Frontend validate confirm khớp password (client-side) trước khi gọi
   API; không khớp → báo lỗi ngay, không gọi API.
6. Frontend gọi `POST /api/auth/activate/:token` với `{ password }`.
7. Backend validate lại token (khớp hash + chưa hết hạn) — nếu giữa bước
   3 và bước 7 token vừa hết hạn/bị dùng, trả lỗi 400 tương tự bước 3.
8. Backend validate password tối thiểu 8 ký tự (400 nếu ngắn hơn).
9. Hợp lệ → backend: hash password (bcrypt), set `status = ACTIVE`, xoá
   `activationToken`/`activationTokenExpires` (token dùng 1 lần), issue
   session (JWT + cookie, tương đương luồng login không remember-me — xem
   **feature-design mục 3**), trả về `{ token, user }`.
10. Frontend nhận session thành công → điều hướng thẳng vào `/profile`
    (không cần user login lại lần nữa).
11. **Nhánh resend:** nếu token hết hạn hoặc email bị thất lạc, user có
    thể gọi `POST /api/auth/resend-activation` với email → nếu email tồn
    tại và đang `PENDING`, hệ thống sinh token mới (ghi đè token cũ) và
    gửi lại email; luôn trả về cùng 1 message trung lập dù email có tồn
    tại/đang PENDING hay không, để không lộ thông tin tài khoản cho người
    lạ.

## 4. Acceptance Criteria

- **AC1 — Token hợp lệ hiển thị đúng form:**
  Given user click link activation với token còn hạn và chưa dùng,
  When trang `/activate/:token` tải xong,
  Then hiển thị "Welcome, {name đúng của user}" và form 2 field Password
  + Confirm password (không có field Name/Email).

- **AC2 — Token không hợp lệ/hết hạn bị chặn ngay:**
  Given token sai, đã hết hạn (>24h), hoặc đã được dùng trước đó,
  When mở link activation,
  Then hệ thống hiển thị thông báo lỗi rõ ràng ("invalid or has
  expired") kèm link quay lại Login, **không** hiển thị form đặt password.

- **AC3 — Confirm password không khớp bị chặn phía client:**
  Given form đặt password đang hiển thị,
  When user nhập Password và Confirm password khác nhau rồi submit,
  Then hệ thống báo lỗi "Passwords do not match" ngay trên form và
  **không** gọi API activate.

- **AC4 — Password quá ngắn bị từ chối:**
  Given Password và Confirm password khớp nhau nhưng dưới 8 ký tự,
  When submit,
  Then hệ thống từ chối (400, "Password must be at least 8 characters"),
  tài khoản vẫn giữ `status = PENDING`.

- **AC5 — Activate thành công chuyển trạng thái & tự đăng nhập:**
  Given token hợp lệ, password hợp lệ (≥8 ký tự, khớp confirm),
  When submit,
  Then user được set `passwordHash` (bcrypt), `status = ACTIVE`, token
  activation bị xoá (không dùng lại được lần 2); hệ thống trả về session
  hợp lệ và frontend điều hướng thẳng tới `/profile` mà không cần đăng
  nhập lại.

- **AC6 — Token dùng 1 lần:**
  Given user đã activate thành công 1 lần,
  When cố mở lại đúng link activation đó lần nữa,
  Then hệ thống báo lỗi "invalid or has expired" (vì token đã bị xoá sau
  khi dùng) — không cho activate lại hay đổi password qua đường này.

- **AC7 — Resend activation không lộ thông tin tài khoản:**
  Given bất kỳ email nào (tồn tại hay không, đang PENDING hay đã ACTIVE),
  When gọi resend-activation với email đó,
  Then response luôn là cùng 1 message trung lập ("If that email needs
  activation, a new link has been sent."); email mới **chỉ thực sự được
  gửi** khi email tồn tại và đang ở `status = PENDING`.

## 5. NFR liên quan

- **Thời hạn activation token:** 24 giờ kể từ lúc sinh (chốt trong code
  qua `env.activationTokenTtlMs`), dùng chung cho cả Signup và admin
  invite.
- **Token lưu trữ:** hash SHA-256 trong DB, không lưu token gốc; token là
  chuỗi ngẫu nhiên 32 byte (`crypto.randomBytes(32)`).
- **Độ dài password tối thiểu:** 8 ký tự (chốt trong code qua Zod
  schema) — chưa có yêu cầu độ phức tạp (chữ hoa/số/ký tự đặc biệt).
- **Thời gian phản hồi resend email:** chưa có ngưỡng số chính thức
  (tương tự mục 1 — Signup).

## 6. Screen refs

| Màn hình | File | Loại tham chiếu UI |
|---|---|---|
| Activate Account (check token + đặt password) | `frontend/src/pages/ActivateAccount.tsx` | Tự viết tay, đã triển khai |

## 7. Self-check

- [x] Mỗi màn hình liên quan đã ghi rõ loại tham chiếu UI.
- [x] Mọi AC ở dạng Given/When/Then, kiểm chứng được.
- [x] Business intent trả lời "ai đau, tại sao cần".
- [x] NFR không bịa số khi chưa có ngưỡng chính thức.
- [ ] Gắn vào backlog task / tạo GitHub issue — cần review trước.
