# EPIC-03 — Data Integrity & Code ↔ DB Alignment

| Trường | Giá trị |
|---|---|
| **EPIC ID** | EPIC-03 |
| **Tên** | Data Integrity & Code ↔ DB Alignment |
| **Ưu tiên** | 3 (Data integrity + đồng bộ code ↔ DB) |
| **Mức độ** | 🔴 Chặn — mọi epic sau đều phụ thuộc; hiện đang chặn cả "Đăng chuyến" thật |
| **Trạng thái** | `READY` — PO duyệt mở 2026-09-21 (quyết định A1 khi chốt TASK-001) |
| **Phụ thuộc** | Q1 giải quyết một phần (PO cung cấp CSV cột `trips` 2026-09-21); còn cần thông tin các bảng khác + quyết định hướng đồng bộ (task đầu tiên của epic) |

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
| ✅ Giải một phần | Q1 — đã có CSV cột `trips` (2026-09-21); còn cần thông tin các bảng còn lại (`trip_requests`, `profiles`, `vehicles`, `routes`, `locations`, `ratings`) |
| ✅ ĐÃ GIẢI | Q2 — `trip_date` (CSV 2026-09-21; code đang sai) |
| Cần PO | Q3 `status`/`account_status`, Q4 case enum (giá trị enum `trips.status` vẫn UNKNOWN — D3) |
| ✅ Giải một phần | Q5 — `ratings` tồn tại, `messages` KHÔNG tồn tại (→ TASK-002); Q7 cưỡng chế xác minh còn mở |
| Cần PO | **Q10** có áp dụng `NEED_REVIEW`? |
| Cần PO (mới) | **Hướng đồng bộ** — sửa code theo DB thật (27 cột normalized) hay viết migration đưa DB về thiết kế code? Quyết định kiến trúc, là task đầu tiên của epic |
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
| **TASK-002** | Tạo bảng `messages` bằng migration SQL (kèm RLS "chỉ thành viên chuyến") | 🟡 `PROPOSED` — file đã soạn, chờ PO review nội dung (chuyển từ EPIC-01 theo A1) |
| TASK-00x *(đề xuất — đầu tiên)* | **PO quyết định hướng đồng bộ**: sửa code theo DB thật (27 cột normalized) hay migration đưa DB về thiết kế code | `PROPOSED` — chặn mọi task đồng bộ sau |
| TASK-00x *(đề xuất)* | Trích xuất schema thật từ Supabase thành `supabase/migrations/0000_baseline.sql` | `PROPOSED` — chờ phần còn lại của Q1 |
| TASK-00x *(đề xuất)* | Thực thi đồng bộ theo hướng PO chọn (đổi code hoặc viết migration) — sửa "Đăng chuyến" và toàn bộ tầng ghi/đọc `trips` | `PROPOSED` — chờ quyết định hướng |
| TASK-00x *(đề xuất)* | Chốt & chuẩn hoá tên cột `status`/`account_status` | `PROPOSED` — chờ Q3 |
| TASK-00x *(đề xuất)* | Chuẩn hoá case enum toàn hệ thống + migration dữ liệu | `PROPOSED` — chờ Q4 (D3) |
| TASK-00x *(đề xuất)* | Re-verify runtime TASK-001: TC-1…TC-11 + xác nhận "Đăng chuyến" hoạt động end-to-end | `PROPOSED` — điều kiện hoàn thành epic |
| TASK-00x *(đề xuất)* | Gộp 2 bucket thẻ KTX về 1 bucket private + signed URL | `PROPOSED` |
| TASK-00x *(đề xuất)* | Bỏ đường tạo URL ảnh giả, xử lý lỗi upload đúng cách | `PROPOSED` |
| TASK-00x *(đề xuất)* | Review & tài liệu hoá RLS thật | `PROPOSED` — chờ Q1 |

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
- TASK-002 tạo `messages` là một phương án `PROPOSED`, không được xem là đã áp dụng và không thể thay thế quyết định baseline `trips`.
