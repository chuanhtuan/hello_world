# Feature Design — Đăng ký tài khoản (Signup)

> Nguồn: `docs/product/raw-business-requirements.md` mục 1.
> Trạng thái: Đã triển khai, đã deploy production (`46.137.205.212.nip.io`).
> Tài liệu này sinh **retroactive** từ code đã có (`frontend/src/pages/Signup.tsx`,
> `backend/src/controllers/auth.controller.ts`, `backend/src/services/activation.service.ts`)
> — dùng để review/onboarding, và làm nền khi cần sửa/mở rộng feature.

## 1. Business intent

Người dùng mới muốn tạo tài khoản để dùng hệ thống, nhưng không nên bị bắt
nhập password ngay ở bước đăng ký — điều này giảm friction cho người dùng,
đồng thời đảm bảo họ sở hữu email thật trước khi được phép đặt password.
Với chủ ứng dụng, việc tài khoản chưa xác thực (`PENDING`) không thể đăng
nhập giúp an tâm hơn về chất lượng dữ liệu user và giảm rủi ro tài khoản ảo.

**Đối tượng dùng:** Người dùng chưa có tài khoản trong hệ thống.

## 2. Phạm vi (Scope)

Feature này **chỉ** bao gồm: form Signup (Name + Email), tạo user
`PENDING`, và gửi email kích hoạt.

**Ngoài phạm vi** (liên quan nhưng thuộc feature khác, chỉ tham chiếu):

- Luồng click link kích hoạt, đặt password, chuyển `status = ACTIVE` →
  xem **feature-design mục 2 — Kích hoạt tài khoản qua email**.
- Nút "Sign up with Google" hiển thị cùng trang Signup nhưng đi theo luồng
  hoàn toàn khác (tạo/link tài khoản `ACTIVE` ngay, không qua activation
  email) → xem **feature-design mục 4 — Đăng nhập/Đăng ký qua Google**.
- Admin mời user mới (cũng tạo `PENDING` + gửi activation email, nhưng do
  admin thực hiện thay vì user tự đăng ký) → xem **feature-design mục 8 —
  Quản trị người dùng**.

## 3. Logic flow

1. User vào trang `/signup`, thấy form 2 field **Name** và **Email** (bắt
   buộc nhập cả hai, không có field password) + nút "Sign up with Google".
2. User nhập Name + Email, bấm "Create account".
3. Frontend gọi `POST /api/auth/signup` với `{ name, email }`.
4. Backend validate input:
   - `name`: không rỗng, tối đa 100 ký tự.
   - `email`: đúng định dạng email.
   - Sai định dạng → trả lỗi validation (400), **không** tạo user, dừng
     luồng tại đây (rẽ nhánh lỗi).
5. Backend kiểm tra email đã tồn tại trong hệ thống chưa:
   - **5a. Email chưa tồn tại** → tạo user mới: `status = PENDING`,
     `provider = LOCAL`, `passwordHash = null`; sinh activation token
     (random, lưu dưới dạng SHA-256 hash, hết hạn sau 24h); gửi email
     kích hoạt chứa link `{clientUrl}/activate/{token}`; trả về **201**
     kèm message xác nhận.
   - **5b. Email đã tồn tại và tài khoản đó `ACTIVE`** → trả lỗi **409**
     "An account with this email already exists. Try logging in
     instead." Không tạo, không sửa gì.
   - **5c. Email đã tồn tại nhưng tài khoản đó vẫn `PENDING`** (đăng ký
     trước đó nhưng chưa từng activate) → cập nhật lại tên, sinh token
     kích hoạt **mới** (ghi đè token cũ), gửi lại email kích hoạt, trả về
     **200** báo đã gửi lại link. Không tạo user trùng lặp.
6. Frontend nhận response:
   - Thành công (201 hoặc 200) → thay form bằng thông báo thành công +
     link "Back to login".
   - Lỗi (400/409) → hiển thị lỗi ngay trên form, giữ nguyên dữ liệu đã
     nhập để user sửa.

## 4. Acceptance Criteria

- **AC1 — Form chỉ có Name + Email:**
  Given trang `/signup` vừa tải xong,
  When user chưa nhập gì và bấm submit,
  Then form chặn submit (bắt buộc Name và Email), và không có field
  password nào hiển thị trên form.

- **AC2 — Đăng ký thành công với email mới:**
  Given Name và Email hợp lệ, Email chưa từng đăng ký trong hệ thống,
  When user submit form,
  Then hệ thống trả về **201**, tạo 1 user mới với `status = PENDING`,
  `passwordHash = null`, `provider = LOCAL`.

- **AC3 — Email kích hoạt được gửi đúng cách:**
  Given AC2 vừa xảy ra,
  When kiểm tra hộp thư của email vừa đăng ký,
  Then nhận được 1 email chứa link dạng `{clientUrl}/activate/{token}`;
  trong DB, token được lưu dưới dạng **SHA-256 hash** (không lưu token
  gốc), và có hạn dùng **24 giờ** kể từ thời điểm tạo.

- **AC4 — Đăng ký lại với email đã ACTIVE:**
  Given một email đã có tài khoản với `status = ACTIVE`,
  When user submit form Signup với đúng email đó,
  Then hệ thống trả lỗi **409** với message "An account with this email
  already exists. Try logging in instead.", và không tạo/sửa user nào.

- **AC5 — Đăng ký lại với email đang PENDING (activation cũ bị mất/hết hạn):**
  Given một email đã có tài khoản với `status = PENDING`,
  When user submit lại form Signup với đúng email đó,
  Then hệ thống trả về **200**, cập nhật tên user theo giá trị mới nhập,
  sinh và gửi **1 token kích hoạt mới** (token cũ không còn dùng được),
  và **không** tạo thêm user thứ hai với cùng email.

- **AC6 — Validate input sai:**
  Given Name để trống, hoặc Email sai định dạng (VD thiếu ký tự `@`),
  When user submit,
  Then hệ thống từ chối (400) với thông báo lỗi rõ ràng, và không tạo
  user nào.

- **AC7 — UI phản hồi sau khi thành công:**
  Given submit trả về 201 hoặc 200,
  When frontend nhận response,
  Then form Signup được thay bằng khối thông báo thành công (hiển thị
  đúng message từ server) kèm link "Back to login"; form Name/Email
  không còn hiển thị.

- **AC8 — Google signup nằm ngoài phạm vi AC trên:**
  Given user chọn "Sign up with Google" thay vì điền form Name/Email,
  Then hành vi đi theo luồng khác hoàn toàn (không tạo `PENDING`, không
  gửi activation email) — xem AC chi tiết ở feature-design mục 4, không
  áp dụng các AC1–AC7 ở trên cho nhánh này.

## 5. NFR liên quan

- **Thời gian gửi email kích hoạt:** kỳ vọng trong vài giây sau khi
  submit thành công. **Chưa có ngưỡng số chính thức** — cần chốt nếu
  muốn đưa vào Product Spec (không tự bịa số ở đây).
- **Thời hạn activation token:** 24 giờ — đã chốt trong code
  (`env.activationTokenTtlMs`, dùng chung với feature-design mục 2).
  Ghi lại ở đây để tham chiếu, chi tiết đầy đủ thuộc về mục 2.
- **Giới hạn độ dài input:** `name` tối đa 100 ký tự (chốt trong code,
  chưa rõ đây là NFR sản phẩm chính thức hay chỉ là giới hạn kỹ thuật
  ngẫu nhiên — nên xác nhận lại nếu cần đưa vào Product Spec).

## 6. Screen refs

| Màn hình | File | Loại tham chiếu UI |
|---|---|---|
| Signup form | `frontend/src/pages/Signup.tsx` | Tự viết tay (không qua Claude Design), đã triển khai, đã deploy production |

## 7. Self-check

- [x] Mỗi màn hình liên quan đã ghi rõ loại tham chiếu UI (tự viết tay, đã triển khai).
- [x] Mọi AC ở dạng Given/When/Then, kiểm chứng được (pass/fail).
- [x] Business intent trả lời "ai đau, tại sao cần", không chỉ mô tả tính năng.
- [x] NFR không bịa số khi chưa có ngưỡng chính thức (đã ghi "chưa có ngưỡng số chính thức").
- [ ] Gắn vào backlog task / tạo GitHub issue — **cần review (BA/Dev/QC hoặc tự review) trước khi tạo issue.**
