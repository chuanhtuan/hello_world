# Tasks BE — Activate Account

| ID | Task | Input | Output | Trace |
|---|---|---|---|---|
| B02-01 | UT `hashToken()` — cùng input luôn ra cùng output, output là hex 64 ký tự | `activation.service.ts` | `activation.service.test.ts` | data-model.md §3 |
| B02-02 | UT 3 controller: mock `User.findOne`/`save`, cover token hợp lệ/sai/hết hạn, password <8 ký tự, response message đúng contract | `auth.controller.ts` | `auth.activate.test.ts` | testcases-ut.md #UT2.x |
| B02-03 | IT-ST: supertest `GET` rồi `POST` `/api/auth/activate/:token` trên SQLite test DB (kế thừa B01-00), verify `activationToken=null` sau khi dùng, verify dùng lại token cũ → lỗi | `app.ts` | `auth.activate.it.test.ts` | testcases-it-st.md #IT2.x |
| B02-04 | *(Chờ BA)* Không code — theo dõi Assumption `spec.md` mục 2 (#1 rate-limit resend, #2 race condition) | spec.md §6 | Issue "chờ BA" | spec.md Assumption 1-2 |
