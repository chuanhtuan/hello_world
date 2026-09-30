# Quickstart — chạy local & verify (dùng chung mục 1–8)

## 1. Chạy hệ thống local (đã có sẵn, không đổi)

```bash
# Backend
cd backend
cp .env.example .env   # điền JWT_SECRET tối thiểu; SMTP/GOOGLE_CLIENT_ID/AWS để trống vẫn chạy được (mock ở bước test)
npm install
npm run db:migrate
npm run dev             # http://localhost:4000
```

```bash
# Frontend (terminal khác)
cd frontend
npm install
npm run dev              # http://localhost:5173
```

Biến môi trường bắt buộc để test **thủ công đầy đủ** cả 8 feature (theo
`.env.example`): `JWT_SECRET` (bắt buộc), `SMTP_*` (để nhận email thật —
mục 1,2,5,8), `GOOGLE_CLIENT_ID` (mục 4), `AWS_*`/`S3_BUCKET_NAME` (mục
7 avatar). Thiếu các biến optional này, server vẫn chạy nhưng nhánh
tương ứng sẽ lỗi khi gọi tới (VD thiếu `GOOGLE_CLIENT_ID` → lỗi 500 đúng
như contract đã ghi).

## 2. Chạy test tự động (MỚI — task B0/F0, xem `tasks-be.md`/`tasks-fe.md` mục 01)

Chưa tồn tại cho tới khi task B0 (feature 01) hoàn tất. Sau khi hoàn
tất, quy ước chạy:

```bash
cd backend && npm test        # Vitest: *.test.ts colocate cạnh source
cd frontend && npm test       # Vitest + Testing Library: *.test.tsx colocate cạnh component
```

Testcase cần MySQL thật (`@requires-mysql`, xem `research.md` §2.3) chạy
riêng:
```bash
cd backend && npm run test:mysql   # task B0 cần thêm script này, trỏ DB thật đã migrate
```

## 3. Verify nhanh từng feature (thủ công, trỏ theo AC trong `feature-design.md`)

| Feature | Cách verify nhanh nhất |
|---|---|
| 01 Signup | `POST /api/auth/signup` với email mới → check DB có user `PENDING`, check hộp thư nhận activation email |
| 02 Activate | Mở link trong email vừa nhận → đặt password → check `status=ACTIVE`, tự đăng nhập |
| 03 Login | Đăng nhập tài khoản vừa activate, thử tick/không tick Remember me, xem DevTools > Application > Cookies để so sánh |
| 04 Google SSO | Bấm "Sign in with Google" ở `/login` hoặc `/signup` (cần `GOOGLE_CLIENT_ID` hợp lệ) |
| 05 Forgot/Reset | `/forgot-password` → nhận email → `/reset-password/:token` |
| 06 Logout | Bấm Logout trên Navbar, xác nhận cookie bị xoá + điều hướng `/login` |
| 07 Profile | `/profile`, `/profile/edit`, đổi avatar (cần `AWS_*`/`S3_BUCKET_NAME` hợp lệ) |
| 08 User Admin | Đăng nhập tài khoản `role=ADMIN`, vào `/users` |

Không có testcase nào trong bảng trên thay thế được `testcases-ut.md` /
`testcases-it-st.md` của từng feature — bảng này chỉ để dev tự sanity
check khi code local, không phải quy trình QC chính thức.
