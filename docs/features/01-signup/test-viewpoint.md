# Test Viewpoint — Signup

> Retroactive: testcase (`testcases-ut.md`/`testcases-it-st.md`) đã được viết
> trước khi Test Viewpoint này tồn tại (qua skill cũ `plan-and-tasks`). File
> này suy ngược từ AC (`feature-design.md` §4) + testcase đã có, để xác nhận
> không thiếu khía cạnh nào — đúng mục đích Test Viewpoint, chỉ làm sau thay
> vì trước như quy trình chuẩn.

## Màn hình: Signup form (`frontend/src/pages/Signup.tsx`)

| Khía cạnh | Trạng thái | Ghi chú |
|---|---|---|
| Access | ⚠️ GAP | Chưa có testcase cho "user đã đăng nhập rồi vào lại `/signup`" (redirect hay cho xem lại form?) — hành vi chưa được định nghĩa rõ trong feature-design. |
| UI | ⚠️ GAP | AC1 (form chặn submit rỗng, không có field password) và AC7 (form được thay bằng thông báo thành công) **không có testcase FE nào** — toàn bộ `testcases-ut.md` của feature này chỉ test backend (UT1.1–UT1.10). |
| Function | ✅ | UT1.7–UT1.10 (controller) + IT1.1–IT1.5 (supertest) phủ đủ AC2, AC4, AC5, AC6. |
| Security | ⚠️ GAP | Không có testcase cho rate-limit/abuse trên endpoint signup (spam tạo tài khoản PENDING hàng loạt) — chưa thấy đề cập trong NFR hay testcase nào. |
| Data | ✅ | Boundary `name` 101 ký tự (UT1.3), email case-sensitivity trên MySQL thật (IT1.6, dạng research chứ không phải pass/fail — feed ngược BA theo đúng tinh thần Assumption #2). |

## Gaps cần Test Lead quyết định

1. Bổ sung testcase FE cho AC1 + AC7 (hiện = 0 testcase UI cho màn hình chính của cả feature).
2. Quyết định có cần rate-limit test cho `POST /api/auth/signup` hay chấp nhận rủi ro ở quy mô hiện tại.
3. Hành vi "đã login mà vào `/signup`" — xác nhận với BA có cần chặn hay không trước khi viết testcase.
