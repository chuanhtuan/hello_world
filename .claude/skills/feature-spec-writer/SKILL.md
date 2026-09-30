---
name: feature-spec-writer
description: >
  Draft feature-design.md — the feature spec (business intent + logic
  flow + acceptance criteria + NFR + screen refs) from a raw business ask
  plus whatever UI reference exists (Claude Design-generated code,
  hand-written UI code, or a wireframe/mockup if no code exists yet), then
  open a GitHub issue linking it to the backlog task. Use at the start of
  a new feature, before writing User Story/spec.md. Trigger words: "viết
  đặc tả tính năng", "feature-design", "spec cho tính năng X", "write
  feature spec". Do NOT use this to write the technical spec.md (that's
  user-story-spec skill, runs AFTER this one), and do NOT use it as a
  substitute for a proper BRD/SRS — this skill assumes the business case
  and system-wide requirements were already settled earlier in the
  pipeline (Ideation & Discovery / Product Spec stages).
---

# Feature Spec Writer (Requirements & Design Definition — Đặc tả tính năng)

## Mục tiêu

Sản xuất `feature-design.md` — đặc tả tính năng ở mức **WHAT + WHY**
(business intent, logic flow, acceptance criteria gốc), KHÔNG đi vào chi
tiết kỹ thuật (đó là việc của `user-story-spec` chạy sau).

## Input nên là gì — BRD / SRS / FRS?

Không cái nào trong 3 cái đó ở dạng đầy đủ. Lý do:

| Loại tài liệu | Phạm vi | Vì sao không phải input của skill này |
|---|---|---|
| BRD (Business Requirements Document) | Toàn sản phẩm — vấn đề kinh doanh, OKR, ROI | Đã làm ở stage Ideation & Discovery / Product Spec (trước cả per-feature loop) — không lặp lại mỗi feature |
| SRS (Software Requirements Specification) | Toàn hệ thống — chức năng + phi chức năng | Quá nặng cho quy mô 1 feature; NFR hệ thống đã chốt ở Product Spec Pack, feature này chỉ cần trích ngưỡng liên quan |
| FRS (Functional Requirements Specification) | Từng feature — đây là thứ skill này TẠO RA | `feature-design.md` chính là bản FRS-lite của feature; nếu bạn đã có FRS đầy đủ rồi thì không cần skill này nữa |

**Input thực tế nên có, ở quy mô solo-dev như HelloWorld:**

1. **Yêu cầu nghiệp vụ thô** — vài câu/bullet mô tả feature này làm gì, cho
   ai, tại sao cần (không cần format BRD chuẩn, chỉ cần đủ ý). Có thể là
   note bạn tự viết, hoặc mô tả miệng bạn đưa trực tiếp cho AI.
2. **Tham chiếu UI** — xem mục dưới, không bắt buộc phải có code.
3. (Tuỳ chọn) NFR liên quan nếu feature chạm ngưỡng đã định nghĩa trước đó
   (VD giới hạn hiệu năng, bảo mật) — nếu dự án chưa có Product Spec Pack
   chính thức thì bỏ qua mục này, không tự bịa ngưỡng.

## HALT — dừng lại nếu chưa rõ các mục sau

1. Yêu cầu nghiệp vụ thô của feature (mục đích, đối tượng dùng) — nếu
   hoàn toàn không có gì để bám vào, dừng và hỏi thay vì tự suy đoán scope.
2. Một dạng tham chiếu UI nào đó cho các màn liên quan — chấp nhận BẤT KỲ
   dạng nào trong 3 dạng sau, không bắt buộc phải "đã gen":
   - UI code đã gen qua Claude Design, HOẶC
   - UI code tự viết tay (đã có trong repo), HOẶC
   - Wireframe/mockup/mô tả màn hình bằng lời nếu chưa có code (feature
     mới hoàn toàn) — ghi rõ trong feature-design.md là "UI: mô tả, chưa
     có code" để AI Codegen hoặc Dev biết cần dựng UI riêng sau.

   Chỉ dừng lại nếu KHÔNG có bất kỳ dạng nào trong 3 dạng trên — không tự
   vẽ ra màn hình hoàn toàn tưởng tượng khi không có mô tả nào cả.

## Quy trình

1. **Thu thập input** — yêu cầu nghiệp vụ thô + tham chiếu UI (bất kỳ dạng
   nào ở trên) của các màn liên quan.
2. **Check UI reference** — ghi rõ trong feature-design.md loại tham
   chiếu đang dùng cho mỗi màn (đã gen / tự viết tay / chỉ có mô tả) để
   người đọc sau biết mức độ sẵn sàng của UI.
3. **Draft feature-design.md** theo template chuẩn bên dưới.
4. Đưa cho BA (hoặc chính bạn, nếu solo) refine — bổ sung edge case thực
   tế, vẫn giữ ở mức WHAT + WHY (không lấn sang HOW).
5. Tạo GitHub issue, gắn vào backlog task, đề nghị review (BA + Dev + QC,
   hoặc tự review lại một lượt nếu làm một mình).

## Template feature-design.md (các mục bắt buộc)

| Mục | Nội dung |
|---|---|
| Business intent | Vấn đề nghiệp vụ này giải quyết cho ai, tại sao cần |
| Logic flow | Luồng chính bằng bước đánh số, kèm rẽ nhánh chính |
| Acceptance Criteria (AC) | Given/When/Then hoặc danh sách điều kiện đo được — mỗi AC phải kiểm chứng được (pass/fail), không viết mơ hồ kiểu "hoạt động tốt" |
| NFR liên quan | Ngưỡng cụ thể nếu có định nghĩa từ trước; bỏ trống + ghi "chưa định nghĩa" nếu dự án chưa có, KHÔNG tự bịa số |
| Screen refs | Tên màn hình + loại tham chiếu UI (đã gen / tự viết tay / chỉ mô tả) |

❌ AC sai — không kiểm chứng được: "Người dùng có thể đăng ký tài khoản dễ
dàng."
✅ AC đúng — pass/fail rõ ràng: "Given form Signup chỉ có Name + Email,
When submit hợp lệ, Then tài khoản tạo với status PENDING và email kích
hoạt được gửi trong vòng 5 giây."

## Self-check trước khi tạo GitHub issue

- [ ] Mỗi màn hình liên quan đều đã ghi rõ loại tham chiếu UI đang dùng (không có màn "không rõ UI là gì")
- [ ] Mọi AC đều ở dạng kiểm chứng được (pass/fail), không có câu mơ hồ
- [ ] Business intent trả lời được "ai đau, tại sao cần" chứ không chỉ mô tả tính năng
- [ ] NFR không bị bịa số khi dự án chưa có ngưỡng chính thức
- [ ] Đã gắn vào backlog task, chưa merge logic kỹ thuật (HOW) vào tài liệu này
