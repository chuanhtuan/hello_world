# Test Viewpoint — Login

> Retroactive — xem ghi chú ở `01-signup/test-viewpoint.md`, áp dụng tương tự
> ở đây.

## Màn hình: Login form (`frontend/src/pages/Login.tsx`)

| Khía cạnh | Trạng thái | Ghi chú |
|---|---|---|
| Access | ⚠️ GAP (nhỏ) | Không có testcase "user đã login rồi vào lại `/login`" — hành vi mong đợi (redirect về `/profile`?) chưa được xác nhận. |
| UI | ✅ | AC6 (lỗi hiển thị đúng chỗ, giữ nguyên input) được test ở UT3.10 (FE). |
| Function | ✅ | UT3.1–UT3.9 + IT3.1–IT3.6 phủ đủ AC1–AC5, kể cả 2 giá trị remember (true/false) ở cả unit lẫn integration. |
| Security | ✅ (mạnh) | AC3 chống user-enumeration được test rất kỹ — IT3.5/IT3.6 so sánh message "giống hệt" giữa email-không-tồn-tại và sai-password, đây là 1 trong những test bảo mật tốt nhất trong cả 8 feature. |
| Data | ✅ | TTL session theo remember (1 ngày / 30 ngày) test ở cả mức JWT decode (UT3.8/3.9) lẫn `Set-Cookie` header thật (IT3.1/IT3.2). |

## Gaps cần Test Lead quyết định

1. Rate-limit / account-lockout cho login sai nhiều lần — KHÔNG có testcase nào, và đây là endpoint rủi ro cao nhất trong 8 feature (brute-force password). Nên đánh giá có cần bổ sung không, kể cả ở mức NFR trước khi viết testcase.
2. Hành vi "đã login mà vào lại `/login`" — xác nhận với BA.
