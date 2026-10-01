# .claude/ — AI Agent-First core dev loop cho HelloWorld

Bộ Agent + Skill này bám theo mô hình **AI Agent-First SDLC**
(https://agent9-sdlc.vercel.app/2026-06-10-ai-agent-sdlc.html — 10 phase,
23 stage), scope **"core dev loop"** — nhóm stage lặp lại mỗi feature, từ
đặc tả tới QC (phase *Requirements & Design Definition* → *Implementation*
→ *Integration & Verification* → *Validation*). Các phase enterprise-heavy
khác của mô hình gốc (Business & Requirements Analysis, Project Initiation,
Transition/Operation/Maintenance & Disposal) chưa cần cho quy mô hiện tại
của HelloWorld nên chưa build — xem mục "Chưa build" bên dưới để biết build
tiếp gì khi cần mở rộng.

## Nguyên tắc tổ chức: 2 nhánh Dev / Tester độc lập

Pipeline này chia rõ 2 nhánh chạy phần lớn độc lập với nhau, gặp nhau ở
Plan & Task (nguồn testcase chung) và ở Validation (QC verify sản phẩm
Dev làm ra):

- **Nhánh Dev** (`tdd-implement`): viết source code VÀ unit test mức
  source (code UT — white-box, Vitest, mock DB/mailer) — cả hai do CÙNG
  MỘT model/phiên làm việc đảm nhiệm. Không tách 2 model cho code và code
  UT, vì code UT là việc nội bộ của Dev (hiểu rõ implementation), tách ra
  không có lợi ích, chỉ thêm round-trip.
- **Nhánh Tester** (`plan-and-tasks` sinh test-viewpoint + testcase →
  `qc-automation` verify → `bug-triage` log bug): sinh testcase CHỨC NĂNG
  (per-screen Access/UI/Function, chạy qua Playwright MCP trên app ĐÃ
  DEPLOY) — độc lập hoàn toàn với code UT của Dev.

**Lưu ý tên gọi dễ nhầm:** cả 2 nhánh đều dùng chữ "UT" nhưng nghĩa khác
nhau — "code UT" (Dev, Vitest, source-level) vs "testcase UT"
(`testcases-ut.md`, Tester, functional, chạy trên app deploy). Khi đọc
tài liệu trong repo này, luôn xem file đang nói tới cái nào.

Ranh giới độc lập thật sự cần giữ là **Dev vs Tester** — không phải giữa
code và code UT trong nội bộ Dev.

## Bản đồ stage → file trong repo này

| Stage (theo mô hình gốc) | Phase | File | Loại | Trạng thái |
|---|---|---|---|---|
| Đặc tả tính năng | Requirements & Design Definition | `skills/feature-spec-writer/SKILL.md` | Skill | ✅ |
| User Story | Requirements & Design Definition | `skills/user-story-spec/SKILL.md` | Skill | ✅ |
| Plan & Task (+ Test Viewpoint, testcase) | Requirements & Design Definition | `skills/plan-and-tasks/SKILL.md` | Skill | ✅ |
| Triển khai + Unit Test (code + code UT, cùng 1 model) | Implementation | `skills/tdd-implement/SKILL.md` | Skill | ✅ |
| Merge vào Feature Branch (mở PR) | Integration & Verification | `skills/create-pr/SKILL.md` | Skill | ✅ |
| AI Review — Code lens | Integration & Verification | `agents/code-reviewer.md` | Agent (Sonnet) | ✅ |
| AI Review — Security lens | Integration & Verification | `agents/security-reviewer.md` | Agent (Opus) | ✅ |
| Kiểm thử nghiệp vụ (QC) — testcase chức năng, manual fallback, re-verify bug fix | Validation (V&V / Testing) | `agents/qc-automation.md` | Agent (cần Playwright MCP) | ✅ |
| Phân loại & xử lý bug | Validation (V&V / Testing) | `agents/bug-triage.md` | Agent | ✅ |
| CI + Security Scan | Integration & Verification | — | CI job (GitHub Actions, 5 job song song: Lint/Build/UT, Secret Scan, SAST, Dependency CVE + SBOM, IaC scan) | chưa làm |
| Script gộp 3 section PR Review | Integration & Verification | — | Script CI (~20 dòng), không phải agent | chưa làm |
| Peer Review | Integration & Verification | — | Human-only theo mô hình gốc | không cần agent |
| Merge → Triển khai Dev/Test | Integration & Verification | — | CI/CD auto build + deploy + smoke test | chưa làm |
| Test review độc lập (review lại spec test do qc-automation viết) | Validation (V&V / Testing) | — | Agent riêng (`test-reviewer`) trong mô hình gốc, chưa build | chưa làm |

## Checklist tiêu chí bắt buộc (theo phase, trích từ mô hình gốc)

Đây là điều kiện nền tảng để một dự án vận hành đúng theo pipeline AI
Agent-First ở các phase nằm trong scope "core dev loop" của repo này —
dùng để tự chấm repo đang đạt tới đâu:

- **Requirements & Design Definition** (6 tiêu chí): feature spec được xác
  nhận 3 bên (BA/Dev/Tester duyệt `feature-design.md` trước khi triển
  khai) · contract API giữa FE & BE được khoá làm nguồn tham chiếu chung ·
  có Agent/Skill hỗ trợ soạn đặc tả (✅ `feature-spec-writer`) · có
  Agent/Skill sinh testcase UT theo từng màn (✅ trong `plan-and-tasks`,
  xuất phát từ `test-viewpoint.md`) · có Agent/Skill sinh testcase IT (✅
  trong `plan-and-tasks`) · có Agent/Skill sinh testcase ST (✅ trong
  `plan-and-tasks`, ở mức đơn giản cho quy mô hiện tại).
- **Implementation** (1 tiêu chí): có Agent/Skill sinh code bám convention
  dự án (✅ `tdd-implement` — code + code UT cùng một model Dev; độc lập
  với testcase chức năng của Tester, không độc lập với chính code của
  mình).
- **Integration & Verification** (4 tiêu chí): CI tự động chặn merge nếu
  Lint/Build/UT fail (❌ chưa có CI) · CI tự động chặn merge nếu phát hiện
  lỗ hổng bảo mật cấp tool — secret/SAST/CVE/IaC (❌ chưa có) · Agent tự
  động review code trước khi mở PR (✅ `code-reviewer` + `security-reviewer`,
  nhưng chưa có CI để chạy tự động, hiện gọi thủ công) · Agent triage kết
  quả quét bảo mật (❌ chưa có, phụ thuộc CI scan trước).
- **Validation (V&V / Testing)** (5 tiêu chí): Agent/Skill chạy testcase UT
  qua Playwright MCP (✅ `qc-automation`) · chạy testcase IT qua Playwright
  MCP (✅ `qc-automation`, chạy sau khi hết vòng UT) · chạy testcase ST qua
  Playwright MCP (✅ `qc-automation`, mức đơn giản) · Agent/Skill log bug
  tự động (✅ `bug-triage`) · Agent/Skill đề xuất fix bug (✅ `bug-triage`
  gợi ý root cause + file/line liên quan, kèm `qc-automation` re-verify
  sau khi Dev báo fix xong).

## Cách dùng nhanh

Thứ tự một vòng feature:

1. `feature-spec-writer` → `feature-design.md`
2. `user-story-spec` → `spec.md`
3. `plan-and-tasks` → plan-fe/plan-be + tasks-fe/tasks-be/tasks-qc +
   `test-viewpoint.md` + testcases (`testcases-ut.md`, `testcases-it-st.md`)
4. `tdd-implement` → Dev viết code + code UT (cùng 1 model), unit test
   local pass
5. Gọi song song 2 agent `code-reviewer` + `security-reviewer` trên diff
   (tự review trước khi mở PR)
6. Dev tự test theo `test-viewpoint.md` (sanity check cục bộ — không thay
   thế bước `qc-automation` chạy trên app đã deploy)
7. `create-pr` → mở PR
8. Peer review (người) → merge
9. Deploy Dev/Test → `qc-automation` verify qua Playwright MCP: hết vòng
   UT rồi mới sang IT; case nào không tự động hoá được → bàn giao Tester
   chạy tay
10. Fail → `bug-triage` phân loại → quay lại bước 4 fix → `qc-automation`
    re-verify đúng case đó (tối đa 3 vòng, quá thì escalate)

## Chưa build / follow-up

- **CI + Security Scan**: cần thiết lập GitHub Actions với 5 job song song
  — Lint/Build/UT (+coverage), Secret Scan (gitleaks/truffleHog), SAST
  (Semgrep/CodeQL), Dependency CVE + SBOM (Snyk/npm audit), IaC/Container
  scan (Trivy/tfsec/checkov) — đây là cấu hình CI, không phải agent/skill,
  làm riêng khi bạn sẵn sàng.
- **Script gộp 3 section PR Review** (Code + Security + SAST Triage) thành
  1 GitHub PR Review duy nhất — hiện 2 agent trả về đúng format section
  riêng, còn thiếu ~20 dòng script (JS/Python) chạy trong CI để gộp lại.
- **Auto deploy Dev/Test sau merge**: mô hình gốc có bước CI/CD tự động
  build + deploy + smoke test ngay sau khi merge vào `develop` — hiện repo
  đang deploy thủ công qua SSH/pm2 (xem quy trình vận hành EC2 đã làm ở
  ngoài phạm vi `.claude/`).
- **`test-reviewer` agent**: mô hình gốc có một agent review độc lập, đọc
  lại spec test (`*.spec.ts`) do `qc-automation` viết ra để bắt lỗi
  mapping/selector-a11y/assertion trước khi tin kết quả — REQUEST CHANGES
  thì `qc-automation` re-spawn tối đa 2 lần. Repo hiện chưa có agent này;
  cân nhắc build khi cần tăng độ tin cậy của bước QC tự động.
- **Toolkit context (tuỳ chọn)**: mô hình gốc còn liệt kê 2 công cụ context
  gắn MCP cho AI Agent — GitNexus (knowledge graph cho code, giảm ~70%
  context khi cần impact analysis/dependency lookup/refactor lớn) và
  Playwright MCP (đã dùng trong `qc-automation` để verify bản deploy
  thật). GitNexus chưa cần thiết ở quy mô 1 repo nhỏ như HelloWorld, có
  thể cân nhắc khi codebase lớn hơn.
- Nếu sau này mở rộng quy mô (nhiều dev/team) hoặc muốn phủ cả các phase
  còn lại của mô hình gốc — *Business & Requirements Analysis* (Ý tưởng &
  Khám phá, Product Spec & Kiến trúc), *Project Initiation* (UI Codegen
  qua Claude Design, Project Base & Common), *Transition* (Staging/
  Production release), *Operation* (Giám sát & SLO, On-call & Incident),
  *Maintenance & Disposal* (Bảo trì định kỳ, Retire/Sunset hệ thống) — có
  thể build tiếp theo đúng 23-stage đầy đủ khi thực sự cần.

## Nguyên tắc viết Skill/Agent áp dụng trong repo này

Theo hướng dẫn "Xây dựng Skill" trong cùng tài liệu gốc: description viết
theo công thức 3 lớp (làm gì → khi nào dùng → khi nào KHÔNG + từ khóa), mỗi
skill có khối HALT liệt kê biến số phải biết trước khi bắt tay, self-check
checklist có mệnh lệnh chặn ở cuối, và logic rẽ nhánh viết thành bảng thay
vì văn xuôi.

---
*Cập nhật lần gần nhất: 2026-10-01 — tách rõ 2 nhánh Dev/Tester độc lập,
thêm Test Viewpoint vào Plan & Task, thêm manual fallback + re-verify bug
fix vào qc-automation. Nếu tài liệu gốc thay đổi số stage/tiêu chí, nên
đối chiếu lại mục "Bản đồ" và "Checklist" ở trên.*
