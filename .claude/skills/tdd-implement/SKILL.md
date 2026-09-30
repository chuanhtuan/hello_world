---
name: tdd-implement
description: >
  Implement a feature task from locked plan/tasks — backend via strict TDD
  (RED→GREEN→REFACTOR), frontend via verification gates (wire logic onto
  already-generated UI, tests green before task is done) — ending in local
  unit tests passing and the create-pr skill triggered. Use once
  tasks-fe/tasks-be/testcases are approved (after plan-and-tasks). Trigger
  words: "implement this task", "code tính năng", "viết code + unit test",
  "TDD". Do NOT use this to design the plan/tasks (already done by
  plan-and-tasks) and do NOT open the PR yourself — hand off to the
  create-pr skill once local UT is green.
---

# TDD Implement (Implementation stage)

## Mục tiêu

Code feature + unit test pass local, sẵn sàng mở PR review — FE chỉ wire
logic vào UI code đã gen sẵn (KHÔNG dựng UI mới ở bước này).

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
