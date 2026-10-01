---
name: test-plan-writer
description: >
  Turn an approved spec.md + feature-design.md (plus plan-foundation's
  data-model.md/contracts/ for technical reference only) into the
  Tester-side test design — a Test Viewpoint (test-viewpoint.md, coverage
  checklist per screen: Access/UI/Function/Security/Data), functional
  testcases (testcases-ut.md, testcases-it-st.md), Test Lead sign-off on
  both, plus tasks-qc-ut-it. This is the Tester track of Plan & Task,
  independent of the Dev track (plan-dev-tasks) — it deliberately does
  NOT read plan-fe.md/plan-be.md, so testcase design isn't biased toward
  however Dev plans to implement. Use after plan-foundation's artifacts
  exist, can run in parallel with plan-dev-tasks. Trigger words: "test
  viewpoint", "testcase UT", "testcase IT", "thiết kế test case", "test
  lead review". Do NOT use this to plan Dev's FE/BE work (that's
  plan-dev-tasks), and do NOT use this to execute the testcases (that's
  qc-automation) — qc-automation only starts once Test Lead has approved
  the testcases here, not on a draft.
---

# Plan & Task — Tester track (Requirements & Design Definition)

## Mục tiêu

Thiết kế testcase chức năng cho feature, độc lập với cách Dev sẽ
implement — chỉ bám theo AC/edge case trong `spec.md`/`feature-design.md`,
không đọc kế hoạch kỹ thuật của Dev.

## HALT — dừng lại nếu chưa rõ

1. `spec.md` + `feature-design.md` đã sẵn sàng.
2. `data-model.md` + `contracts/` từ `plan-foundation` đã tồn tại (dùng để
   tham chiếu kỹ thuật — VD field nào bắt buộc, response trả về gì —
   KHÔNG dùng để suy ra cách Dev sẽ code).

## Quy trình

1. **Sinh Test Viewpoint (`test-viewpoint.md`)** — TRƯỚC khi viết testcase
   cụ thể, liệt kê khía cạnh cần test cho mỗi màn hình liên quan: Access
   (quyền truy cập), UI (hiển thị/responsive), Function (logic nghiệp
   vụ), Security (injection, IDOR, rate limit nếu liên quan), Data (dữ
   liệu rỗng/trùng/biên).
2. **Sinh testcase từ Test Viewpoint + AC/edge case trong spec.md**:
   `testcases-ut.md` (per-screen Access/UI/Function) và
   `testcases-it-st.md` (journey liên module/toàn hệ thống + layout/
   visual — layout CHỈ kiểm ở IT).
3. **Sinh `tasks-qc-ut-it`** — task atomic cho việc verify sau này (input
   cho `qc-automation`).
4. **Test Lead review `test-viewpoint.md` + `testcases-ut.md`/
   `testcases-it-st.md`** — status đổi `draft → reviewed → approved` sau
   khi Test Lead sign-off. Mục đích: bắt thiếu sót khía cạnh/case trước
   khi tốn công chạy Playwright MCP thật, giống vai trò FE/BE lead review
   plan ở nhánh Dev. `qc-automation` CHỈ được chạy trên testcase đã
   `approved`, không chạy trên bản `draft`.

## Nguyên tắc độc lập

- KHÔNG đọc `plan-fe.md`/`plan-be.md` — nếu lỡ thấy nội dung đó (VD do
  cùng nằm trong 1 phiên hội thoại), vẫn PHẢI thiết kế testcase chỉ dựa
  trên spec/AC, không dựa trên "Dev định implement kiểu X nên test theo
  X".
- Nếu `contracts/` đổi SAU KHI đã thiết kế xong testcase (do
  `plan-dev-tasks` lock lại khác bản draft), phải rà soát lại testcase bị
  ảnh hưởng — ghi chú rõ case nào cần sửa, không lặng lẽ bỏ qua.

## Lưu ý tên gọi dễ nhầm

`testcases-ut.md` ở đây là **testcase chức năng** (per-screen, chạy qua
Playwright MCP trên app đã deploy, do `qc-automation` thực thi) — KHÁC
với "code UT" (unit test mức source code, Vitest) mà Dev viết trong
`tdd-implement`. Hai thứ dùng chung chữ "UT" nhưng độc lập hoàn toàn.

## Self-check trước khi bàn giao cho qc-automation

- [ ] test-viewpoint.md đã liệt kê đủ khía cạnh (Access/UI/Function/Security/Data) cho mỗi màn liên quan, không có màn "chưa rõ viewpoint"
- [ ] testcases-ut.md + testcases-it-st.md đã map đủ AC + edge case từ spec.md, không thiếu case nào
- [ ] Không có testcase nào được thiết kế dựa trên cách Dev implement (chỉ dựa trên AC/spec)
- [ ] Nếu contract đã đổi so với bản dùng để thiết kế testcase, đã rà soát lại và ghi chú case bị ảnh hưởng
- [ ] Test Lead đã review và chuyển status sang `approved` — chưa approved thì chưa bàn giao cho `qc-automation`
