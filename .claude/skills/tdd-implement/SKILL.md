---
name: tdd-implement
description: >
  Implement a feature task from locked plan/tasks — backend via strict TDD
  (RED→GREEN→REFACTOR), frontend via verification gates (wire logic onto
  already-generated UI, tests green before task is done). Source code and
  its unit tests (code UT — white-box, Vitest, mocked deps) are BOTH
  written by the same Dev-side model in this one skill; this is
  deliberately NOT split across two models, because the independence that
  matters is Dev vs Tester, not code vs its own unit test. Use once
  tasks-fe/tasks-be are approved (after plan-dev-tasks). Trigger
  words: "implement this task", "code tính năng", "viết code + unit test",
  "TDD". Do NOT use this to design the plan/tasks (already done by
  plan-dev-tasks), do NOT use this to write functional testcases or
  Playwright automation (that's the Tester track — test-viewpoint +
  qc-automation, a separate agent/model, verifying on the DEPLOYED app),
  and do NOT open the PR yourself — hand off to create-pr once local UT
  is green.
---

# TDD Implement (Implementation stage — Dev track)

## Mục tiêu

Code feature + unit test (code UT) pass local, sẵn sàng mở PR review — FE
chỉ wire logic vào UI code đã gen sẵn (KHÔNG dựng UI mới ở bước này).

## Phạm vi & tính độc lập

Source code và code UT (unit test mức source, Vitest, mock DB/mailer) đều
do **cùng một model/phiên làm việc** (Dev) viết — cố ý KHÔNG tách 2 model
riêng cho 2 việc này, vì:

- Code UT là unit test **white-box** — kiểm tra đúng cách hàm/module được
  implement, Dev là người hiểu rõ nhất chi tiết đó, tách model ra không có
  lợi ích gì, chỉ thêm round-trip không cần thiết.
- Ranh giới độc lập thực sự cần có nằm ở **Dev vs Tester**: `code-ut` (ở
  đây) khác hoàn toàn với **testcase chức năng** (`testcases-ut.md`,
  `testcases-it-st.md` — per-screen Access/UI/Function, chạy qua
  Playwright MCP trên app ĐÃ DEPLOY) do nhánh Tester sở hữu và verify độc
  lập bằng agent `qc-automation` (xem `test-viewpoint.md` trong
  `test-plan-writer` để biết nguồn gốc testcase này). Hai loại "UT" này
  dùng chung chữ viết tắt nhưng là 2 khái niệm khác nhau — không trộn lẫn
  khi đọc tài liệu.
- Thứ tự viết code trước hay code UT trước không quan trọng, miễn là cả
  hai cùng một model đảm nhiệm và cả hai đều xanh trước khi mở PR.

## HALT — dừng lại nếu chưa rõ

1. Task cụ thể đang làm (từ `tasks-fe`/`tasks-be`, có ID rõ ràng, VD `B2`).
2. Contract/AC liên quan đã LOCK ở stage Plan & Task — nếu contract chưa
   lock hoặc đã đổi mà chưa thông báo, dừng lại và xác nhận trước khi code
   theo phiên bản cũ.

## Quy trình theo layer

### Backend — TDD strict (RED → GREEN → REFACTOR)

1. Viết test FAIL trước (RED) — test phải reference đúng AC/contract ID
   liên quan (VD `// AC: feature-design §3.2`), commit test trước code để
   sau này bisect dễ.
2. Viết code tối thiểu để test pass (GREEN).
3. Refactor — dọn code nhưng KHÔNG đổi hành vi (test vẫn phải xanh sau khi
   refactor).
4. BA/Dev approve test list trước khi coi là xong — test list phản ánh
   đúng contract, không phải "code chạy nhưng sai intent".

### Frontend — Verification Gates (không bắt viết test trước)

1. Wire logic nghiệp vụ vào UI code đã gen (KHÔNG dựng lại UI).
2. Test L2 (Vitest + RTL + MSW) phải GREEN trước khi coi task done — đây
   là gate xác minh, không phải TDD strict.
3. BA/Dev approve acceptance — kiểm tra hành vi khớp AC, không chỉ khớp
   UI trông đẹp.

### Cả hai layer

4. Local UT loop bằng AI Fix Agent (watch mode): auto-fix tối đa 5 vòng,
   mỗi vòng < 30 giây — nếu vẫn fail sau 5 vòng, ESCALATE cho Dev, KHÔNG
   lặp vô hạn hay tự nới lỏng assertion để test pass giả.
5. Dev review code local lần cuối: logic đúng spec, không over-engineer,
   naming chuẩn, không dead code.
6. Trigger `create-pr` skill khi UT pass local.

## Bảng quyết định — BE hay FE workflow

| Thay đổi thuộc về | Workflow |
|---|---|
| Endpoint/service/migration | BE — TDD strict, viết test trước |
| Component/state/UI logic trên UI đã gen | FE — Verification Gates, wire rồi verify test L2 |
| Cả hai (full-stack task) | Chạy cả hai workflow song song, PR riêng cho FE và BE |

## Self-check trước khi trigger create-pr

- [ ] BE: mọi test đều được viết trước code (RED trước GREEN), không có test viết sau để "cho khớp" code đã có
- [ ] FE: test L2 xanh, không có `.skip`/`.todo` che giấu test chưa qua
- [ ] Không còn vòng lặp AI Fix Agent nào bị escalate mà chưa Dev xử lý
- [ ] Dev đã đọc lại business logic một lần cuối, không chỉ tin AI viết đúng
- [ ] Không có file `testcases-ut.md`/`testcases-it-st.md` nào bị sửa trong quá trình này — đó là tài sản của Tester, không phải của bước này
