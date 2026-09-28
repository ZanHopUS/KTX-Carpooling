# EPIC-03 — Data Integrity & Code ↔ DB Alignment

| Trường | Giá trị |
|---|---|
| **EPIC ID** | EPIC-03 |
| **Tên** | Data Integrity & Code ↔ DB Alignment |
| **Ưu tiên** | 3 (Data integrity + đồng bộ code ↔ DB) |
| **Mức độ** | 🔴 Chặn — mọi epic sau đều phụ thuộc; hiện đang chặn cả "Đăng chuyến" thật |
| **Trạng thái** | `IN_PROGRESS` — TASK-002 `DONE`; PO trả lời trọn bộ D-03-01…D-03-11 (2026-09-22) |
| **Phụ thuộc** | Hướng đồng bộ ĐÃ CHỐT (D-03-01: boundary DTO mapping); còn thiếu dump live cho các bảng còn lại + enum + RLS → TASK-003 |

---

## 1. Goal

Chuyển toàn bộ hiểu biết về database từ trạng thái `UNKNOWN` sang `ACTUAL`, và đưa **file DDL thật** vào repo để schema có nguồn sự thật duy nhất, tái lập được.

**Mở rộng (2026-09-21, quyết định A1 của TASK-001):** đồng bộ hoá code ↔ DB thật theo hướng PO chọn (sửa code theo DB, hay migration đưa DB về thiết kế code). Kết thúc epic: tính năng "Đăng chuyến" hoạt động với schema thật, và các runtime test của TASK-001 (TC-1…TC-11) chạy được.

---

## 2. Current state (bằng chứng)

| # | Vấn đề | Bằng chứng |
|---|---|---|
| 1 | `supabase/migrations/` **rỗng hoàn toàn** (0 file) | `ls` |
| 2 | `supabase/schema.sql` **chỉ là comment**, không có câu SQL nào chạy được | đọc toàn file (29 dòng) |
| 3 | File `migrations/20260916_align_ktx_schema.sql` được tham chiếu nhưng **không tồn tại** | `schema.sql:2` |
| 4 | `trips`: code dùng `date`, tài liệu + schema nói `trip_date` | `trips/actions.ts:37` vs `schema.sql:18` |
| 5 | `profiles`: type dùng `status`, tài liệu nói `account_status` | `types/database.ts` vs `docs/database/supabase-structure.md` |
| 6 | Enum case: code gửi HOA, schema comment ghi thường | `(auth)/register/page.tsx` (radio HOA) vs `schema.sql:14` |
| 7 | Bảng `ratings` — đã tồn tại nhưng schema cột chưa dump | `chat/actions.ts:63`, PO DB evidence 2026-09-21 |
| 8 | Bảng `messages` — đã xác minh không tồn tại trên DB DEV | `chat/page.tsx:61`, PO DB evidence 2026-09-21 |
| 9 | Ảnh thẻ KTX lưu ở bucket **public** `dorm-cards` | `(main)/profile/actions.ts` |
| 10 | Upload lỗi ⇒ **tạo URL giả** rồi vẫn chuyển `PENDING` | `(main)/profile/actions.ts` |
| 11 | Trạng thái `NEED_REVIEW` có trong schema, không có trong code | `schema.sql:12` |
| 12 | RPC `accept_trip_request()` + `is_admin()` + `is_verified_user()` có trong schema nhưng code không dùng | `schema.sql:28-29` |
| 13 | **`trips` thật là một thiết kế khác hoàn toàn**: 27 cột normalized (FK `vehicle_id`/`route_id`/`pickup_location_id`, `trip_date`, `price_snapshot`…); trong 17 cột code insert chỉ 3 tồn tại (`driver_id`, `status`, `created_at`); không dòng code nào dùng thiết kế thật ⇒ "Đăng chuyến" hỏng với mọi user | CSV của PO (2026-09-21) — chi tiết `database-context.md` §16 |

**Tổng: 13 sự kiện `UNKNOWN` (U01–U13)** — xem `.ai/database-context.md` §4. Riêng `trips` đã có dữ kiện `ACTUAL` đầy đủ (§16) nhưng code hoàn toàn lệch thiết kế.

---

## 3. Target state

- [ ] Có file DDL/migration trong repo, chạy được trên môi trường trống.
- [ ] `.ai/database-context.md`: **0 mục `UNKNOWN`**; mọi bảng/cột/enum được gắn `ACTUAL`.
- [ ] Tên cột trong code khớp 100% với DB thật.
- [ ] Giá trị enum thống nhất một quy ước (HOA hoặc thường) trên toàn hệ thống.
- [ ] Chỉ còn **một** bucket lưu thẻ KTX, quyền **private**.
- [ ] Không còn đường nào tạo URL ảnh giả.
- [ ] RLS được review và ghi lại thành văn bản dưới dạng `ACTUAL`.
- [ ] Code ghi/đọc `trips` (và các bảng liên quan) khớp 100% với thiết kế được PO chọn; "Đăng chuyến" hoạt động end-to-end.
- [ ] TC-1…TC-11 của TASK-001 được chạy lại và PASS (runtime AC-01…AC-06).

---

## 4. Dependencies

| Loại | Nội dung |
|---|---|
| ✅ Giải một phần | Q1 — đã có CSV cột `trips` (2026-09-21); dump còn lại gom vào **TASK-003** (`trip_requests`, `profiles`, `vehicles`, `routes`, `locations`, `ratings`, enum, RLS) |
| ✅ ĐÃ GIẢI | Q2 — `trip_date` (CSV 2026-09-21; code đang sai) |
| ✅ ĐÃ GIẢI (policy, 2026-09-22) | Q3/D-03-04 — field canonical là field trên **live DB**, không rename/migrate chỉ để khớp code/docs; giá trị cụ thể chờ dump TASK-003 |
| ✅ ĐÃ GIẢI (policy, 2026-09-22) | Q4/D-03-06 — enum live (values + casing) là canonical, app normalize tại boundary; values chờ dump TASK-003 |
| ✅ ĐÃ GIẢI | Q5/D5 — `messages` đã được tạo qua TASK-002 (áp dụng + runtime-verified 2026-09-21); `ratings` tồn tại, schema chờ dump |
| ✅ ĐÃ GIẢI (policy, 2026-09-22) | Q7/D-03-07 — verification bắt buộc cho core carpool actions, không áp cho chức năng chỉ xem; danh sách action chốt bằng evidence/product contract |
| Cần PO | **Q10** có áp dụng `NEED_REVIEW`? — chưa trả lời |
| ✅ ĐÃ GIẢI | **Hướng đồng bộ (D-03-01, 2026-09-22)** — **Boundary DTO Mapping**: UI/domain dùng DTO, mapping sang normalized `trips` ở repository/service boundary |
| Kỹ thuật | Xác nhận RLS thật trước khi tin vào tài liệu |

---

## 5. Risk

| Rủi ro | Mức | Giảm thiểu |
|---|---|---|
| Đổi tên cột trong code theo tài liệu, nhưng DB thật lại theo code ⇒ **hỏng toàn bộ** | 🔴 Chặn | **Không sửa gì trước khi có schema thật** |
| Đổi case enum ⇒ dữ liệu cũ không còn khớp | 🔴 Chặn | Cần migration chuyển đổi + kiểm tra dữ liệu hiện có |
| Chuyển bucket sang private ⇒ ảnh cũ mất truy cập | 🟠 Cao | Cần signed URL cho ảnh cũ |
| Đưa DDL vào repo mà lệch DB thật ⇒ gây hiểu nhầm | 🟠 Cao | DDL phải sinh từ DB thật, không viết tay |
| Chọn hướng đồng bộ sai ⇒ phải làm lại hai lần | 🔴 Chặn | Task đầu tiên của epic là PO quyết định hướng, dựa trên DDL thật + phân tích code |
| RLS yếu ⇒ mọi thứ khác vô nghĩa | 🔴 Chặn | Review RLS là phần bắt buộc của epic này |

---

## 6. Tasks

| Task | Tên | Trạng thái |
|---|---|---|
| **TASK-002** | Tạo bảng `messages` bằng migration SQL (kèm RLS "chỉ thành viên chuyến") | ✅ `DONE` — PO đã áp dụng migration, runtime verify PASS (2026-09-21) |
| **TASK-003** | Thu thập dump schema/enum/RLS live còn thiếu + thiết lập baseline contract trong repo (D-03-11) | ✅ `DONE` — Baseline contract tại `docs/database/live-schema-baseline.md` |
| **TASK-004** | **Trips boundary DTO mapping** — đồng bộ toàn bộ write/read path `trips` theo D-03-01; "Đăng chuyến" chạy end-to-end | ✅ `DONE` — Triển khai `tripMapper.ts` & cập nhật route Đăng chuyến (2026-09-22) |
| **TASK-005** | Tách platform role (`USER`/`ADMIN`) khỏi capability driver/passenger + Cưỡng chế xác minh thẻ KTX (D-03-05, D-03-07) | ✅ `DONE` — Triển khai `TASK-005.md` & kiểm tra phân quyền (2026-09-26) |
| TASK-006 *(đề xuất)* | Chuẩn hoá enum tại boundary theo live values + casing (D-03-06) | `DONE` (Tích hợp trong DTO Mappers) |
| TASK-007 *(đề xuất)* | Ratings canonical schema (D-03-03) + sửa `submitRatingAction` (chống trùng, cập nhật `profiles.rating`) | ✅ `DONE` (Sửa `chat/actions.ts` dùng cột `score` & tự tính average_rating) |
| TASK-008 *(đề xuất)* | Cưỡng chế verification cho core carpool actions theo D-03-07 | ✅ `DONE` (Tích hợp trong TASK-005) |
| TASK-00x *(đề xuất)* | Re-verify runtime TASK-001: TC-1…TC-11 + "Đăng chuyến" end-to-end (D-03-08) | `PROPOSED` — điều kiện hoàn thành epic |
| TASK-00x *(đề xuất)* | Gộp 2 bucket thẻ KTX về 1 bucket private + signed URL | `PROPOSED` |
| TASK-00x *(đề xuất)* | Bỏ đường tạo URL ảnh giả, xử lý lỗi upload đúng cách | `PROPOSED` |

---

## 7. Điều kiện hoàn thành EPIC

- [ ] `npx supabase db diff` (hoặc tương đương) cho kết quả rỗng giữa repo và DB thật
- [ ] `.ai/database-context.md` không còn nhãn `UNKNOWN` cho bảng/cột/enum đang dùng
- [ ] Không còn 2 luồng/bucket lưu thẻ KTX
- [ ] "Đăng chuyến" hoạt động end-to-end với schema thật (đã kiểm thử runtime)
- [ ] TC-1…TC-11 của TASK-001 chạy lại và PASS (bồi đắp runtime AC-01…AC-06 đã defer)

## 8. Reconciliation với dữ liệu 2026-09-21

- `trips` không còn là câu hỏi `date` vs `trip_date`: DB live có `trip_date`, không có `date`; code hiện là phía sai.
- `trips` live là schema normalized 27 cột, không phải mô hình phẳng mà các action hiện đang gửi.
- `locations` và `routes` đã tồn tại và có dữ liệu thật; schema chi tiết vẫn cần dump.
- `ratings` đã tồn tại nhưng chưa có dump cột; `messages` không tồn tại trên DB DEV.
- `trip_requests`, enum, RLS và nhiều bảng mở rộng vẫn cần bằng chứng trực tiếp; không nâng nhãn chỉ dựa trên docs.
- ~~TASK-002 tạo `messages` là một phương án `PROPOSED`~~ → **Cập nhật 2026-09-21/22**: TASK-002 `DONE` — migration đã được PO áp dụng, RLS runtime-verified (xem `EXECUTION-REPORT-TASK-002.md` §7).

### Cập nhật 2026-09-22

- PO trả lời trọn bộ D-03-01…D-03-11 — chi tiết và hệ quả orchestration: `EPIC-03-PO-DECISION-PACK.md` §10.
- Hướng đồng bộ chốt **Boundary DTO Mapping** cho `trips`; live DB là source of truth cho schema/enum/RLS (D-03-02, 03, 04, 06, 11).
- **TASK-003 (`READY`)** là điều kiện READY của mọi task đồng bộ code: policy đã chốt không nâng nhãn `UNKNOWN` → `ACTUAL` — bằng chứng phải đến từ dump live.
