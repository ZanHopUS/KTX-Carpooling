# EPIC-06 — Architecture & Maintainability

- **EPIC ID:** EPIC-06
- **Tên:** Kiến trúc & Khả năng bảo trì
- **Thứ tự ưu tiên:** 6 / 10 (theo `constitution.md` §5)
- **Trạng thái:** `PROPOSED`
- **Phụ thuộc:** EPIC-01 (không refactor khi còn lỗ hổng uỷ quyền)
- **Mức rủi ro tổng thể:** 🟡 Trung bình

---

## Mục tiêu

Đưa codebase về một cấu trúc có thể mở rộng và bảo trì an toàn: tập trung hoá logic nghiệp vụ,
loại bỏ code chết/trùng lặp, thiết lập baseline kiểm tra tự động, và tạo điều kiện cho người
hoặc agent tiếp theo làm việc mà không phá vỡ hệ thống.

**Nguyên tắc:** Đây là EPIC *không tạo ra giá trị người dùng trực tiếp*. Chỉ thực hiện **sau**
khi các lỗ hổng bảo mật (EPIC-01), blocker auth (EPIC-02) và tính toàn vẹn dữ liệu (EPIC-03)
đã được xử lý. Refactor trước khi có test/ràng buộc = tạo rủi ro không đo được.

---

## Trạng thái hiện tại (bằng chứng)

### A6-01 — Logic nghiệp vụ nằm rải rác, dễ lệch nhau

| Vị trí | Nội dung | Ghi chú |
|--------|----------|---------|
| `src/lib/pricing.ts` | `PRICING_CONFIG` + `calculateSuggestedPrice()` | Dùng bởi form tạo chuyến |
| `src/lib/matching.ts` | Thuật toán matching + scoring | Dùng bởi trang tìm chuyến |
| `src/utils/constants.ts` | `DORM_AREAS`, `DORM_BUILDINGS`, `UNIVERSITIES` | Nguồn sự thật cho dropdown |
| `src/lib/ai.ts` | Parse NL → chuyến đi + regex fallback | Trùng khái niệm với pricing/matching |

Cùng một khái niệm (giá, khoảng cách, trường) được xử lý ở nhiều nơi nhưng **không có nguồn sự thật
duy nhất** cho business rules. Ví dụ: công thức giá xuất hiện trong `utils/pricing.ts` (dùng thật)
và mô tả lại trong tài liệu; nếu sửa một chỗ mà quên chỗ khác → sai lệch âm thầm.

### A6-02 — Code chết / không được gọi

| Vị trí | Loại | Bằng chứng |
|--------|------|-----------|
| `src/types/database.ts:62` `Rating` | Type | Không nơi nào import (đã grep) |
| `src/types/database.ts:72` `TripReport` | Type | Không nơi nào import (đã grep) |
| Landing page quick search | UI | Không gọi API / không gắn handler |
| `src/utils/matching.ts` `pickup_score` | Logic | Được khai báo nhưng **không bao giờ gán giá trị** ⇒ điểm tối đa thực tế chỉ 75/100 (xem EPIC-04) |
| `src/app/globals.css` `.badge-*` một phần | CSS | Không thấy class tương ứng trong component |

Code chết gây hiểu nhầm cho người đọc và làm sai lệch ước lượng độ phức tạp.

### A6-03 — Không có baseline kiểm tra tự động

- Không có thư mục `__tests__`, không có file `*.test.*` / `*.spec.*` (đã kiểm tra).
- Không có script `test` trong `package.json`.
- Không có CI config (không có `.github/workflows/`).
- Hệ quả: mọi thay đổi đều không có lưới an toàn; quy trình verification duy nhất là đọc diff tay
  (xem `verification-protocol.md`).

### A6-04 — Không có lớp validation/typing ở ranh giới dữ liệu

- Server Action nhận `FormData` và `as Type` thủ công; không có schema validation (zod/valibot).
- Dữ liệu từ Supabase được cast `as UserProfile` / `as Trip` mà không kiểm tra runtime.
- Enum trạng thái được so sánh dạng chuỗi thô ở nhiều nơi (`=== 'OPEN'`, `=== 'ACCEPTED'`), không
  tập trung thành hằng số ⇒ rủi ro chính tả và rủi ro lệch case (đã thấy trong EPIC-03).

### A6-05 — Cấu trúc thư mục chưa nhất quán

- `src/utils/` hiện chứa `supabase/` (hạ tầng) và `constants.ts`; pricing/matching thực tế nằm trong `src/lib/`.
- `src/lib/` chứa `ai.ts`, `pricing.ts`, `matching.ts`, `messenger.ts`; các tài liệu cũ dùng `gemini.ts` là lỗi thời.
- `src/components/` tồn tại nhưng hiện chưa có component dùng chung đáng kể, không nên ghi là thư mục không tồn tại.
- Route admin nằm ngoài `(main)` group nhưng dùng cùng layout gốc, dẫn tới việc thiếu kiểm tra auth
  bị bỏ sót (xem EPIC-01).

### A6-06 — Tài liệu và code có nguy cơ trôi dạt

- `supabase/schema.sql` là file **chỉ có comment**, không chạy được.
- `docs/audit/repository-audit.md` chứa phát hiện đã lỗi thời (middleware vs proxy) ⇒ tài liệu cũ
  có thể gây quyết định sai nếu không được đánh dấu ngày/phiên bản.
- Chưa có cơ chế nào ràng buộc tài liệu phải cập nhật khi code đổi.

---

## Trạng thái đích

1. **Nguồn sự thật duy nhất cho business rule**: mọi hằng số/hàm nghiệp vụ (giá, matching, danh mục
   trường/ktx) nằm ở một nơi, được import lại — không định nghĩa lặp.
2. **Không còn code chết**: mỗi file/type/hàm còn lại đều có nơi gọi thật, hoặc đã bị xoá có chủ đích.
3. **Có baseline kiểm tra tự động**: script `lint` + `typecheck` chạy được bằng một lệnh; tối thiểu có
   unit test cho các hàm thuần (pricing, matching, format) — nơi rủi ro cao nhất mà chi phí thấp nhất.
4. **Ranh giới dữ liệu được kiểm soát**: input của mọi Server Action được validate trước khi dùng;
   enum trạng thái là hằng số tập trung, không so sánh chuỗi rải rác.
5. **Cấu trúc thư mục có quy ước rõ ràng** và được ghi lại trong `.ai/architecture.md`.
6. **Tài liệu có dấu vết thời gian** để biết khi nào nó lỗi thời.

---

## Phụ thuộc

- **EPIC-01** phải hoàn tất trước khi refactor các Server Action (tránh chồng chéo diff và tránh
  việc refactor che mất lỗi bảo mật).
- **EPIC-03** phải hoàn tất trước khi "chuẩn hoá enum" (vì enum thật phụ thuộc DB — hiện `UNKNOWN`).
- Không bắt đầu refactor trip/matching/pricing trước khi EPIC-03 chốt mapping với schema `trips` normalized 27 cột.
- **Q1 (quyền truy cập DB)** — không thể viết test dựa trên dữ liệu thật nếu chưa có quyền.
- Không phụ thuộc quyết định PO cho phần lớn hạng mục, **ngoại trừ** phạm vi test (xem Q10 đề xuất).

---

## Rủi ro

| ID | Rủi ro | Mức | Giảm thiểu |
|----|--------|-----|-----------|
| R6-01 | Refactor không có test ⇒ vô tình phá luồng nghiệp vụ đang chạy | 🔴 Cao | Bắt đầu bằng test cho hàm thuần, refactor từng bước nhỏ, verify bằng `verification-protocol.md` |
| R6-02 | "Chuẩn hoá enum" khi chưa biết enum thật trong DB ⇒ làm hỏng dữ liệu | 🔴 Cao | **Bắt buộc chờ EPIC-03 + Q1**; không đổi hằng số trước khi xác nhận DB |
| R6-03 | Xoá code chết nhưng thực tế đang được dùng qua đường dẫn động (dynamic import / string) | 🟡 TB | Grep toàn repo trước khi xoá; thực hiện trong task riêng, dễ revert |
| R6-04 | Thêm validation (zod) làm đổi hành vi hiện tại theo hướng chặt hơn ⇒ chặn input hợp lệ cũ | 🟡 TB | Ghi rõ trong acceptance criteria; test với dữ liệu thật |
| R6-05 | Phạm vi EPIC quá rộng ⇒ không bao giờ xong | 🟡 TB | Chia thành task nhỏ, mỗi task ≤ 1 module |

---

## Danh sách task đề xuất

| Task | Nội dung | Trạng thái | Ghi chú |
|------|----------|-----------|---------|
| T-06-01 | Thiết lập baseline: script `typecheck` + `lint` + ghi lại kết quả hiện tại làm mốc | `PROPOSED` | Không đổi code, chỉ thêm script |
| T-06-02 | Rà soát & xoá code chết đã xác nhận (`Rating`, `TripReport`, UI chết), mỗi mục 1 commit | `PROPOSED` | Cần grep xác nhận trước khi xoá |
| T-06-03 | Tập trung hoá enum trạng thái + hằng số nghiệp vụ thành một module duy nhất | `PROPOSED` | **Chặn bởi EPIC-03 / Q1** |
| T-06-04 | Thêm validation schema cho input Server Action | `PROPOSED` | **Chặn bởi EPIC-01** (tránh chồng diff) |
| T-06-05 | Viết unit test cho hàm thuần: pricing, matching, format | `PROPOSED` | Cần PO duyệt phạm vi test (Q10) |
| T-06-06 | Chuẩn hoá cấu trúc `src/lib` vs `src/utils` + cập nhật `architecture.md` | `PROPOSED` | Di chuyển file — cần cẩn trọng với import path |

---

## Liên kết

- `constitution.md` §5 — thứ tự ưu tiên (EPIC-06 ở mức 6)
- `architecture.md` — rủi ro kiến trúc A1–A8
- `EPIC-01-security-authorization.md` — EPIC chặn EPIC-06
- `EPIC-03-data-integrity.md` — EPIC chặn hạng mục enum
- `verification-protocol.md` — quy trình verify cho mọi task trong EPIC này
