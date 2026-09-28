# TASK-003 — Thu thập bằng chứng schema/enum/RLS live còn thiếu & thiết lập baseline contract trong repo

- **TRẠNG THÁI:** ✅ `DONE` — PO đã cung cấp đầy đủ 100% bằng chứng SQL dump; Baseline Contract đã được khởi tạo tại `docs/database/live-schema-baseline.md` (2026-09-22)
- **EPIC:** EPIC-03 — Data Integrity & Code ↔ DB Alignment

- **Mức ưu tiên:** 1 trong EPIC-03 — điều kiện READY cho mọi task đồng bộ code (TASK-004+)
- **Mức rủi ro:** 🟢 Thấp — chỉ đọc metadata (SELECT), không đổi DB, không đổi `src/`
- **Người tạo:** Orchestrator — 2026-09-22 (theo 11 quyết định PO D-03-01…D-03-11, xem `EPIC-03-PO-DECISION-PACK.md` §10)
- **Người thực thi:** PO (chạy query cung cấp evidence) + Orchestrator (biên soạn contract, cập nhật nhãn)
- **Người verify:** Verification Agent / PO

---

## 1. TASK ID

`TASK-003`

## 2. TITLE

Thu thập dump schema/enum/RLS live cho các bảng còn lại và thiết lập schema/RLS baseline contract trong repo.

## 3. OBJECTIVE

Sau khi PO chốt D-03-01…D-03-11, các quyết định D-03-02/03/04/06/11 đều quy về một yêu cầu: **live DB là canonical, nhưng repo chưa có bằng chứng đủ**. Hiện tại:

- `trips` đã `ACTUAL` (27 cột, CSV 2026-09-21 — `database-context.md` §16).
- Còn lại vẫn `UNKNOWN`: schema `trip_requests`, `ratings`, `profiles`, `locations`, `routes`, `vehicles`; enum members + casing; RLS enable state + policies; functions/routines trong `public`.

Task này thu evidence **một lần** bằng bộ query chuẩn, rồi biên soạn **baseline contract** trong repo để development và verification dùng chung (D-03-11), đồng thời nâng nhãn `UNKNOWN` → `ACTUAL` trong `database-context.md` cho những gì evidence phủ.

## 4. BACKGROUND

- Quy trình đã chứng minh hiệu quả: CSV `information_schema.columns` của `trips` (PO xuất 2026-09-21) giải quyết dứt điểm D1 và là nền của quyết định D-03-01.
- `supabase/schema.sql` chỉ là comment; `supabase/migrations/` có đúng 1 file (`20260921_create_messages.sql` — TASK-002). Chưa tái lập được môi trường từ repo.
- `docs/database/supabase-structure.md` là mô hình mục tiêu (`DOCUMENTED`), không được dùng để nâng nhãn `ACTUAL`.

## 5. SOURCE OF TRUTH

| Nguồn | Vai trò |
|-------|---------|
| Quyết định PO 2026-09-22 (D-03-01…11) | Policy — định hướng biên soạn contract |
| Kết quả query PO chạy trên Supabase DEV | Bằng chứng (`ACTUAL`) |
| `.ai/database-context.md` | Nơi lưu nhãn trạng thái |

## 6. CURRENT STATE

- `trips`: `ACTUAL` (27 cột). `messages`: `ACTUAL` (tạo qua TASK-002, DDL có trong repo).
- Các bảng còn lại, enum members, RLS, routines: `UNKNOWN`.

## 7. EXPECTED STATE

1. Có `docs/database/live-schema-baseline.md` — contract theo từng bảng: cột (kiểu, nullable, default), PK/FK/unique/check, enum members (tên enum + giá trị + thứ tự), RLS (enable state + từng policy: roles, cmd, qual, with_check), routines, buckets. Mỗi mục ghi nguồn (query nào, ngày xuất).
2. `.ai/database-context.md`: mọi bảng/cột/enum/RLS mà code gọi tới được gắn `ACTUAL` (hoặc ghi rõ evidence không phủ — giữ `UNKNOWN`).
3. Bảng chênh lệch live vs docs mục tiêu vs code hiện tại, đặt nổi bật trong baseline.

## 8. SCOPE

**Trong phạm vi (được phép tạo/sửa):**

| File | Thay đổi |
|------|----------|
| `docs/database/live-schema-baseline.md` | **File mới** — baseline contract từ evidence |
| `docs/database/evidence-20260922.md` | **File mới** — kết quả thô của bộ query (PO cung cấp, không biên tập) |
| `.ai/database-context.md` | Nâng nhãn theo evidence |
| `.ai/tasks/TASK-003.md` + EPIC-03/ROADMAP/project-state | Cập nhật trạng thái |

**Ngoài phạm vi (KHÔNG chạm):** mọi file `src/**`; DB (không DDL/DML); `supabase/migrations/` (không thêm migration); `supabase/schema.sql`.

## 9. BỘ QUERY CHUẨN (PO chạy trên Supabase DEV — SQL Editor)

```sql
-- 9.1 Cột mọi bảng public
select table_name, ordinal_position, column_name, data_type, udt_name,
       is_nullable, column_default
from information_schema.columns
where table_schema = 'public'
order by table_name, ordinal_position;

-- 9.2 Enum members
select t.typname as enum_name, e.enumsortorder, e.enumlabel
from pg_type t join pg_enum e on e.enumtypid = t.oid
order by t.typname, e.enumsortorder;

-- 9.3 Constraints (PK / FK / unique / check)
select conrelid::regclass as table_name, conname, contype,
       pg_get_constraintdef(oid) as definition
from pg_constraint
where connamespace = 'public'::regnamespace
order by conrelid::regclass::text, conname;

-- 9.4 RLS policies
select tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
order by tablename, policyname;

-- 9.5 RLS enable state
select relname, relrowsecurity, relforcerowsecurity
from pg_class
where relnamespace = 'public'::regnamespace and relkind = 'r'
order by relname;

-- 9.6 Functions/routines
select routine_name, routine_type, data_type
from information_schema.routines
where routine_schema = 'public'
order by routine_name;

-- 9.7 Danh sách bảng trong schema public
select table_name, table_type
from information_schema.tables
where table_schema = 'public'
order by table_name;
```

Tùy chọn (PO kiểm tra qua Dashboard): storage buckets (public/private), auth config (confirm email), `select distinct role from profiles` — phục vụ D-03-05.

## 10. DO NOT TOUCH

- ❌ Không chạy bất kỳ DDL/DML — PO chỉ chạy SELECT.
- ❌ Không sửa `src/**`, không thêm migration, không sửa `supabase/schema.sql`.
- ❌ Không nâng `UNKNOWN` → `ACTUAL` cho mục evidence không phủ (nguyên tắc §0 `database-context.md`).
- ❌ Không "chuẩn hoá" tên cột/enum theo code hoặc docs khi live khác (D-03-04/06: live canonical).

## 11. DEPENDENCIES

| Phụ thuộc | Trạng thái |
|-----------|-----------|
| PO truy cập Supabase DEV | ✅ ACTUAL |
| Quyết định D-03-01…D-03-11 | ✅ 2026-09-22 |
| TASK-002 áp dụng | ✅ DONE |

## 12. CONSTRAINTS

| ID | Ràng buộc |
|----|-----------|
| C-01 | Evidence phải là output thô của query — không gõ tay lại, không rút gọn điều kiện policy. |
| C-02 | Baseline contract: mỗi bảng một mục, có phần "so với code" và "so với docs". |
| C-03 | Nếu output quá lớn, chia theo query/bảng nhưng không lọc bớt cột. |

## 13. REQUIREMENTS

| ID | Yêu cầu |
|----|---------|
| RQ-01 | PO chạy đủ 7 query §9, cung cấp kết quả đầy đủ. |
| RQ-02 | Baseline phủ ít nhất: `profiles`, `trips` (đối chiếu CSV cũ), `trip_requests`, `messages` (đối chiếu migration TASK-002), `ratings`, `locations`, `routes`, `vehicles` (nếu tồn tại), `trip_reports`/`notifications` (nếu tồn tại). |
| RQ-03 | Enum members của mọi enum code đang dùng được liệt kê tường minh (values + casing). |
| RQ-04 | RLS per-table: enable state + từng policy đủ 5 trường (permissive, roles, cmd, qual, with_check). |
| RQ-05 | Mọi thay đổi nhãn trong `database-context.md` kèm trích evidence. |
| RQ-06 | Bảng chênh lệch live vs docs vs code đặt ở đầu file baseline. |

## 14. ACCEPTANCE CRITERIA

| ID | Tiêu chí | Cách kiểm chứng |
|----|----------|-----------------|
| AC-01 | `evidence-20260922.md` chứa output đủ 7 query | Đọc file |
| AC-02 | `live-schema-baseline.md` tồn tại, phủ các bảng RQ-02, mỗi mục có nguồn | Đọc file |
| AC-03 | `database-context.md`: các bảng/cột/enum code dùng đều `ACTUAL` hoặc ghi rõ evidence lỗ hỏng | Đọc file |
| AC-04 | `git diff --stat` không có file `src/**` | `git diff` |
| AC-05 | Không có thay đổi nào trên DB | PO xác nhận chỉ chạy SELECT |
| AC-06 | Baseline `messages` khớp 1-1 migration TASK-002 | Sanity check đối chiếu file SQL |

## 15. VERIFICATION

1. Đối chiếu baseline với evidence thô (spot-check ≥ 3 bảng).
2. Đối chiếu mục `messages` với `supabase/migrations/20260921_create_messages.sql`.
3. Kiểm tra `git diff --stat` phạm vi.
4. PO xác nhận baseline phản ánh đúng DB.

## 16. EXPECTED OUTPUT

1. 2 file mới trong `docs/database/`.
2. `database-context.md` cập nhật nhãn.
3. Báo cáo thực thi theo `execution-protocol.md`.
4. Cập nhật trạng thái EPIC-03 / ROADMAP / project-state.

## 17. RISK

| ID | Rủi ro | Mức | Giảm thiểu |
|----|--------|-----|-----------|
| RK-01 | Output query quá lớn, dán vào hội thoại bị cắt | 🟡 TB | Chia theo query/bảng; hoặc PO xuất file |
| RK-02 | `pg_policies.qual` dài khó đọc | 🟢 Thấp | Giữ nguyên text, không rút gọn |
| RK-03 | Evidence không phủ một số cột legacy | 🟢 Thấp | Ghi rõ còn `UNKNOWN`, không suy luận |

## 18. ESCALATION

**DỪNG và báo PO** nếu:
- PO không chạy được query (quyền, giới hạn SQL Editor) — đề xuất phương án thay thế (đọc qua Dashboard từng bảng).
- Phát hiện bảng/tiện năng lạ ngoài dự kiến — ghi nhận vào baseline, không tự diễn giải.

---

## Ghi chú

Sau TASK-003, TASK-004 (trips boundary DTO mapping — D-03-01) sẽ được lập trên nền baseline; các task role/capability (D-03-05), enum normalization (D-03-06), ratings (D-03-03), verification enforcement (D-03-07) tương tự.
