# Spec — Kích hoạt tài khoản qua email (Activate Account)

> Nguồn: `docs/features/02-activate-account/feature-design.md` (đã review).
> Đối chiếu codebase: `backend/src/controllers/auth.controller.ts`
> (`getActivation`, `activateAccount`, `resendActivation`),
> `frontend/src/pages/ActivateAccount.tsx`.

## 1. User Stories

**US2.1** — Là user vừa đăng ký (`PENDING`), tôi muốn click link trong
email và đặt password để kích hoạt tài khoản và được đăng nhập ngay,
không phải đăng nhập lại thủ công.
*(trace feature-design §3 bước 1-10, §4 AC1/AC5)*

- AC: Given token còn hạn, chưa dùng, When nhập password hợp lệ (≥8 ký
  tự, khớp confirm) và submit, Then `status→ACTIVE`, session được cấp,
  điều hướng thẳng `/profile`.

**US2.2** — Là user có link kích hoạt đã hết hạn hoặc bị thất lạc, tôi
muốn yêu cầu gửi lại link để không bị kẹt vĩnh viễn ở `PENDING`.
*(trace feature-design §3 bước 11, §4 AC7)*

- AC: Given email đang `PENDING`, When gọi resend-activation, Then nhận
  1 token mới qua email, response không tiết lộ tài khoản có tồn tại
  hay không.

**US2.3** — Là user, tôi muốn được cảnh báo ngay khi link kích hoạt
không còn hợp lệ, thay vì nhập xong password rồi mới bị báo lỗi.
*(trace feature-design §3 bước 2-3, §4 AC2)*

- AC: Given token sai/hết hạn, When trang `/activate/:token` tải, Then
  hiển thị ngay màn lỗi, không hiện form đặt password.

## 2. Edge cases

Đối chiếu với `auth.controller.ts` và `ActivateAccount.tsx`:

1. **2 tab cùng mở 1 link activation, cả 2 đều thấy form hợp lệ** (do
   `GET` check ở bước load trang không khoá gì): nếu user submit ở cả 2
   tab, request đầu tiên xử lý xong sẽ xoá `activationToken`; request
   thứ 2 tìm không thấy token khớp → nhận lỗi "invalid or has expired"
   dù vài giây trước vừa thấy form hợp lệ. **Race condition thật, không
   có lock** — kết quả cuối cùng vẫn đúng (chỉ 1 password được set) vì
   không có transaction bảo vệ khoảng giữa `findOne` và `save`, nhưng về
   lý thuyết 2 request có thể xen kẽ và cả 2 đều "thành công" nếu chạy
   đúng thời điểm (TOCTOU) — ghi nhận là gap cần biết, không chặn release.
2. **Password toàn khoảng trắng, đủ 8 ký tự** (VD `"        "`):
   `z.string().min(8)` chỉ đếm độ dài, không kiểm tra nội dung → hợp lệ
   dù không phải password thực sự an toàn.
3. **`resend-activation` không có rate-limit**: gọi lặp lại nhiều lần
   liên tiếp cho cùng 1 email → mỗi lần đều sinh token mới và gửi email
   mới (không giới hạn số lần/khoảng thời gian) → có thể bị lạm dụng để
   spam hộp thư người khác (chỉ cần biết email của họ, không cần sở hữu).
4. **Activate xong rồi mở lại đúng link đó** (token đã bị xoá sau khi
   dùng): nhận lỗi "invalid or has expired" — đúng hành vi mong muốn
   (token dùng 1 lần), đã cover ở feature-design §4 AC6.
5. **Token hợp lệ nhưng backend giữa lúc `GET` (bước 2) và `POST` (bước
   6) vừa hết hạn** (VD user để trang mở qua đêm rồi mới nhập password):
   `POST` sẽ tự validate lại và trả lỗi 400 tương ứng — hệ thống đã xử
   lý đúng trường hợp này (validate lại token ở cả 2 bước).

## 3. Requirements

| # | Requirement | Trace |
|---|---|---|
| FR1 | Token phải được xác thực độc lập ở cả bước hiển thị form (`GET`) và bước submit (`POST`) | feature-design §3 bước 2-3, 6-7 |
| FR2 | Token bị xoá ngay sau khi dùng thành công (dùng 1 lần) | feature-design §3 bước 9, §4 AC6 |
| FR3 | `resendActivation` phải trả response giống nhau bất kể email tồn tại/trạng thái, chỉ thực sự gửi email khi `status=PENDING` | feature-design §3 bước 11, §4 AC7 |
| NFR1 | Token: random 32 byte, hash SHA-256, hết hạn 24h | feature-design §5 |
| NFR2 | Password tối thiểu 8 ký tự, không yêu cầu độ phức tạp | feature-design §5 |

## 4. Key entities

**User** (liên quan tới feature này): `activationToken`,
`activationTokenExpires`, `passwordHash`, `status`. Không có bảng token
riêng — dùng lại field trên `User` (giống Signup).

## 5. Success criteria

- AC1–AC7 trong feature-design mục 2 pass.
- Token luôn bị xoá khỏi DB (`activationToken=null`,
  `activationTokenExpires=null`) ngay sau khi activate thành công —
  kiểm tra trực tiếp qua DB, không chỉ qua response API.
- Resend-activation không bao giờ trả về response khác nhau giữa "email
  không tồn tại" và "email tồn tại nhưng đã ACTIVE" (kiểm tra bằng cách
  so sánh response body ký tự-cho-ký-tự giữa 2 trường hợp).

## 6. Assumptions

1. **`resend-activation` chưa có rate-limit** — CẦN HỎI BA: có cần giới
   hạn số lần gọi/email trong 1 khoảng thời gian để chống spam? *Trạng
   thái: đang chờ xác nhận.*
2. **Race condition 2-tab (TOCTOU) khi activate** không có transaction/
   lock bảo vệ — CẦN HỎI BA/Dev: có cần bổ sung (VD transaction hoặc
   optimistic lock trên token) hay chấp nhận rủi ro ở quy mô hiện tại?
   *Trạng thái: đang chờ xác nhận.*
