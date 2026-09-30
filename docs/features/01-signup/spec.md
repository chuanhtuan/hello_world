# Spec — Đăng ký tài khoản (Signup)

> Nguồn: `docs/features/01-signup/feature-design.md` (đã review).
> Đối chiếu codebase: `backend/src/controllers/auth.controller.ts`,
> `backend/src/services/activation.service.ts`, `backend/src/models/user.model.ts`.

## 1. User Stories

**US1.1** — Là người dùng chưa có tài khoản, tôi muốn đăng ký chỉ với
Name + Email để tạo tài khoản nhanh mà không phải nghĩ password ngay.
*(trace feature-design §1, §3 bước 1-4)*

- AC: Given form chỉ hiển thị Name + Email (không có password), When
  submit với email chưa từng đăng ký, Then user được tạo với
  `status=PENDING`, `passwordHash=null`, và nhận email kích hoạt.

**US1.2** — Là người dùng đã đăng ký trước đó nhưng chưa kích hoạt và bị
mất/hết hạn email, tôi muốn đăng ký lại bằng cùng email để nhận link
kích hoạt mới, thay vì bị kẹt vĩnh viễn.
*(trace feature-design §3 bước 5c, §4 AC5)*

- AC: Given email đã tồn tại với `status=PENDING`, When submit lại form
  Signup với email đó, Then hệ thống gửi lại 1 token kích hoạt mới (ghi
  đè token cũ) và trả 200, không tạo user trùng.

**US1.3** — Là người dùng lỡ đăng ký lại bằng email đã có tài khoản
`ACTIVE`, tôi muốn được báo lỗi rõ ràng để biết cần đăng nhập thay vì
đăng ký.
*(trace feature-design §4 AC4)*

- AC: Given email đã `ACTIVE`, When submit, Then nhận lỗi 409 hướng dẫn
  "Try logging in instead.", không tạo/sửa gì.

## 2. Edge cases

Đối chiếu với `auth.controller.ts` (schema `signupSchema`) và
`user.model.ts`:

1. **Name toàn khoảng trắng** (`"   "`): `z.string().min(1)` không
   `trim()`, nên chuỗi 1+ khoảng trắng vẫn pass validation → tạo được
   user với tên rỗng về mặt hiển thị. *(gap thật, xem Assumption)*
2. **Email khác hoa/thường** (`Test@Example.com` vs `test@example.com`):
   code không normalize email về lowercase trước khi `findOne`/`create`
   → tuỳ collation DB, có thể tạo 2 record được xem là "khác nhau" dù
   cùng 1 hộp thư thực tế. *(gap thật, xem Assumption)*
3. **Double-submit đồng thời với cùng email mới** (race condition — VD
   double-click, hoặc 2 tab): cả 2 request đều `findOne` không thấy user
   → cả 2 cùng `User.create()` → request thứ 2 vi phạm unique constraint
   trên `email` ở DB, ném lỗi Sequelize không được bắt riêng trong
   `signup()` → rơi vào catch-all của `errorHandler` → trả **500** thay
   vì lỗi thân thiện (409). *(gap thật, xem Assumption)*
4. **Name > 100 ký tự**: `z.string().max(100)` chặn đúng, trả 400 với
   `errors: [{ path: 'name', message }]` (theo `error.middleware.ts`
   xử lý `ZodError`).
5. **Email sai định dạng** (thiếu `@`, thiếu domain...): `z.string().email()`
   chặn đúng, trả 400 tương tự.
6. **Signup qua Google thay vì form Name/Email**: ngoài phạm vi US ở
   trên — xem feature-design mục 4 (Google SSO), không áp dụng validation
   của signup form.

## 3. Requirements

| # | Requirement | Trace |
|---|---|---|
| FR1 | Validate `name` (1-100 ký tự) và `email` (định dạng hợp lệ) trước khi tạo user | feature-design §3 bước 4, §4 AC6 |
| FR2 | Phân nhánh theo trạng thái email đã tồn tại (mới / PENDING / ACTIVE) — 3 kết quả khác nhau | feature-design §3 bước 5, §4 AC2/AC4/AC5 |
| FR3 | User mới luôn khởi tạo `provider=LOCAL`, `passwordHash=null`, `status=PENDING` | feature-design §1, §3 bước 5a |
| NFR1 | Activation token: random 32 byte, lưu hash SHA-256, hết hạn 24h | feature-design §5 |
| NFR2 | Email kích hoạt gửi trong vài giây — chưa có ngưỡng số chính thức | feature-design §5 |

## 4. Key entities

**User** (bảng `users`):
- `id`, `name` (≤100 ký tự), `email` (unique, chưa normalize), `passwordHash` (nullable)
- `status`: `PENDING` | `ACTIVE`
- `provider`: `LOCAL` | `GOOGLE`
- `activationToken` (SHA-256 hash, nullable), `activationTokenExpires` (nullable)
- `role`: `USER` | `ADMIN` (mặc định `USER`, không set được qua form Signup — chỉ admin-invite mới chọn được role, xem feature-design mục 8)

Không có entity phụ nào khác (không có bảng token riêng — token nằm trực tiếp trên `User`).

## 5. Success criteria

- Toàn bộ AC1–AC8 trong feature-design mục 1 pass khi test thủ công hoặc
  automation (UT/IT).
- Không phát sinh user trùng email trong DB dưới bất kỳ kịch bản nào
  (bao gồm race condition ở Edge case #3) — **hiện tại tiêu chí này CHƯA
  đạt** nếu double-submit xảy ra đúng lúc; cần fix hoặc chấp nhận rủi ro
  có ghi nhận (xem Assumption).
- Email kích hoạt luôn chứa đúng link `{clientUrl}/activate/{token}` với
  token đúng 64 ký tự hex (32 byte).

## 6. Assumptions

1. **Name không được trim/validate nội dung** (có thể toàn khoảng
   trắng) — CẦN HỎI BA: có cần trim + validate non-blank không? *Trạng
   thái: đang chờ xác nhận.*
2. **Email không normalize lowercase** trước khi so khớp/lưu — CẦN HỎI
   BA/DBA: có cần chuẩn hoá để tránh 2 tài khoản cùng 1 hộp thư thực tế?
   *Trạng thái: đang chờ xác nhận.*
3. **Race condition double-submit trả lỗi 500** thay vì 409 thân thiện —
   CẦN HỎI BA/Dev: mức ưu tiên fix (bắt lỗi unique-constraint và trả 409)
   so với các việc khác, do tần suất thấp với quy mô solo-dev hiện tại.
   *Trạng thái: đang chờ xác nhận.*
