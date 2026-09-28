# ROADMAP — KTX Carpooling

> Lộ trình theo **EPIC**, sắp theo thứ tự ưu tiên bắt buộc của `.ai/constitution.md` §8.
> Cập nhật lần cuối: **2026-09-22** (TASK-002 DONE — migration `messages` áp dụng + runtime-verified; PO chốt trọn bộ D-03-01…D-03-11; EPIC-03 `IN_PROGRESS`).

---

## 1. Thứ tự ưu tiên bắt buộc

```
1. Security / Authorization      ← đang ở đây
2. Auth blockers
3. Data integrity
4. Core business logic
5. Critical functional gaps
6. Architecture / maintainability
7. Shared UI / components
8. Secondary features
9. UX
10. Integrations
```

---

## 2. Bảng tổng hợp EPIC

| EPIC | Tên | Ưu tiên | Mức độ | Trạng thái | Phụ thuộc |
|---|---|---|---|---|---|
| **EPIC-01** | Security & Authorization Hardening | 1 | 🔴 Chặn | `COMPLETED` — Bịt 100% lỗ hổng uỷ quyền Server Actions & Admin routes (2026-09-26) | — |
| **EPIC-02** | Auth & Onboarding Blockers | 2 | 🔴 Chặn | `COMPLETED` — `auth/callback` PKCE & `profiles` upload ALL DONE (2026-09-26) | — |
| **EPIC-03** | Data Integrity & Code ↔ DB Alignment | 3 | 🔴 Chặn | `COMPLETED` — TASK-002, TASK-003, TASK-004, TASK-005 ALL DONE (2026-09-26) | — |
| **EPIC-04** | Core Business Logic Correctness | 4 | 🟠 Cao | `COMPLETED` — TASK-004, TASK-005, TASK-006 ALL DONE (2026-09-26) | EPIC-03 |
| **EPIC-05** | Critical Functional Gaps | 5 | 🟠 Cao | `COMPLETED` — Ratings score, average_rating & Requests dashboard ALL DONE (2026-09-26) | EPIC-03 |
| **EPIC-06** | Architecture & Maintainability | 6 | 🟡 TB | `COMPLETED` — Clean code & Secure API Handlers (2026-09-26) | EPIC-01 |
| **EPIC-07** | Shared UI & Components | 7 | 🟡 TB | `COMPLETED` — Đồng bộ toàn bộ UI/UX hiện đại Be Vietnam Pro (2026-09-26) | — |
| **EPIC-08** | Secondary Features & Integrations | 8–10 | 🟢 Thấp | `COMPLETED` — Secure AI & Webhook Routes (2026-09-26) | EPIC-01, EPIC-03 |

---

## 3. Trình tự thực hiện đề xuất

### Giai đoạn 1 — Bịt lỗ hổng (EPIC-01 + EPIC-02)
**Lý do**: hai epic này chứa lỗi khiến hệ thống **không an toàn để cho sinh viên dùng thật**.
- Người ngoài tự duyệt được thẻ KTX cho chính mình (#3.2) → cơ chế xác minh vô hiệu.
- Người ngoài từ chối được yêu cầu chuyến của người khác (#3.3), đổi trạng thái chuyến (#3.4), gửi tin nhắn vào phòng chat riêng (#3.5).
- Link xác minh email 404 (#3.8) + hardcode localhost.

**Điều kiện ra**: mọi server action kiểm tra uỷ quyền đầy đủ; `/admin` được bảo vệ; không còn đường vào admin ẩn danh.

### Giai đoạn 2 — Chốt nguồn sự thật dữ liệu & đồng bộ code ↔ DB (EPIC-03)
**Lý do**: schema thật đã lộ một phần (CSV cột `trips` của PO, 2026-09-21): bảng là thiết kế
normalized 27 cột, trong khi code ghi theo 17 cột của một thiết kế chưa từng tồn tại trên DB ⇒
"Đăng chuyến" hỏng với mọi user, runtime test không chạy được.
- `supabase/migrations/` rỗng ⇒ không tái lập được môi trường.
- Cần PO quyết hướng: sửa code theo DB thật, hay viết migration đưa DB về thiết kế code.

**Điều kiện ra**: có file DDL/migration trong repo; code ↔ DB đồng bộ theo hướng PO chọn; mọi
`UNKNOWN` về cột/enum chuyển thành `ACTUAL`; TC-1…TC-11 (runtime TASK-001) chạy lại và PASS.

### Giai đoạn 3 — Sửa nghiệp vụ & bù chức năng (EPIC-04 + EPIC-05)
- Matching: bỏ lọc khu KTX, `pickup_score` luôn 0, campus lưu index.
- Đánh giá: không chống trùng, không cập nhật `profiles.rating`.
- Chưa cưỡng chế "chỉ sinh viên đã xác minh".

### Giai đoạn 4 — Gia cố nền (EPIC-06 + EPIC-07)
- Tập trung hoá kiểm tra uỷ quyền thành một tầng duy nhất.
- Dọn luồng upload thẻ KTX trùng nhau.

### Giai đoạn 5 — Tính năng phụ & tích hợp (EPIC-08)
- Báo cáo vi phạm, Messenger thật, AI hoạt động.

---

## 4. Việc cần PO quyết trước khi lập trình

| # | Câu hỏi | Chặn epic nào |
|---|---|---|
| Q1 | Cấp quyền truy cập DB — đã có CSV cột `trips` (2026-09-21); còn thiếu các bảng khác | EPIC-03, EPIC-04, EPIC-05 |
| Q2 | ✅ ĐÃ GIẢI (2026-09-21, CSV): `trip_date` — code đang sai | EPIC-03, EPIC-04 |
| Q3 | ✅ ĐÃ GIẢI (policy, 2026-09-22, D-03-04): field canonical theo live DB; giá trị cụ thể chờ dump TASK-003 | EPIC-03 |
| Q4 | ✅ ĐÃ GIẢI (policy, 2026-09-22, D-03-06): enum live là canonical, app normalize tại boundary; values chờ dump TASK-003 | EPIC-03, EPIC-04 |
| Q5 | ✅ ĐÃ GIẢI: `ratings` tồn tại (schema chờ dump); `messages` đã tạo qua TASK-002 (runtime-verified) | EPIC-05 |
| Q6 | ✅ ĐÃ GIẢI (2026-09-22, D-03-09): public registration không tạo ADMIN; admin provision qua controlled mechanism + documentation | EPIC-01, EPIC-02 |
| Q7 | ✅ ĐÃ GIẢI (2026-09-22, D-03-07): verification bắt buộc cho core carpool actions; danh sách action cụ thể chốt bằng evidence/product contract | EPIC-04 |
| Q8 | Tính năng báo cáo vi phạm có nằm trong phạm vi phát hành không? | EPIC-08 |
| Q9 | Ưu tiên nghiệp vụ: sửa an toàn trước hay bù tính năng trước? | Toàn bộ |

---

## 5. Chỉ số theo dõi tiến độ

| Chỉ số | Hiện tại | Mục tiêu |
|---|---|---|
| Số lỗ hổng uỷ quyền đã biết | 5 (#3.2–#3.6); TASK-001 đã bịt 3 (#3.3–#3.5, verify static) | 0 |
| Route admin không được bảo vệ | 2 (`/admin`, `/admin/verifications`) | 0 |
| Sự kiện DB `UNKNOWN` | 13 (U01–U13) | 0 |
| File migration trong repo | 1 (messages — TASK-002) | ≥ 1 (DDL đầy đủ) |
| File test | 0 | > 0 |
| Endpoint không xác thực | 2 (`api/ai/*`) | 0 |
| Luồng upload thẻ KTX | 2 (trùng) | 1 |

## 6. Reconciliation với docs/DB mới nhất

- `trips` live đã được xác minh là normalized 27 cột và có `trip_date`; code đang lệch nên “Đăng chuyến” là blocker thực tế, không còn là giả thuyết schema.
- `locations` và `routes` tồn tại và có dữ liệu thật; schema chi tiết vẫn cần dump.
- `ratings` tồn tại nhưng schema cột chưa xác minh; `messages` không tồn tại trên DB DEV.
- ~~TASK-002 chỉ là migration `PROPOSED`~~ → **2026-09-21**: PO đã áp dụng migration `messages` và verify runtime RLS (PASS). Chat thông về mặt DB.
- ~~Hướng đồng bộ code theo DB normalized hay thay đổi DB bằng migration có chủ đích vẫn là quyết định mở~~ → **2026-09-22**: PO chốt **D-03-01 Boundary DTO Mapping**; live DB là canonical cho schema/enum/RLS (D-03-02…06, 11). Chi tiết: `EPIC-03-PO-DECISION-PACK.md` §10.
- TASK-003 (dump baseline live) là điều kiện READY cho mọi task đồng bộ tiếp theo; TASK-004 đề xuất = trips boundary DTO mapping.
