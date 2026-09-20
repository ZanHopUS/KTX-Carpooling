# EPIC-03 — Data Integrity & Schema Source of Truth

| Trường | Giá trị |
|---|---|
| **EPIC ID** | EPIC-03 |
| **Tên** | Data Integrity & Schema Source of Truth |
| **Ưu tiên** | 3 (Data integrity) |
| **Mức độ** | 🔴 Chặn — mọi epic sau đều phụ thuộc |
| **Trạng thái** | `PROPOSED` |
| **Phụ thuộc** | **Cần PO cấp quyền truy cập DB (Q1)** — không thể bắt đầu nếu thiếu |

---

## 1. Goal

Chuyển toàn bộ hiểu biết về database từ trạng thái `UNKNOWN` sang `ACTUAL`, và đưa **file DDL thật** vào repo để schema có nguồn sự thật duy nhất, tái lập được.

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
| 7 | Bảng `ratings` — code dùng, tài liệu không nhắc | `chat/actions.ts:63` |
| 8 | Bảng `messages` — code dùng, chưa xác minh tồn tại | `chat/page.tsx:61` |
| 9 | Ảnh thẻ KTX lưu ở bucket **public** `dorm-cards` | `(main)/profile/actions.ts` |
| 10 | Upload lỗi ⇒ **tạo URL giả** rồi vẫn chuyển `PENDING` | `(main)/profile/actions.ts` |
| 11 | Trạng thái `NEED_REVIEW` có trong schema, không có trong code | `schema.sql:12` |
| 12 | RPC `accept_trip_request()` + `is_admin()` + `is_verified_user()` có trong schema nhưng code không dùng | `schema.sql:28-29` |

**Tổng: 13 sự kiện `UNKNOWN` (U01–U13)** — xem `.ai/database-context.md` §4.

---

## 3. Target state

- [ ] Có file DDL/migration trong repo, chạy được trên môi trường trống.
- [ ] `.ai/database-context.md`: **0 mục `UNKNOWN`**; mọi bảng/cột/enum được gắn `ACTUAL`.
- [ ] Tên cột trong code khớp 100% với DB thật.
- [ ] Giá trị enum thống nhất một quy ước (HOA hoặc thường) trên toàn hệ thống.
- [ ] Chỉ còn **một** bucket lưu thẻ KTX, quyền **private**.
- [ ] Không còn đường nào tạo URL ảnh giả.
- [ ] RLS được review và ghi lại thành văn bản dưới dạng `ACTUAL`.

---

## 4. Dependencies

| Loại | Nội dung |
|---|---|
| Cần PO | **Q1** — schema dump hoặc kết nối read-only (**bắt buộc**) |
| Cần PO | **Q2** `date`/`trip_date`, **Q3** `status`/`account_status`, **Q4** case enum |
| Cần PO | **Q5** bảng `ratings`/`messages` có tồn tại? **Q7** cưỡng chế xác minh? |
| Cần PO | **Q10** có áp dụng `NEED_REVIEW`? |
| Kỹ thuật | Xác nhận RLS thật trước khi tin vào tài liệu |

---

## 5. Risk

| Rủi ro | Mức | Giảm thiểu |
|---|---|---|
| Đổi tên cột trong code theo tài liệu, nhưng DB thật lại theo code ⇒ **hỏng toàn bộ** | 🔴 Chặn | **Không sửa gì trước khi có schema thật** |
| Đổi case enum ⇒ dữ liệu cũ không còn khớp | 🔴 Chặn | Cần migration chuyển đổi + kiểm tra dữ liệu hiện có |
| Chuyển bucket sang private ⇒ ảnh cũ mất truy cập | 🟠 Cao | Cần signed URL cho ảnh cũ |
| Đưa DDL vào repo mà lệch DB thật ⇒ gây hiểu nhầm | 🟠 Cao | DDL phải sinh từ DB thật, không viết tay |
| RLS yếu ⇒ mọi thứ khác vô nghĩa | 🔴 Chặn | Review RLS là phần bắt buộc của epic này |

---

## 6. Tasks

| Task | Tên | Trạng thái |
|---|---|---|
| TASK-00x *(đề xuất)* | Trích xuất schema thật từ Supabase thành `supabase/migrations/0000_baseline.sql` | `PROPOSED` — chờ Q1 |
| TASK-00x *(đề xuất)* | Chốt & chuẩn hoá tên cột (`date`/`trip_date`, `status`/`account_status`) | `PROPOSED` — chờ Q2, Q3 |
| TASK-00x *(đề xuất)* | Chuẩn hoá case enum toàn hệ thống + migration dữ liệu | `PROPOSED` — chờ Q4 |
| TASK-00x *(đề xuất)* | Gộp 2 bucket thẻ KTX về 1 bucket private + signed URL | `PROPOSED` |
| TASK-00x *(đề xuất)* | Bỏ đường tạo URL ảnh giả, xử lý lỗi upload đúng cách | `PROPOSED` |
| TASK-00x *(đề xuất)* | Review & tài liệu hoá RLS thật | `PROPOSED` — chờ Q1 |

---

## 7. Điều kiện hoàn thành EPIC

- [ ] `npx supabase db diff` (hoặc tương đương) cho kết quả rỗng giữa repo và DB thật
- [ ] `.ai/database-context.md` không còn nhãn `UNKNOWN` cho bảng/cột/enum đang dùng
- [ ] Không còn 2 luồng/bucket lưu thẻ KTX
