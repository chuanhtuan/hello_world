# Spec — Đăng nhập bằng Email + Password, kèm "Remember me"

> Nguồn: `docs/features/03-login/feature-design.md` (đã review).
> Đối chiếu codebase: `backend/src/controllers/auth.controller.ts` (`login`),
> `backend/src/utils/session.ts`, `backend/src/utils/jwt.ts`,
> `frontend/src/context/AuthContext.tsx`, `frontend/src/api/client.ts`.

## 1. User Stories

**US3.1** — Là user `ACTIVE` có password, tôi muốn đăng nhập bằng email
+ password để dùng hệ thống.
*(trace feature-design §3 bước 1-4, §4 AC1)*

**US3.2** — Là user thường xuyên truy cập, tôi muốn tick "Remember me"
để không phải đăng nhập lại mỗi lần mở trình duyệt.
*(trace feature-design §3 bước 5, §4 AC2)*

**US3.3** — Là user nhập sai thông tin hoặc dùng sai phương thức đăng
nhập (tài khoản Google-only, tài khoản chưa activate), tôi muốn nhận
thông báo lỗi đúng để biết cách khắc phục thay vì lỗi chung chung.
*(trace feature-design §3 bước 4, §4 AC3/AC4/AC5)*

## 2. Edge cases

Đối chiếu `auth.controller.ts`, `session.ts`, `AuthContext.tsx`,
`api/client.ts`:

1. **[QUAN TRỌNG] "Remember me" không thực sự giới hạn theo phiên
   trình duyệt như business intent mô tả.** Cơ chế thật:
   - `session.ts`: `remember=false` → cookie là session-cookie (mất khi
     đóng browser), nhưng JWT bên trong vẫn có hạn dùng riêng
     (`JWT_EXPIRES_IN_DEFAULT`, mặc định **1 ngày**) — không liên quan
     gì tới việc đóng/mở browser.
   - `AuthContext.tsx` (`persistSession`) LUÔN lưu token vào
     `localStorage` bất kể `remember` là gì; `localStorage` **sống sót
     qua việc đóng/mở lại trình duyệt**.
   - `api/client.ts` gắn `Authorization: Bearer <token từ localStorage>`
     vào **mọi** request, dùng làm fallback khi cookie không có.
   - **Hệ quả:** user KHÔNG tick "Remember me", đóng trình duyệt, mở lại
     trong vòng 1 ngày → cookie session đã mất, nhưng `localStorage`
     vẫn còn token hợp lệ → `authenticate` middleware nhận token qua
     Bearer header → user **vẫn được coi là đã đăng nhập**, trái với kỳ
     vọng "không tick Remember me thì phải đăng nhập lại mỗi khi mở lại
     trình duyệt" nêu trong business intent gốc.
2. **Case-sensitivity của email** khi so khớp lúc login: giống Signup,
   không normalize lowercase — email nhập sai hoa/thường so với lúc
   đăng ký có thể bị coi là "không tồn tại" tuỳ collation DB.
3. **Không có rate-limit / khoá tài khoản khi login sai nhiều lần liên
   tiếp** (brute-force password) — mỗi lần sai chỉ trả 401 đơn thuần,
   không đếm số lần thử.
4. **User bị admin xoá (feature-design mục 8) trong khi JWT còn hạn**:
   `authenticate` chỉ `verifyToken` (giải mã chữ ký + hạn dùng), **không
   query DB** để xác nhận user còn tồn tại → các API chỉ dựa vào payload
   JWT (VD `requireRole`) vẫn "cho qua" dù user đã bị xoá; chỉ API nào
   tự `findByPk` (VD `getMyProfile`) mới phát hiện ra và trả 404. Tức là
   hành vi "đăng xuất khi bị xoá" **không tức thời**, phụ thuộc endpoint
   nào được gọi.
5. **Tài khoản vừa Google-link (feature-design mục 4) vừa có password
   cũ**: login bằng password cũ vẫn hoạt động bình thường sau khi đã
   liên kết Google — đã cover ở feature-design mục 4 AC2, không phải gap
   riêng của Login.

## 3. Requirements

| # | Requirement | Trace |
|---|---|---|
| FR1 | Chỉ cho đăng nhập khi `status=ACTIVE` **và** có `passwordHash` | feature-design §3 bước 4, §4 AC4/AC5 |
| FR2 | Thông báo lỗi phải phân biệt rõ 3 tình huống: sai email/password, chưa activate, tài khoản Google-only | feature-design §3 bước 4, §4 AC3-AC5 |
| FR3 | `remember` điều khiển thời hạn cookie + JWT theo đúng 2 mức đã chốt | feature-design §3 bước 5, §4 AC1/AC2 |
| NFR1 | JWT mặc định 1 ngày, remember 30 ngày (`JWT_EXPIRES_IN_DEFAULT`/`JWT_EXPIRES_IN_REMEMBER`) | feature-design §5 |
| NFR2 | Cookie: `httpOnly`, `sameSite=lax`, `secure` chỉ ở production | feature-design §5 |

## 4. Key entities

**User**: `email`, `passwordHash`, `status`, `provider`, `role`.
**Session** (không phải bảng DB — stateless JWT): payload `{id, role}`,
ký bằng `JWT_SECRET`, không có cơ chế thu hồi (revocation list) phía
server.

## 5. Success criteria

- AC1–AC6 trong feature-design mục 3 pass.
- Edge case #1 (Bearer-fallback qua localStorage) được BA xác nhận là
  hành vi chấp nhận được HOẶC được fix trước khi coi feature "Done" —
  đây là sai lệch giữa mô tả nghiệp vụ và hành vi thật, cần chốt rõ
  ràng, không để ngầm định.

## 6. Assumptions

1. **[QUAN TRỌNG]** "Remember me = false" trên thực tế không giới hạn
   theo phiên trình duyệt do cơ chế Bearer-fallback qua `localStorage`
   (xem Edge case #1) — CẦN HỎI BA: đây có phải hành vi mong muốn, hay
   cần sửa (VD dùng `sessionStorage` thay vì `localStorage` khi
   `remember=false`)? *Trạng thái: đang chờ xác nhận — ảnh hưởng trực
   tiếp tới đúng-sai của business intent đã ghi trong feature-design.*
2. **Không có rate-limit chống brute-force login** — CẦN HỎI BA/Security:
   có cần bổ sung (VD khoá tạm sau N lần sai)? *Trạng thái: đang chờ xác
   nhận.*
3. **JWT không bị thu hồi khi user bị xoá/đổi role giữa chừng** (stateless,
   không có revocation list) — CẦN HỎI BA: có chấp nhận độ trễ tới khi
   token tự hết hạn (tối đa 30 ngày nếu remember)? *Trạng thái: đang chờ
   xác nhận — liên quan cùng root cause với feature-design mục 6
   (Logout).*
