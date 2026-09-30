---
name: create-pr
description: >
  Open a well-formed pull request once local unit tests pass — standard PR
  template, linked spec/task/quickstart, ready for CI + AI Review + Peer
  Review. Use right after tdd-implement finishes and local UT is green.
  Trigger words: "mở PR", "create pr", "tạo pull request". Do NOT use this
  before local tests pass (that skips the whole point of the gate), and do
  NOT use it to merge the PR yourself — merging only happens after CI + AI
  Review + Peer Review all pass (a separate human action).
---

# Create PR (Integration & Verification — bàn giao sau Implementation)

## HALT — dừng lại nếu chưa rõ

1. Local unit test đã pass (BE: RED→GREEN→REFACTOR xong; FE: test L2 xanh)
   — nếu chưa chắc, chạy lại test suite trước khi mở PR, KHÔNG mở PR "để
   xem CI báo gì".
2. Task ID + spec/feature-design liên quan để link vào PR description.

## Quy trình

1. Xác nhận local UT pass (chạy lại nếu nghi ngờ).
2. Điền PR description theo template chuẩn bên dưới.
3. Link: spec.md (§ liên quan) + task ID (`tasks-fe`/`tasks-be`) +
   quickstart.md (cách người review chạy thử local).
4. Mở PR — KHÔNG tự merge. Merge chỉ xảy ra sau khi CI + AI Review + Peer
   Review đều xanh (Dev tự bấm merge ở stage riêng, không phải skill này).

## Template PR description

```markdown
## Task
<task ID> — <mô tả ngắn>

## Spec liên quan
- feature-design.md §<section>
- spec.md — User Story #<n>

## Thay đổi
<tóm tắt thay đổi chính, không liệt kê từng file>

## Cách test local
<link quickstart.md hoặc lệnh cụ thể để reviewer tự chạy>

## Checklist
- [ ] Local UT pass
- [ ] Đã tự review diff, không còn debug log/console.log thừa
- [ ] Đã đối chiếu lại business logic với spec một lần cuối
```

## Self-check trước khi mở PR

- [ ] Local UT thực sự pass (vừa chạy lại, không phải nhớ từ trước)
- [ ] PR link đủ 3 thứ: spec, task, quickstart — thiếu 1 trong 3 thì bổ sung trước khi mở
- [ ] Không có debug code / commented-out code / console.log thừa trong diff
- [ ] Title PR theo convention dự án (nếu có, VD Conventional Commits)
