# Spec — Đăng nhập / Đăng ký qua Google (SSO)

> Nguồn: `docs/features/04-google-sso/feature-design.md` (đã review).
> Đối chiếu codebase: `backend/src/controllers/auth.controller.ts` (`googleAuth`),
> `frontend/src/pages/Login.tsx`, `frontend/src/pages/Signup.tsx`.

## 1. User Stories

**US4.1** — Là user có sẵn Google account, tôi muốn đăng nhập/đăng ký
bằng Google mà không cần tạo thêm password mới.
*(trace feature-design §3 bước 1-6, §4 AC1)*

**US4.2** — Là user đã có tài khoản LOCAL (đăng ký bằng email/password
trước đó), tôi muốn Google tự liên kết vào đúng tài khoản đó theo email,
không tạo tài khoản trùng.
*(trace feature-design §3 bước 5, §4 AC2)*

**US4.3** — Là hệ thống, tôi phải từ chối đăng nhập nếu Google chưa xác
thực email đó, để không vô tình tin tưởng 1 email chưa được xác minh.
*(trace feature-design §3 bước 4, §4 AC3)*

## 2. Edge cases

Đối chiếu `auth.controller.ts` (`googleAuth`):

1. **Email Google trùng với 1 tài khoản LOCAL đang `PENDING`** (đăng ký
   qua Signup nhưng chưa activate): code tìm theo `googleId` trước
   (không thấy) → tìm theo `email` (thấy) → liên kết `googleId`, set
   `status=ACTIVE` ngay → tài khoản "nhảy cóc" qua toàn bộ bước
   activation (feature-design mục 2). **`activationToken` cũ trên user
   đó không bị xoá** dù không còn ý nghĩa (user đã ACTIVE) → dữ liệu rác
   vô hại (token hết hạn tự nhiên sau 24h), nhưng đáng ghi nhận.
2. **User đã liên kết Google, sau đó đổi email qua Edit Profile**
   (feature-design mục 7): lần login Google tiếp theo vẫn khớp đúng qua
   `googleId` (ưu tiên tìm theo `googleId` trước `email`) → không bị lạc
   tài khoản. *(Đây là hành vi đúng, không phải gap — ghi nhận để tránh
   hiểu nhầm khi viết test.)*
3. **`payload.email_verified = false`**: bị chặn ở bước verify, trả 400
   — đã cover ở feature-design §4 AC3.
4. **`GOOGLE_CLIENT_ID` chưa cấu hình trên server**: trả 500 rõ ràng,
   không rơi vào lỗi mơ hồ — đã cover ở feature-design §4 AC5.
5. **Google trả `payload.name` rỗng**: fallback
   `payload.email.split('@')[0]` — luôn có ít nhất 1 ký tự vì email hợp
   lệ luôn có phần trước `@`, không gây lỗi rỗng.
6. **User bấm nút Google từ trang Signup** (không có checkbox Remember
   me trên UI đó): `handleGoogleSuccess` trong `Signup.tsx` gọi
   `loginWithGoogle(credential, false)` — luôn `remember=false` bất kể
   ý định của user, không có cách tick Remember me khi Google-signup từ
   trang Signup (chỉ có ở trang Login).

## 3. Requirements

| # | Requirement | Trace |
|---|---|---|
| FR1 | Verify ID token qua Google (chữ ký + đúng `audience`) trước khi tin bất kỳ field nào trong payload | feature-design §3 bước 4 |
| FR2 | Chỉ chấp nhận khi `email_verified=true` | feature-design §3 bước 4, §4 AC3 |
| FR3 | Ưu tiên tìm user theo `googleId`, sau đó mới theo `email`, để liên kết đúng thay vì tạo trùng | feature-design §3 bước 5, §4 AC2 |
| FR4 | Tài khoản tạo/liên kết qua Google luôn `status=ACTIVE` ngay, bỏ qua activation | feature-design §1, §3 bước 5 |
| NFR1 | Cần cấu hình `GOOGLE_CLIENT_ID` hợp lệ trên cả FE lẫn BE | feature-design §5 |

## 4. Key entities

**User**: `googleId` (unique, nullable), `provider`, `avatarUrl`,
`status`. Không có entity phụ nào khác — Google chỉ là 1 cách xác thực
bổ sung trên cùng bảng `User`.

## 5. Success criteria

- AC1–AC6 trong feature-design mục 4 pass.
- Không có tài khoản trùng lặp được tạo khi cùng 1 email đăng nhập cả 2
  cách (LOCAL trước, Google sau hoặc ngược lại) — kiểm tra bằng cách
  đếm số record `User` theo email sau khi thực hiện cả 2 luồng.

## 6. Assumptions

1. **`activationToken` không được dọn khi tài khoản `PENDING` được
   kích hoạt tức thời qua Google** — dữ liệu rác vô hại nhưng nên hỏi rõ
   — CẦN HỎI BA/Dev: có cần dọn field này khi liên kết Google (ưu tiên
   thấp, không ảnh hưởng chức năng)? *Trạng thái: đang chờ xác nhận.*
2. **Không thể tick "Remember me" khi Google-signup từ trang Signup**
   (luôn `remember=false`) — CẦN HỎI BA: đây có phải hành vi mong muốn,
   hay cần thêm lựa chọn? *Trạng thái: đang chờ xác nhận.*
