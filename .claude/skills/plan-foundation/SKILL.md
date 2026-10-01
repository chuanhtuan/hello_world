---
name: plan-foundation
description: >
  Turn an approved spec.md + feature-design.md into the shared design
  artifacts both Dev and Tester need — research.md, data-model.md,
  contracts/ (API request/response, drafted here) and quickstart.md. This
  is the common first stage of Plan & Task: after it, Dev (plan-dev-tasks)
  and Tester (test-plan-writer) branch into two independent flows that
  both read these files but do not depend on each other's output. Use
  right after spec.md is committed, before plan-dev-tasks or
  test-plan-writer. Trigger words: "plan nền tảng", "research + data
  model + contract", "plan-foundation". Do NOT use this to write
  plan-fe/plan-be/tasks (that's plan-dev-tasks) or test-viewpoint/
  testcases (that's test-plan-writer) — both of those depend on this
  stage's output but are separate skills so Dev and Tester stay on
  independent tracks.
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
   trạng thái `draft` ở bước này (LOCK chính thức diễn ra ở
   `plan-dev-tasks` khi FE lead + BE lead sign-off plan của họ).
5. **Quickstart** — cách chạy local để verify → `quickstart.md`.

Sau bước này, giao cho 2 skill độc lập chạy song song, không chờ nhau:
- `plan-dev-tasks` (Dev) — đọc research/data-model/contracts/quickstart.
- `test-plan-writer` (Tester) — đọc spec.md/feature-design.md làm nguồn
  chính, data-model/contracts chỉ để tham chiếu kỹ thuật, KHÔNG đọc
  plan-fe/plan-be của Dev (tránh thiết kế test bị thiên lệch theo cách
  Dev định implement).

## Bảng quyết định — khi nào cần research trước khi viết tiếp

| Tình huống | Hành động |
|---|---|
| Pattern/thư viện đã dùng ở feature khác trong repo | Tái dùng, ghi vào research.md, KHÔNG research lại từ đầu |
| Cần thư viện/pattern mới chưa từng dùng trong repo | Research trước: so sánh 2-3 lựa chọn, ghi quyết định + lý do vào research.md |
| Contract API đã tồn tại cho entity tương tự | Mở rộng theo convention cũ, không tạo convention mới song song |

## Self-check trước khi giao cho plan-dev-tasks / test-plan-writer

- [ ] research.md trả lời đủ câu hỏi kỹ thuật P0, không để trống mục nào
- [ ] data-model.md đủ entity/field/quan hệ liên quan feature, trace được về spec.md
- [ ] contracts/ đủ request/response cho mọi endpoint liên quan, đánh dấu rõ trạng thái `draft`
- [ ] quickstart.md chạy thử được thật (không phải lệnh suy đoán)
