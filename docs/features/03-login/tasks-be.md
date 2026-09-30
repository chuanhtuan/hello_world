# Tasks BE — Login

| ID | Task | Input | Output | Trace |
|---|---|---|---|---|
| B03-01 | UT `login()`: mock `User.findOne`, `bcrypt.compare`; 5 nhánh lỗi + 1 nhánh thành công, đúng status code + message theo contract | `auth.controller.ts` | `auth.login.test.ts` | testcases-ut.md #UT3.x |
| B03-02 | UT `issueSession()`: decode JWT trả về, so `exp` đúng với `remember`; check cookie options (`maxAge` có/không, `httpOnly`, `sameSite`) | `session.ts` | `session.test.ts` | testcases-ut.md #UT3.x |
| B03-03 | IT-ST: supertest `POST /api/auth/login` full luồng trên SQLite, cả 2 case `remember` | `app.ts` | `auth.login.it.test.ts` | testcases-it-st.md #IT3.x |
| B03-04 | *(Chờ BA)* Không code — theo dõi Assumption `spec.md` mục 3 (#1 QUAN TRỌNG, #2, #3) | spec.md §6 | Issue "chờ BA" | spec.md Assumption 1-3 |
