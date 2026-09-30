# Tasks BE — Signup

| ID | Task | Input | Output | Trace |
|---|---|---|---|---|
| B01-00 | Setup Vitest + supertest + SQLite in-memory test DB (`vitest.config.ts`, test helper để tạo `sequelize` instance dialect `sqlite` + sync models, mock helper cho `mailer.ts`) | `docs/plan/research.md` §2.1-2.4 | `npm test` chạy được (rỗng); spike xác nhận ENUM + `STRING(1024)` hoạt động đúng trên SQLite (ghi kết quả vào `research.md` nếu phát sinh khác biệt) | constraints.md §Task ID |
| B01-01 | Export `signupSchema`; UT validate schema (tên rỗng/toàn space, >100 ký tự; email sai định dạng/rỗng) | `auth.controller.ts` | `signupSchema.test.ts`, không đổi hành vi runtime | testcases-ut.md #UT1.x |
| B01-02 | UT `signup()` controller: mock Sequelize `User` model + `sendActivationEmail`, cover 3 nhánh (mới/PENDING/ACTIVE) + đúng field ghi (`status`, `passwordHash=null`, `provider=LOCAL`) | `auth.controller.ts`, `activation.service.ts` | `auth.controller.test.ts` | testcases-ut.md #UT1.x |
| B01-03 | IT-ST: supertest `POST /api/auth/signup` trên app thật + SQLite test DB, verify response + DB state cho AC2, AC4, AC5, AC6 (feature-design) | `app.ts`, B01-00 | `auth.signup.it.test.ts` | testcases-it-st.md #IT1.x |
| B01-04 | *(Chờ BA)* Không code — theo dõi 3 Assumption ở `spec.md` mục 1 | spec.md §6 | Issue "chờ BA" | spec.md Assumption 1-3 |
