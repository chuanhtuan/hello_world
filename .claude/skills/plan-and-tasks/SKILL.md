---
name: plan-and-tasks
description: >
  Turn an approved spec.md + feature-design.md into full design
  artifacts (research, data-model, contracts, quickstart, plan-fe,
  plan-be), a Test Viewpoint (coverage checklist per screen — Access/UI/
  Function/Security/Data), and atomic tasks split by FE/BE/QC (tasks-fe,
  tasks-be, tasks-qc-ut-it) — the Plan & Task stage, last gate before
  Implementation. Use after spec.md is committed. Trigger words: "plan &
  task", "chia task FE BE", "lên plan tính năng", "/plan --split", "test
  viewpoint". Do NOT use this to write the actual feature code (that's
  tdd-implement, runs after this one), and do NOT skip QC — Test
  Viewpoint + testcases must be designed here, before code exists, not
  after.
---

# Plan & Task (Requirements & Design Definition — Plan & Task)

## Mục tiêu

Chuyển specs → toàn bộ design artifact + tasks atomic cho Dev FE/BE và QC.
Đây là **gate cuối cùng của phase Requirements & Design Definition** — sau
bước này, Dev bắt đầu code (Implementation).

## HALT — dừng lại nếu chưa rõ

1. `spec.md` + `feature-design.md` đã sẵn sàng (đã qua stage trước).
2. Convention hiện tại của dự án: framework, state management, routing,
   testing convention — nếu chưa biết, quét codebase trước, không đoán.

## Quy trình

1. **Scan codebase + load spec.md + feature-design.md** — xác định
   framework/state/routing/testing convention hiện tại của dự án
   (VD: HelloWorld dùng React + Express + Sequelize + Vitest).
2. **Sinh atomic 6 file** (`research.md`, `data-model.md`, `contracts/`,
   `quickstart.md`, `plan-fe.md`, `plan-be.md`):
   - P0 research: câu hỏi kỹ thuật cần trả lời trước khi lên plan (thư
     viện nào, pattern nào đã có sẵn trong repo).
   - P1 shared: data-model (entity/field/quan hệ), contracts (API
     request/response — LOCK làm nguồn tham chiếu chung giữa FE/BE),
     quickstart (cách chạy local để verify).
   - P1 split: plan-fe (component/state/route cần thêm), plan-be
     (endpoint/service/migration cần thêm).
3. **FE lead review plan-fe ∥ BE lead review plan-be song song** — status
   đổi `draft → proposed → locked` sau khi sign-off. Contract KHÔNG được
   đổi sau khi locked mà không thông báo lại cả hai bên.
4. **Sinh tasks atomic**: `tasks-fe` (F0–F4), `tasks-be` (B0–B4),
   `tasks-qc-ut-it`, `constraints` (cross-cutting, VD: naming convention áp
   dụng cho cả FE/BE).
5. **QC + AI sinh Test Viewpoint rồi testcases UT + IT-ST, song song với
   Dev review plan**:
   - **Test Viewpoint (`test-viewpoint.md`)** — TRƯỚC khi viết testcase cụ
     thể, liệt kê khía cạnh cần test cho mỗi màn hình liên quan: Access
     (quyền truy cập), UI (hiển thị/responsive), Function (logic nghiệp
     vụ), Security (injection, IDOR, rate limit nếu liên quan), Data (dữ
     liệu rỗng/trùng/biên). Mục đích: đảm bảo testcase sau không bỏ sót
     khía cạnh, và cho Dev một checklist cụ thể để tự test trước khi mở
     PR (xem `tdd-implement`/`code-reviewer`/`security-reviewer`).
   - Từ Test Viewpoint, map AC + edge cases từ spec.md sang testcase cụ
     thể (`testcases-ut.md`, `testcases-it-st.md`), làm input cho
     `qc-automation` agent về sau.
   - Lưu ý tên gọi: `testcases-ut.md` ở đây là **testcase chức năng**
     (per-screen, chạy qua Playwright MCP trên app đã deploy) — KHÁC với
     "unit test" mức source code (Vitest) mà Dev viết ở bước
     `tdd-implement`. Hai thứ dùng chung chữ "UT" nhưng là 2 khái niệm
     độc lập, không trộn lẫn.
6. **Dev + QC duyệt toàn bộ một lượt cuối phase** — specs + plan + tasks +
   testcases duyệt cùng lúc, không duyệt rời rạc từng phần.

## Bảng quyết định — khi nào cần research trước khi plan

| Tình huống | Hành động |
|---|---|
| Pattern/thư viện đã dùng ở feature khác trong repo | Tái dùng, ghi vào research.md, KHÔNG research lại từ đầu |
| Cần thư viện/pattern mới chưa từng dùng trong repo | Research trước: so sánh 2-3 lựa chọn, ghi quyết định + lý do vào research.md |
| Contract API đã tồn tại cho entity tương tự | Mở rộng theo convention cũ, không tạo convention mới song song |

## Self-check trước khi mở gate Implementation

- [ ] contracts/ đã lock, FE lead + BE lead đều đã sign-off
- [ ] tasks-fe/tasks-be atomic đủ nhỏ để review từng task trong 1 PR
- [ ] test-viewpoint.md đã liệt kê đủ khía cạnh (Access/UI/Function/Security/Data) cho mỗi màn liên quan, không có màn "chưa rõ viewpoint"
- [ ] testcases-ut.md + testcases-it-st.md đã map đủ AC từ spec.md VÀ đủ khía cạnh từ test-viewpoint.md, không thiếu case nào
- [ ] Dev + QC đã duyệt TOÀN BỘ (specs + plan + tasks + test-viewpoint + testcases) một lượt, không rải rác nhiều lần duyệt
