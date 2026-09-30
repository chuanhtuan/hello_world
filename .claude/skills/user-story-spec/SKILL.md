---
name: user-story-spec
description: >
  Convert an already 3-way-approved feature-design.md into spec.md —
  the technical spec with User Stories, edge cases, requirements, key
  entities, success criteria and assumptions. Use right after
  feature-design.md is reviewed/approved by BA+Dev+QC, before Plan &
  Task. Trigger words: "user story", "spec.md", "viết specs kỹ thuật",
  "chuyển feature design thành spec". Do NOT use this on a feature-design
  that hasn't been 3-way approved yet, and do NOT use it to plan tasks or
  split FE/BE work (that's plan-and-tasks skill, runs after this one).
---

# User Story / Spec Writer (Requirements & Design Definition — User Story)

## Mục tiêu

Chuyển `feature-design.md` (đã duyệt) thành đặc tả kỹ thuật chi tiết hơn:
User Stories + edge cases + requirements + key entities + success criteria +
assumptions — vẫn KHÔNG phải là plan/task (đó là bước sau).

## HALT — dừng lại nếu chưa rõ

1. `feature-design.md` đã được BA + Dev + QC review & approve — nếu chưa
   rõ trạng thái approve, hỏi lại trước khi dùng làm nguồn.
2. Codebase hiện tại (để đối chiếu edge case với cách hệ thống đang xử lý
   validation/permission/concurrency).

## Quy trình

1. Sinh khung specs từ feature-design (US + AC theo template, mỗi US phải
   trace ngược về đúng mục trong feature-design, VD "trace §3").
2. Dev bổ sung edge cases: validation, permission, concurrency, dữ liệu
   rỗng — đối chiếu với UI code + codebase hiện có, không đoán suông.
3. Liệt kê key entities + requirements: entity, quan hệ, FR/NFR liên quan
   trực tiếp tới feature này.
4. Chốt success criteria (định nghĩa "xong" đo được) + assumptions (giả
   định chưa chắc chắn → hỏi BA ngay trong issue thread, không tự quyết).
5. Tổng hợp `spec.md`, commit cùng nhánh feature.

## spec.md phải đủ 6 mục

| # | Mục | Yêu cầu |
|---|---|---|
| 1 | User Stories | Dạng "Là [role], tôi muốn [action] để [outcome]" + AC riêng cho từng US |
| 2 | Edge cases | Danh sách cụ thể: input rỗng, quyền không đủ, race condition, đã tồn tại/trùng |
| 3 | Requirements | FR/NFR liên quan, mỗi mục trace về feature-design |
| 4 | Key entities | Tên entity + field chính + quan hệ |
| 5 | Success criteria | Đo được, không mơ hồ |
| 6 | Assumptions | Giả định + trạng thái (đã hỏi BA / đang chờ xác nhận) |

## Nguyên tắc

- Mỗi US phải trace về đúng §mục trong feature-design — không bịa thêm
  phạm vi ngoài feature-design đã duyệt.
- Assumption CHƯA xác nhận → hỏi BA trong issue thread ngay, không tự
  quyết rồi ghi như thể đã chốt.

## Self-check trước khi commit

- [ ] Đủ 6 mục, không thiếu mục nào
- [ ] Mỗi US có AC riêng và trace về feature-design
- [ ] Edge cases đối chiếu với codebase thật, không phải danh sách chung chung copy-paste
- [ ] Assumption nào chưa chắc đã được hỏi BA trong issue thread, không tự chốt
