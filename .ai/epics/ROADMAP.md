# ROADMAP — KTX Carpooling

> Lộ trình theo **EPIC**, sắp theo thứ tự ưu tiên bắt buộc của `.ai/constitution.md` §8.
> Cập nhật lần cuối: **2026-09-20** (onboarding).

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
| **EPIC-01** | Security & Authorization Hardening | 1 | 🔴 Chặn | `PROPOSED` | — |
| **EPIC-02** | Auth & Onboarding Blockers | 2 | 🔴 Chặn | `PROPOSED` | — |
| **EPIC-03** | Data Integrity & Schema Source of Truth | 3 | 🔴 Chặn | `PROPOSED` | Cần PO cung cấp DB access |
| **EPIC-04** | Core Business Logic Correctness | 4 | 🟠 Cao | `PROPOSED` | EPIC-03 |
| **EPIC-05** | Critical Functional Gaps | 5 | 🟠 Cao | `PROPOSED` | EPIC-03 |
| **EPIC-06** | Architecture & Maintainability | 6 | 🟡 TB | `PROPOSED` | EPIC-01 |
| **EPIC-07** | Shared UI & Components | 7 | 🟡 TB | `PROPOSED` | — |
| **EPIC-08** | Secondary Features & Integrations | 8–10 | 🟢 Thấp | `PROPOSED` | EPIC-01, EPIC-03 |

---

## 3. Trình tự thực hiện đề xuất

### Giai đoạn 1 — Bịt lỗ hổng (EPIC-01 + EPIC-02)
**Lý do**: hai epic này chứa lỗi khiến hệ thống **không an toàn để cho sinh viên dùng thật**.
- Người ngoài tự duyệt được thẻ KTX cho chính mình (#3.2) → cơ chế xác minh vô hiệu.
- Người ngoài từ chối được yêu cầu chuyến của người khác (#3.3), đổi trạng thái chuyến (#3.4), gửi tin nhắn vào phòng chat riêng (#3.5).
- Link xác minh email 404 (#3.8) + hardcode localhost.

**Điều kiện ra**: mọi server action kiểm tra uỷ quyền đầy đủ; `/admin` được bảo vệ; không còn đường vào admin ẩn danh.

### Giai đoạn 2 — Chốt nguồn sự thật dữ liệu (EPIC-03)
**Lý do**: không thể sửa nghiệp vụ đúng nếu chưa biết schema thật.
- Tên cột `date` vs `trip_date`, `status` vs `account_status`, case enum → đều là `UNKNOWN`.
- `supabase/migrations/` rỗng ⇒ không tái lập được môi trường.

**Điều kiện ra**: có file DDL/migration trong repo; mọi `UNKNOWN` về cột/enum được chuyển thành `ACTUAL`.

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
| Q1 | Cấp quyền truy cập DB (schema dump / read-only) | EPIC-03, EPIC-04, EPIC-05 |
| Q2 | Tên cột ngày đi: `date` hay `trip_date`? | EPIC-03, EPIC-04 |
| Q3 | Cột trạng thái tài khoản: `status` hay `account_status`? | EPIC-03 |
| Q4 | Enum lưu HOA hay thường? | EPIC-03, EPIC-04 |
| Q5 | Bảng `ratings` / `messages` có tồn tại? | EPIC-05 |
| Q6 | Cơ chế tạo ADMIN? | EPIC-01, EPIC-02 |
| Q7 | Có cưỡng chế "chỉ sinh viên đã xác minh mới đăng chuyến/gửi yêu cầu"? | EPIC-04 |
| Q8 | Tính năng báo cáo vi phạm có nằm trong phạm vi phát hành không? | EPIC-08 |
| Q9 | Ưu tiên nghiệp vụ: sửa an toàn trước hay bù tính năng trước? | Toàn bộ |

---

## 5. Chỉ số theo dõi tiến độ

| Chỉ số | Hiện tại | Mục tiêu |
|---|---|---|
| Số lỗ hổng uỷ quyền đã biết | 5 (#3.2–#3.6) | 0 |
| Route admin không được bảo vệ | 2 (`/admin`, `/admin/verifications`) | 0 |
| Sự kiện DB `UNKNOWN` | 13 (U01–U13) | 0 |
| File migration trong repo | 0 | ≥ 1 (DDL đầy đủ) |
| File test | 0 | > 0 |
| Endpoint không xác thực | 2 (`api/ai/*`) | 0 |
| Luồng upload thẻ KTX | 2 (trùng) | 1 |
