# Tasks BE — Google SSO

| ID | Task | Input | Output | Trace |
|---|---|---|---|---|
| B04-01 | UT `googleAuth()`: mock `verifyIdToken`, cover `email_verified=false`, user mới, liên kết theo `googleId`, liên kết theo `email` (LOCAL có sẵn), thiếu `GOOGLE_CLIENT_ID` (500) | `auth.controller.ts` | `auth.google.test.ts` | testcases-ut.md #UT4.x |
| B04-02 | IT-ST: supertest `POST /api/auth/google` (mock `google-auth-library` ở module level) trên SQLite test DB | `app.ts` | `auth.google.it.test.ts` | testcases-it-st.md #IT4.x |
| B04-03 | *(Chờ BA)* Không code — theo dõi Assumption `spec.md` mục 4 | spec.md §6 | Issue "chờ BA" | spec.md Assumption 1-2 |
