---
name: plan-dev-tasks
description: >
  Turn plan-foundation's shared artifacts (research/data-model/contracts —
  already LOCKED there — /quickstart) into the Dev-side plan and tasks —
  plan-fe.md, plan-be.md (component/state/route, endpoint/service/
  migration), FE lead ∥ BE lead review/approval of those plans, and atomic
  tasks-fe/tasks-be split for implementation. This is the Dev track of
  Plan & Task, independent of the Tester track (test-plan-writer) — it
  does NOT read or wait for test-viewpoint/testcases, and it does NOT
  re-open or change the contract (that was already locked by a 3-way
  sign-off in plan-foundation — raise it back there if a change is truly
  needed). Use after plan-foundation's contract is `locked`. Trigger
  words: "plan-fe", "plan-be", "chia task FE BE", "lên plan dev",
  "/plan --split". Do NOT use this to design testcases (that's
  test-plan-writer, runs independently) and do NOT use this to write the
  actual feature code (that's tdd-implement, runs after this one).
---

# Plan & Task — Dev track (Requirements & Design Definition)

## Mục tiêu

Chuyển artifact nền tảng (`research.md`/`data-model.md`/`contracts/`/
`quickstart.md`) thành kế hoạch + task cụ thể cho Dev FE/BE — độc lập
hoàn toàn với nhánh Tester, không cần chờ `test-plan-writer`.

## HALT — dừng lại nếu chưa rõ

1. Artifact từ `plan-foundation` đã tồn tại (`research.md`, `data-model.md`,
   `quickstart.md`) VÀ `contracts/` đã ở trạng thái `locked` (qua 3-way
   sign-off FE lead ∥ BE lead ∥ QA/Test lead ở `plan-foundation`) — nếu
   còn `draft`, DỪNG LẠI, quay lại `plan-foundation` để lock trước, không
   tự ý plan tiếp trên bản chưa chốt.
2. Convention FE/BE hiện tại của dự án (đã xác định ở `plan-foundation`,
   dùng lại, không quét lại từ đầu).

## Quy trình

1. **Sinh `plan-fe.md`** — component/state/route cần thêm, dựa trên
   `contracts/` (draft) + `data-model.md`.
2. **Sinh `plan-be.md`** — endpoint/service/migration cần thêm, dựa trên
   cùng nguồn.
3. **FE lead review `plan-fe.md` ∥ BE lead review `plan-be.md` song
   song** — status đổi `draft → proposed → approved` sau khi sign-off.
   Đây là review KẾ HOẠCH KỸ THUẬT nội bộ của Dev (component/route ở FE,
   service/migration ở BE), KHÔNG phải lock contract — contract đã
   `locked` ở `plan-foundation` rồi. Nếu lúc review phát hiện contract cần
   đổi so với bản đã lock, KHÔNG tự sửa ở đây — quay lại `plan-foundation`
   để mở lại 3-way sign-off, tránh Tester đang cầm bản contract cũ mà
   không biết.
4. **Sinh tasks atomic**: `tasks-fe` (F0–F4), `tasks-be` (B0–B4),
   `constraints` (cross-cutting, VD naming convention áp dụng cho cả
   FE/BE).

Không có bước duyệt chung với Tester ở cuối — sự thống nhất giữa các bên
đã có từ `spec.md` (đã 3 bên approve ở stage trước) và từ bước lock
contract ở đây; thêm một vòng duyệt chung cuối Plan & Task là dư thừa.

## Bảng quyết định — khi nào cần research trước khi plan

| Tình huống | Hành động |
|---|---|
| Pattern/thư viện đã dùng ở feature khác trong repo | Tái dùng (đã ghi ở `research.md` từ `plan-foundation`), KHÔNG research lại |
| Phát sinh câu hỏi kỹ thuật MỚI chưa có trong `research.md` | Bổ sung vào `research.md`, không tự quyết ngầm trong `plan-fe`/`plan-be` |
| Contract cần đổi so với bản đã `locked` | KHÔNG tự sửa ở `plan-dev-tasks` — quay lại `plan-foundation`, mở lại 3-way sign-off (FE lead ∥ BE lead ∥ QA/Test lead), ghi lý do đổi |

## Self-check trước khi mở gate Implementation

- [ ] plan-fe.md/plan-be.md đã được FE lead/BE lead approve (`approved`); KHÔNG có thay đổi contract nào lọt qua mà chưa quay lại `plan-foundation` để mở lại 3-way sign-off
- [ ] tasks-fe/tasks-be atomic đủ nhỏ để review từng task trong 1 PR
- [ ] plan-fe.md/plan-be.md không tham chiếu testcase nào của Tester (giữ độc lập 2 track)
- [ ] Không có task nào thiếu trace về spec.md/feature-design.md
