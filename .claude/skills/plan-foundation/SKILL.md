---
name: plan-foundation
description: >
  Turn an approved spec.md + feature-design.md into the shared design
  artifacts both Dev and Tester need — research.md, data-model.md,
  contracts/ (API request/response) and quickstart.md — then LOCK the
  contract via a 3-way sign-off (FE lead ∥ BE lead ∥ QA/Test lead) before
  anyone branches off. This is the single "freeze point" of Plan & Task:
  correction here is cheapest, before Dev (plan-dev-tasks) and Tester
  (test-plan-writer) branch into two independent flows that both read the
  LOCKED contract but do not depend on each other's output. Use right
  after spec.md is committed, before plan-dev-tasks or test-plan-writer.
  Trigger words: "plan nền tảng", "research + data model + contract",
  "lock contract", "plan-foundation". Do NOT use this to write
  plan-fe/plan-be/tasks (that's plan-dev-tasks) or test-viewpoint/
  testcases (that's test-plan-writer) — both of those depend on this
  stage's LOCKED output but are separate skills so Dev and Tester stay on
  independent tracks. Do NOT let plan-dev-tasks or test-plan-writer start
  from a contract still in `draft` — lock it here first.
---

# Plan Foundation (Requirements & Design Definition — nền tảng dùng chung)

## Mục tiêu

Sinh đúng những gì CẢ Dev và Tester đều cần tham chiếu, để sau bước này
2 nhánh có thể tách ra chạy độc lập mà không phải hỏi lại nhau giữa chừng.

## HALT — dừng lại nếu chưa rõ

1. `spec.md` + `feature-design.md` đã sẵn sàng (đã qua stage trước).
2. Convention hiện tại của dự án: framework, state management, routing,
   testing convention — nếu chưa biết, quét codebase trước, không đoán.

## Quy trình

1. **Scan codebase + load spec.md + feature-design.md** — xác định
   framework/state/routing/testing convention hiện tại của dự án.
2. **Research (P0)** — câu hỏi kỹ thuật cần trả lời trước khi lên plan
   (thư viện nào, pattern nào đã có sẵn trong repo) → `research.md`.
3. **Data model** — entity/field/quan hệ liên quan feature này →
   `data-model.md`.
4. **Contracts** — API request/response giữa FE & BE → `contracts/`,
   bắt đầu ở trạng thái `draft`.
5. **Lock contract — 3-way sign-off (FE lead ∥ BE lead ∥ QA/Test lead,
   chạy song song)** — đây là "điểm chốt" rẻ nhất để bắt sai sót, vì sai ở
   đây ảnh hưởng CẢ Dev lẫn Tester cùng lúc (so với sai ở plan-fe/plan-be
   hay testcase thì chỉ ảnh hưởng 1 nhánh). QA/Test lead tham gia ngay ở
   đây để góp ý contract có đủ field/status để viết testcase sau này,
   không phải đợi tới lúc viết testcase mới phát hiện thiếu. Status đổi
   `draft → proposed → locked` sau khi cả 3 bên sign-off. KHÔNG bàn giao
   cho `plan-dev-tasks`/`test-plan-writer` khi contract còn `draft`.
6. **Quickstart** — cách chạy local để verify → `quickstart.md`.

Sau bước này, giao cho 2 skill độc lập chạy song song, không chờ nhau —
CẢ HAI đều nhận contract ở trạng thái `locked`, không còn `draft`:
- `plan-dev-tasks` (Dev) — đọc research/data-model/contracts (đã
  `locked`)/quickstart.
- `test-plan-writer` (Tester) — đọc spec.md/feature-design.md làm nguồn
  chính, data-model/contracts (đã `locked`) chỉ để tham chiếu kỹ thuật,
  KHÔNG đọc plan-fe/plan-be của Dev (tránh thiết kế test bị thiên lệch
  theo cách Dev định implement).

## Bảng quyết định — khi nào cần research trước khi viết tiếp

| Tình huống | Hành động |
|---|---|
| Pattern/thư viện đã dùng ở feature khác trong repo | Tái dùng, ghi vào research.md, KHÔNG research lại từ đầu |
| Cần thư viện/pattern mới chưa từng dùng trong repo | Research trước: so sánh 2-3 lựa chọn, ghi quyết định + lý do vào research.md |
| Contract API đã tồn tại cho entity tương tự | Mở rộng theo convention cũ, không tạo convention mới song song |

## Self-check trước khi giao cho plan-dev-tasks / test-plan-writer

- [ ] research.md trả lời đủ câu hỏi kỹ thuật P0, không để trống mục nào
- [ ] data-model.md đủ entity/field/quan hệ liên quan feature, trace được về spec.md
- [ ] contracts/ đủ request/response cho mọi endpoint liên quan VÀ đã qua đủ 3-way sign-off (FE lead ∥ BE lead ∥ QA/Test lead), chuyển sang trạng thái `locked` — chưa `locked` thì chưa bàn giao cho `plan-dev-tasks`/`test-plan-writer`
- [ ] quickstart.md chạy thử được thật (không phải lệnh suy đoán)
