# Constraints — cross-cutting cho toàn bộ mục 1–8

> Áp dụng cho mọi task trong `tasks-fe.md`/`tasks-be.md` của cả 8
> feature. Vi phạm bất kỳ mục nào dưới đây phải được nêu lý do rõ ràng
> trong PR, không âm thầm lệch convention.

## Backend

1. **Validation**: luôn khai báo Zod schema ngay trong file controller,
   `parse()` ở đầu hàm — không validate tay bằng `if`, không đặt schema
   ở file riêng trừ khi dùng chung ≥2 controller.
2. **Lỗi**: chỉ 2 cách raise lỗi — throw `ApiError(status, message)`
   (nghiệp vụ) hoặc để `ZodError` tự bubble lên `errorHandler`. Không
   `res.status(...).json(...)` lỗi thủ công trong controller.
3. **Auth**: `authenticate`/`requireRole` gắn ở tầng router
   (`router.use`/tham số route), không kiểm tra role thủ công trong
   controller — ngoại lệ duy nhất: check "self vs admin" (VD
   `getUserById`, `updateMyProfile`) vì cần so `req.user!.id` với dữ
   liệu request, hợp lý giữ trong controller.
4. **Không log giá trị token thô** (activation/reset) ra console/log —
   chỉ hash được phép tồn tại trong log nếu cần debug.
5. **Không trả field nhạy cảm** (`passwordHash`, `*Token`, `googleId`)
   — luôn qua `user.toPublicJSON()`.
6. **File test BE**: colocate `*.test.ts` cạnh file nguồn (VD
   `auth.controller.test.ts` cạnh `auth.controller.ts`), không gom vào
   `__tests__/` riêng — giữ test gần code để dễ maintain ở quy mô
   solo-dev.

## Frontend

1. **State đăng nhập** chỉ sống trong `AuthContext` — page không tự
   quản lý user/token riêng.
2. **Bảo vệ route** qua `<PrivateRoute />`/`<AdminRoute />` khai báo ở
   `App.tsx`, không tự `if (!user) navigate(...)` rải rác trong từng
   page.
3. **Gọi API** luôn qua instance `api` (`api/client.ts`) — không tạo
   `axios.create()` mới ở nơi khác.
4. **File test FE**: colocate `ComponentName.test.tsx` cạnh component,
   mock `../api/client` qua `vi.mock` thay vì gọi API thật.

## Task ID & phạm vi task

1. Task ID theo mẫu `B<N>-0x` (backend) / `F<N>-0x` (frontend), `N` = số
   thứ tự feature (01–08) đúng như thư mục `docs/features/0N-*`.
2. **Tooling test (Vitest/supertest/Testing Library) chỉ setup 1 lần**,
   nằm ở task `B01-00`/`F01-00` (feature 01 — Signup, vì đây là feature
   đầu tiên trong pipeline). Từ feature 02 trở đi, `tasks-be.md`/
   `tasks-fe.md` ghi rõ "kế thừa tooling từ B01-00/F01-00", không lặp
   lại việc cài đặt.
3. Mỗi task phải đủ nhỏ để review trong 1 PR (theo self-check của
   `plan-and-tasks`) — không gộp "viết UT + IT" của cả 1 feature vào 1
   task duy nhất.

## Vì đây là dự án retroactive (code đã có sẵn)

- Task Dev trong `tasks-fe.md`/`tasks-be.md` **không phải** "xây feature
  mới" — mà là: (a) viết UT/IT còn thiếu cho code đã chạy production,
  (b) xử lý các gap/assumption đã nêu trong `spec.md` **CHỈ SAU KHI BA
  xác nhận rõ hướng xử lý** (không tự quyết trong lúc lên plan).
- Nếu 1 task cần sửa code hiện có (không chỉ thêm test), task đó phải
  ghi rõ **rủi ro regression** vì đây là code đang chạy production thật
  (`46.137.205.212.nip.io`).

## Bảo mật — rủi ro đã biết, chưa có task (phát hiện khi làm Test Viewpoint)

Phát hiện khi backfill `test-viewpoint.md` (2026-10-07): 2 endpoint sau
**chưa có bất kỳ rate-limit/chống brute-force nào** trong code (đã kiểm
tra toàn bộ `backend/src/app.ts` + `middlewares/` — không có
`express-rate-limit` hay middleware tương đương):

- `POST /api/auth/login` (feature 03) — rủi ro cao nhất: không giới hạn
  số lần thử sai password, dễ bị brute-force.
- `POST /api/auth/signup` (feature 01) — rủi ro thấp hơn nhưng vẫn mở:
  spam tạo tài khoản `PENDING` hàng loạt.

Đây là **thiếu tính năng**, không phải thiếu test — không thể viết
testcase cho hành vi chưa tồn tại. Cần 1 task Dev riêng (ví dụ thêm
`express-rate-limit`, giới hạn theo IP + email trên 2 endpoint này) đi
qua đúng flow: BA/PM xác nhận ngưỡng cụ thể (số lần thử / khoảng thời
gian) → viết AC → `plan-dev-tasks` → `tdd-implement` → viết testcase mới
trong `test-plan-writer` sau khi đã có code. Chưa nên tự quyết ngưỡng số
ở đây.
