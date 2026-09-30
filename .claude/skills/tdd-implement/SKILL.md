---
name: tdd-implement
description: >
  Orchestrate the Implementation stage as two independent passes on two
  separate models — spawn `test-writer` agent first (writes tests from
  locked AC/contract, confirms RED) then `code-implementer` agent second
  (writes only the code to turn those tests GREEN, never touches test
  files) — ending in local unit tests passing and the create-pr skill
  triggered. Use once tasks-fe/tasks-be/testcases are approved (after
  plan-and-tasks). Trigger words: "implement this task", "code tính
  năng", "viết code + unit test", "TDD". Do NOT write tests or
  implementation code directly in this skill yourself — always delegate
  to the two agents so code and tests stay independent, and do NOT open
  the PR yourself — hand off to create-pr once local UT is green.
---

# TDD Implement (Implementation stage — điều phối)

## Mục tiêu

Điều phối một task từ `tasks-fe`/`tasks-be` qua đúng 2 bước độc lập, mỗi
bước một model riêng, để test không bị "overfit" theo cách chính model
viết code sẽ implement:

1. `test-writer` agent (model riêng) — viết test trước, xác nhận RED.
2. `code-implementer` agent (model khác) — viết code để test GREEN,
   không được sửa file test.

Skill này KHÔNG tự viết test hay code — chỉ gọi đúng thứ tự 2 agent trên
và kiểm tra bàn giao giữa 2 bước.

## HALT — dừng lại nếu chưa rõ

1. Task cụ thể đang làm (từ `tasks-fe`/`tasks-be`, có ID rõ ràng, VD `B2`).
2. Contract/AC liên quan đã LOCK ở stage Plan & Task — nếu contract chưa
   lock hoặc đã đổi mà chưa thông báo, dừng lại và xác nhận trước khi bắt
   đầu.

## Quy trình

1. **Gọi `test-writer` agent** với task ID + AC/contract liên quan —
   nhận về file test + xác nhận RED (fail vì thiếu implementation, không
   phải lỗi cú pháp).
2. **Kiểm tra bàn giao bước 1** — mỗi test có trace ID về AC/contract,
   không có test mồ côi, trạng thái RED đúng lý do. Nếu chưa đạt, quay
   lại `test-writer`, chưa chuyển sang bước 2.
3. **Gọi `code-implementer` agent** với task ID + file test đã có — nhận
   về code implementation + xác nhận GREEN.
4. **Kiểm tra bàn giao bước 2** — `git diff` xác nhận file test không bị
   đổi, chỉ có file implementation thay đổi. Nếu file test bị sửa, coi
   như vi phạm ranh giới, yêu cầu `code-implementer` làm lại.
5. Local UT loop (bên trong `code-implementer`, xem HALT/self-check của
   agent đó) — auto-fix tối đa 5 vòng, escalate Dev nếu vẫn fail, không
   bao giờ sửa test để pass giả.
6. Dev review code local lần cuối: logic đúng spec, không over-engineer,
   naming chuẩn, không dead code.
7. Trigger `create-pr` skill khi UT pass local.

## Bảng quyết định — BE hay FE workflow

| Thay đổi thuộc về | Workflow |
|---|---|
| Endpoint/service/migration | BE — test-writer viết test trước (RED), code-implementer viết code (GREEN → REFACTOR) |
| Component/state/UI logic trên UI đã gen | FE — test-writer viết test L2 trước, code-implementer wire logic rồi verify |
| Cả hai (full-stack task) | Chạy cả hai workflow song song, PR riêng cho FE và BE, mỗi bên vẫn qua đủ 2 agent |

## Self-check trước khi trigger create-pr

- [ ] Đã gọi đúng thứ tự: `test-writer` trước, `code-implementer` sau — không đảo ngược, không để cùng một lượt gọi vừa viết code vừa viết test
- [ ] `code-implementer` không sửa bất kỳ file test nào (`git diff` xác nhận)
- [ ] BE: mọi test đều được viết trước code (RED trước GREEN)
- [ ] FE: test L2 xanh, không có `.skip`/`.todo` che giấu test chưa qua
- [ ] Không còn vòng lặp AI Fix Agent nào bị escalate mà chưa Dev xử lý
- [ ] Dev đã đọc lại business logic một lần cuối, không chỉ tin AI viết đúng
