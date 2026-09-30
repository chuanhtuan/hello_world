# Tasks FE — Login

| ID | Task | Input | Output | Trace |
|---|---|---|---|---|
| F03-01 | Component test `Login.tsx`: mock `useAuth().login`, cover submit thành công + 3 loại lỗi hiển thị đúng message, giữ nguyên input khi lỗi | `testcases-ut.md` | `Login.test.tsx` | spec.md US3.1-US3.3 |
| F03-02 | Test `AuthContext` (hoặc `client.ts` interceptor): xác nhận token luôn ở `localStorage` sau `login(..., remember=false)`, và request tiếp theo vẫn có header `Authorization: Bearer` dù "logically" phải là session-only | `AuthContext.tsx`, `client.ts` | `AuthContext.test.tsx` — bằng chứng cụ thể cho BA | spec.md Assumption #1 (QUAN TRỌNG) |
