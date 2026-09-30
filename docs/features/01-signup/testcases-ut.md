# Testcases UT — Signup

> Map trực tiếp AC (`feature-design.md` §4) + Edge cases (`spec.md` §2).
> UT = test hàm/controller đơn lẻ với dependency (DB, mailer) bị mock.

## Schema validation (`signupSchema`, task B01-01)

| ID | Given | When | Then |
|---|---|---|---|
| UT1.1 | `name=""` | validate | reject, message "Name is required" |
| UT1.2 | `name="   "` (toàn space) | validate | **pass** (gap đã biết — spec.md Assumption #1, test này PHẢI xác nhận đúng hành vi hiện tại, không phải hành vi mong muốn) |
| UT1.3 | `name` dài 101 ký tự | validate | reject |
| UT1.4 | `email="not-an-email"` | validate | reject |
| UT1.5 | `email=""` | validate | reject |
| UT1.6 | `name="Alice"`, `email="alice@example.com"` | validate | pass |

## Controller `signup()` (task B01-02, mock `User`, mock `sendActivationEmail`)

| ID | Given | When | Then | Trace |
|---|---|---|---|---|
| UT1.7 | `User.findOne` trả `null` (email chưa tồn tại) | gọi `signup(name, email)` | `User.create` được gọi với `status=PENDING, passwordHash=null, provider=LOCAL`; `sendActivationEmail` được gọi 1 lần; response 201 | AC2 |
| UT1.8 | `User.findOne` trả user `status=ACTIVE` | gọi `signup` | `User.create` KHÔNG được gọi; `sendActivationEmail` KHÔNG được gọi; ném `ApiError(409, ...)` | AC4 |
| UT1.9 | `User.findOne` trả user `status=PENDING` | gọi `signup` | user hiện có được `save()` với `activationToken`/`activationTokenExpires` mới; `sendActivationEmail` được gọi lại; response 200; `User.create` KHÔNG được gọi | AC5 |
| UT1.10 | mock `User.create` ném lỗi unique-constraint (mô phỏng race condition) | gọi `signup` 2 lần "đồng thời" (giả lập tuần tự trong test) | ghi nhận hành vi HIỆN TẠI: lỗi không được `catch` riêng → rơi vào `errorHandler` → 500 (test này xác nhận gap đã ghi ở spec.md #3, KHÔNG phải assert "đúng" mà assert "đây là hành vi hiện tại cần biết") | spec.md Edge case #3 |
