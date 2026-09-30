# Tasks BE — Logout

| ID | Task | Input | Output | Trace |
|---|---|---|---|---|
| B06-01 | UT `logout()`: mock `res.clearCookie`, verify tên cookie + options đúng | `auth.controller.ts` | `auth.logout.test.ts` | testcases-ut.md #UT6.x |
| B06-02 | IT-ST: supertest `POST /api/auth/logout` có/không cookie, verify 200 cả 2 case + header `Set-Cookie` | `app.ts` | `auth.logout.it.test.ts` | testcases-it-st.md #IT6.x |
| B06-03 | *(Chờ BA)* Không code — theo dõi Assumption dùng chung mục 3/6/8 (JWT không thu hồi) | spec.md §6 | Issue "chờ BA" (liên kết chung với B03-04, B08-0x) | spec.md Assumption #1 |
