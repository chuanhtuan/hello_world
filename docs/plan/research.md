# Research — Plan & Task (toàn bộ 8 feature Auth & User Management)

> Dùng chung cho tất cả feature (01–08). Ghi theo bảng quyết định của
> `plan-and-tasks`: KHÔNG research lại pattern đã có sẵn trong repo, CHỈ
> research khi cần thư viện/pattern hoàn toàn mới.

## 1. Pattern đã có sẵn trong repo — tái dùng, không tạo mới

| Pattern | Vị trí | Áp dụng cho |
|---|---|---|
| Validate input bằng Zod schema khai báo ngay trong file controller | `backend/src/controllers/*.controller.ts` | Mọi endpoint mới/sửa |
| `asyncHandler` bọc controller để tự forward lỗi async vào `errorHandler` | `backend/src/utils/asyncHandler.ts` | Mọi controller |
| `ApiError(status, message)` cho lỗi nghiệp vụ; `ZodError` tự động → 400 với `errors[]` qua `errorHandler` | `backend/src/middlewares/error.middleware.ts` | Mọi lỗi trả về client |
| `authenticate` (đọc cookie hoặc `Authorization: Bearer`) + `requireRole(...roles)` | `backend/src/middlewares/auth.middleware.ts` | Mọi route cần đăng nhập/phân quyền |
| Token dùng 1 lần: `crypto.randomBytes(32)` sinh raw token, lưu `sha256(raw)` vào DB, gửi raw qua email/URL | `backend/src/services/activation.service.ts`, `auth.controller.ts` (reset password) | Activate (mục 2), Forgot/Reset (mục 5) |
| `issueSession`/`clearSession` (JWT + cookie, tôn trọng `remember`) | `backend/src/utils/session.ts` | Login, Google SSO, Activate, Logout |
| `toPublicJSON()` loại bỏ `passwordHash` trước khi trả về client | `backend/src/models/user.model.ts` | Mọi endpoint trả về user |
| `PrivateRoute` / `AdminRoute` bọc route cần đăng nhập/quyền admin | `frontend/src/components/PrivateRoute.tsx` | Mọi route FE cần bảo vệ |
| `AuthContext` là nguồn sự thật duy nhất cho `user`/session ở FE | `frontend/src/context/AuthContext.tsx` | Mọi page cần biết trạng thái đăng nhập |
| Axios instance dùng chung + interceptor tự gắn Bearer token | `frontend/src/api/client.ts` | Mọi lời gọi API từ FE |

**Quyết định:** mọi task Dev mới (nếu có) phải tái dùng đúng các pattern
trên, không tạo cách validate/error/auth mới song song.

## 2. Research thật sự cần — dự án CHƯA có bất kỳ test framework nào

Kiểm tra `backend/package.json` và `frontend/package.json`: không có
Vitest/Jest, không có file `*.test.ts`/`*.test.tsx` nào trong repo. Đây
là khoảng trống thật (không phải pattern có sẵn để tái dùng) — cần chốt
trước khi giao task viết UT/IT cho Dev.

### 2.1. Test runner (BE + FE)

| Lựa chọn | Ưu điểm | Nhược điểm |
|---|---|---|
| **Vitest** (chọn) | FE đã dùng Vite → dùng chung config/watch mode; TS-native, không cần babel/ts-jest; API tương thích Jest nên dễ tìm tài liệu; 1 runner duy nhất cho cả FE lẫn BE giảm tooling cho solo-dev | BE không dùng Vite, cần thêm `vitest.config.ts` riêng cho backend |
| Jest | Phổ biến nhất, nhiều plugin | Cấu hình ESM/TS phức tạp hơn với setup hiện tại (tsx, ESM-ish); phải maintain 2 hệ config khác nhau (FE Vite vs Jest) |

**Quyết định:** dùng **Vitest** cho cả `backend` và `frontend` — 1 công
cụ, 1 cách chạy (`npm test`), giảm tải bảo trì cho dự án solo-dev.

### 2.2. HTTP-level test cho BE (IT-ST)

**Quyết định:** dùng **supertest** gọi thẳng `app` (export sẵn ở
`backend/src/app.ts`, tách khỏi `server.ts` nên test được mà không cần
mở cổng thật).

### 2.3. Database cho IT-ST (BE)

| Lựa chọn | Ưu điểm | Nhược điểm |
|---|---|---|
| MySQL thật (Docker hoặc DB dev có sẵn) | Đúng 100% hành vi production (collation, enum) | Chậm hơn, cần Docker/DB sẵn sàng khi chạy CI |
| **SQLite in-memory** (Sequelize dialect `sqlite`) — chọn cho phần lớn IT-ST | Nhanh, không cần hạ tầng ngoài, tự huỷ sau mỗi lần chạy | Khác MySQL ở 1 số điểm: **collation mặc định khác nhau** → không phản ánh đúng edge case "email khác hoa/thường" đã nêu ở `spec.md` (Signup, Login, User Admin) |

**Quyết định (2 tầng):**
1. Phần lớn IT-ST dùng **SQLite in-memory** — nhanh, đủ cho luồng
   nghiệp vụ chính.
2. **Riêng testcase edge-case "email khác hoa/thường"** (đã nêu là
   assumption chưa chốt ở `spec.md` của mục 1, 3, 8): đánh dấu
   `@requires-mysql`, chạy nhắm vào MySQL thật (dev DB hoặc Docker), vì
   đây là hành vi phụ thuộc collation DB thật — SQLite sẽ cho kết quả
   không đáng tin cậy cho case này. Kết quả từ testcase này chính là câu
   trả lời thực nghiệm cho assumption đó — feed ngược lại `spec.md` sau
   khi có kết quả.

### 2.4. Mock các dịch vụ ngoài khi test BE

| Dịch vụ ngoài | Cách mock | Áp dụng |
|---|---|---|
| SMTP (`nodemailer`) | `vi.mock('../utils/mailer')` — thay `sendActivationEmail`/`sendPasswordResetEmail` bằng spy, KHÔNG gửi email thật trong UT/IT tự động | Mục 1, 2, 5, 8 |
| S3 (`@aws-sdk/client-s3`) | `vi.mock('@aws-sdk/client-s3')`, mock `PutObjectCommand`/`S3Client.send` | Mục 7 (avatar) |
| Google (`google-auth-library`) | `vi.mock('google-auth-library')`, mock `OAuth2Client.prototype.verifyIdToken` trả về payload giả (kèm case `email_verified=false`) | Mục 4 |

**Riêng SMTP thật (Gmail):** feature-design mục 5 đã ghi nhận rủi ro
"chưa verify lại sau khi đổi SMTP" — đây là việc **QC làm thủ công 1
lần** với SMTP thật, KHÔNG đưa vào UT/IT tự động (tự động luôn mock).

### 2.5. Test FE (component/integration)

**Quyết định:** **Vitest + `@testing-library/react` + `@testing-library/user-event`**,
environment `jsdom`. Mock `axios` instance (`api` từ `api/client.ts`)
qua `vi.mock('../api/client')` để test component độc lập với network
thật. Không dùng Playwright ở bước này — Playwright/E2E thật đã được
dùng riêng bởi agent `qc-automation` **sau khi deploy** (ngoài phạm vi
Plan & Task này).

## 3. Câu hỏi còn mở — cần Dev xác nhận trước khi khoá `plan-be.md`

1. SQLite có đủ mô phỏng đúng `ENUM` của MySQL (`Role`, `UserStatus`,
   `AuthProvider`) không, hay cần map riêng cho test? → Cần 1 task spike
   nhỏ (B0, feature 01) chạy thử trước khi viết testcase hàng loạt.
2. Migration/model hiện tại có chạy được trên SQLite dialect mà không
   sửa gì không (VD `DataTypes.STRING(1024)` cho `avatarUrl`)? → Cùng
   task spike B0.
