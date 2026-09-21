# TASK-002 — Tạo bảng `messages` bằng migration SQL (kèm RLS "chỉ thành viên chuyến")

- **TRẠNG THÁI:** 🟡 `PROPOSED` — đã được PO duyệt chủ trương tạo task (2026-09-21, "duyệt toàn bộ"); **chờ PO review nội dung** trước khi chuyển `READY` và giao Antigravity
- **EPIC:** EPIC-03 — Data Integrity & Code ↔ DB Alignment *(chuyển từ EPIC-01 theo quyết định A1 của PO ngày 2026-09-21 — migration `messages` giờ là một phần của việc đồng bộ code ↔ DB)*
- **Mức ưu tiên:** 1 trong EPIC-03 — làm hỏng toàn bộ tính năng chat; cần cho TC-6/TC-7 khi EPIC-03 re-verify runtime TASK-001
- **Mức rủi ro:** 🟡 Trung bình — schema + RLS (HIGH RISK theo escalation-protocol H01/H04), nhưng PO đã duyệt trước và PO tự áp dụng bằng tay
- **Người tạo:** Qoder (Orchestrator) — ngày 2026-09-21
- **Người thực thi:** Antigravity (Execution Agent)
- **Người verify:** Qoder (theo `verification-protocol.md`)

---

## 1. TASK ID

`TASK-002`

## 2. TITLE

Tạo migration SQL cho bảng `messages` (chat chuyến đi) kèm RLS chỉ cho phép thành viên chuyến đọc/ghi.

## 3. OBJECTIVE

Bảng `messages` hiện **không tồn tại** trong DB (PO xác nhận 2026-09-21 qua Supabase Dashboard), khiến:

1. Toàn bộ tính năng chat (`sendMessageAction`, hiển thị lịch sử tin nhắn) **hỏng hoàn toàn** —
   mọi lệnh insert đều lỗi runtime.
2. AC-04 của TASK-001 (positive test: tài xế & hành khách đã được chấp nhận gửi tin nhắn thành công)
   **không thể verify**.

Task này tạo **file migration SQL** (Antigravity chỉ viết file — **không áp dụng lên DB**), PO áp dụng
thủ công qua Supabase Dashboard SQL Editor.

## 4. BACKGROUND

- `src/app/(main)/trips/[id]/chat/actions.ts:33` — `sendMessageAction` insert
  `{ trip_id, sender_id, content }` vào `messages`; bảng không có ⇒ `error.message` trả về client.
- `src/app/(main)/trips/[id]/chat/actions.ts:68` — `updateTripStatusAction` insert thông báo
  (announcement) không kiểm tra lỗi ⇒ nuốt error, trả success giả.
- `src/app/(main)/trips/[id]/chat/page.tsx:60-64` — đọc `messages` theo `trip_id`, sort `created_at`
  tăng dần.
- `src/types/database.ts:83-89` — interface `Message` đã tồn tại: `id, trip_id, sender_id, content,
  created_at`.
- `supabase/migrations/` — **trống** (D7); schema thật đã từng được áp dụng trực tiếp qua SQL Editor
  (xem `supabase/schema.sql:2`).

**Bằng chứng DB (PO xác nhận 2026-09-21):** `messages` không tồn tại; `ratings`, `routes`,
`locations` tồn tại; `trips`, `trip_requests` tồn tại (được dùng bởi app).

## 5. SOURCE OF TRUTH

| Nguồn | Vai trò |
|-------|---------|
| Code sử dụng bảng (§4) | Chỉ định cột/hành vi bắt buộc của schema |
| `supabase/schema.sql` | Quy ước đặt tên cột, FK hiện có của project |
| `EPIC-01-security-authorization.md` | Bối cảnh bảo mật — RLS là lớp phòng thủ duy nhất ở tầng DB với anon key |
| Quyết định PO 2026-09-21 ("duyệt toàn bộ") | Phê duyệt tạo task kèm migration; RLS "chỉ thành viên chuyến" |

## 6. CURRENT STATE

- Bảng `messages`: **KHÔNG TỒN TẠI** (ACTUAL — PO xác nhận).
- `supabase/migrations/`: trống.
- Code app: đã viết hoàn chỉnh cho bảng này (insert/select) — **không cần sửa**.
- Migration trước đây đặt tên dạng `20260916_align_ktx_schema.sql` (tham chiếu trong `schema.sql:2`).

## 7. EXPECTED STATE

1. Có file `supabase/migrations/<YYYYMMDD>_create_messages.sql` chứa:
   - `create table public.messages` với các cột: `id` (uuid, PK, default `gen_random_uuid()`),
     `trip_id` (uuid, NOT NULL, FK → `trips(id)`, `on delete cascade`), `sender_id` (uuid, NOT NULL,
     FK → `profiles(id)`), `content` (text, NOT NULL, không cho chuỗi rỗng/toàn khoảng trắng),
     `created_at` (timestamptz, NOT NULL, default `now()`).
   - Index trên `(trip_id, created_at)` — phục vụ truy vấn sort theo thời gian.
   - `alter table public.messages enable row level security`.
   - RLS policies (xem §13 RQ-03/RQ-04): SELECT + INSERT chỉ cho **tài xế của chuyến** hoặc
     **hành khách có request `ACCEPTED`** trong chuyến đó; INSERT còn bắt buộc `sender_id = auth.uid()`.
   - **Không** có policy UPDATE/DELETE (tin nhắn bất biến).
2. `supabase/schema.sql` được cập nhật phần chú thích (thêm mục `messages` theo đúng phong cách hiện có).
3. Không file nào khác thay đổi.

## 8. SCOPE

**Trong phạm vi (được phép tạo/sửa):**

| File | Thay đổi |
|------|----------|
| `supabase/migrations/<YYYYMMDD>_create_messages.sql` | **File mới** — toàn bộ DDL + RLS |
| `supabase/schema.sql` | Thêm khối chú thích mô tả bảng `messages` |

**Ngoài phạm vi (KHÔNG chạm):**

- Mọi file `src/**` — code app đã đúng, không cần sửa.
- Các bảng khác, dữ liệu, seed.
- Auth config, `src/utils/supabase/*`.
- **Không áp dụng migration lên DB** — PO tự chạy qua Dashboard SQL Editor.

## 9. FILES / MODULES

```
supabase/migrations/20260921_create_messages.sql   (mới)
supabase/schema.sql                               (sửa: thêm chú thích)
```

**Được phép đọc (không sửa):** `src/app/(main)/trips/[id]/chat/actions.ts`,
`src/app/(main)/trips/[id]/chat/page.tsx`, `src/types/database.ts`.

## 10. DO NOT TOUCH

- ❌ Không chạy migration trực tiếp (không có service role, không `supabase db push`).
- ❌ Không sửa bất kỳ file nào trong `src/`.
- ❌ Không sửa các bảng/cột đang tồn tại; không đổi `date` / `trip_date` (D1 — tranh chấp đang mở,
  xử lý task khác).
- ❌ Không tạo policy UPDATE/DELETE cho `messages`.
- ❌ Không dùng `security definer` function hay grant cho `anon`/`service_role` ngoài mặc định.
- ❌ `package.json`, dependencies, `.env*`.

## 11. DEPENDENCIES

| Phụ thuộc | Trạng thái | Ảnh hưởng |
|-----------|-----------|-----------|
| Bảng `trips(id)`, `profiles(id)` tồn tại | ✅ ACTUAL (app đang dùng) | FK hợp lệ |
| Cột `trip_requests.status` nhận giá trị `ACCEPTED` | ⚠️ Có thể chữ hoa/thường tùy enum (code normalize `.toUpperCase()` ở `trips/page.tsx:54`) | Xem C-03 — dùng so sánh không phân biệt hoa/thường |
| PO áp dụng migration | ⏳ Sau khi verify task | AC runtime chỉ có kết quả SAU khi PO chạy SQL |

## 12. CONSTRAINTS

| ID | Ràng buộc |
|----|-----------|
| C-01 | Chỉ tạo 2 file thay đổi nêu ở §9. |
| C-02 | Migration phải **idempotent an toàn khi bảng chưa có** và **phải fail rõ ràng** nếu bảng đã có (dùng `create table` thường, không `if not exists` che giấu xung đột). |
| C-03 | So sánh status phải không phân biệt hoa/thường: `upper(r.status::text) = 'ACCEPTED'` (cast `::text` để chạy được cả với enum lẫn varchar). |
| C-04 | Policy phải dùng `auth.uid()`, scope `to authenticated`; không grant công khai. |
| C-05 | INSERT policy phải có **cả** hai điều kiện: `sender_id = auth.uid()` và thành viên chuyến. |
| C-06 | File phải chạy được nguyên vẹn trong SQL Editor (một khối, có comment từng phần). |
| C-07 | Nếu phát hiện vấn đề ngoài phạm vi: **ghi nhận, KHÔNG tự sửa**, báo orchestrator. |

## 13. REQUIREMENTS

| ID | Yêu cầu |
|----|---------|
| RQ-01 | DDL khớp chính xác cách code gọi: insert `{trip_id, sender_id, content}`; select `*` theo `trip_id`, order `created_at asc`. Không cột bắt buộc nào khác (không `updated_at`, không `read_at`). |
| RQ-02 | FK + `on delete cascade` với `trips`; FK `profiles(id)` cho `sender_id`. |
| RQ-03 | RLS SELECT: `exists (trips t where t.id = messages.trip_id and t.driver_id = auth.uid())` HOẶC `exists (trip_requests r where r.trip_id = messages.trip_id and r.passenger_id = auth.uid() and upper(r.status::text) = 'ACCEPTED')`. |
| RQ-04 | RLS INSERT: như RQ-03 **và** `sender_id = auth.uid()` (trong `with check`). |
| RQ-05 | Không có policy nào cho UPDATE/DELETE. |
| RQ-06 | Index `(trip_id, created_at)`. |
| RQ-07 | `schema.sql` cập nhật mục chú thích `messages` (cột + quan hệ + policy tóm tắt). |

## 14. ACCEPTANCE CRITERIA

| ID | Tiêu chí | Cách kiểm chứng |
|----|----------|-----------------|
| AC-01 | File migration tồn tại đúng vị trí, tên có ngày tạo | `git status` / đọc file |
| AC-02 | DDL đầy đủ cột + FK + index + RLS đúng §13 | Static review (Qoder) |
| AC-03 | `git diff --stat` chỉ 2 file §9 | `git diff` |
| AC-04 | SQL chạy không lỗi trong Supabase SQL Editor | **PO thực hiện** — dán kết quả/báo lỗi về |
| AC-05 | Sau khi áp dụng: tài xế B và hành khách được chấp nhận P gửi tin nhắn thành công (TC-6/TC-7 TASK-001) | Runtime test sau áp dụng |
| AC-06 | Sau khi áp dụng: user không liên quan C không SELECT/INSERT được (RLS chặn tầng DB) | Runtime negative test |
| AC-07 | `npx tsc --noEmit` không đổi (không file TS nào được sửa) | Chạy xác nhận |

## 15. VERIFICATION

1. **Static:** review file SQL đối chiếu RQ-01…RQ-07 (Qoder).
2. **Scope:** `git diff --stat` chỉ 2 file.
3. **Runtime (SAU khi PO áp dụng):** chạy TC-6/TC-7 (chat success 2 vai trò) + negative test RLS
   (user C) theo `verification-protocol.md`.
4. Kết luận PASS/FAIL/PARTIAL — AC-04/AC-05/AC-06 chỉ đánh sau khi PO áp dụng migration.

## 16. EXPECTED OUTPUT

1. File migration SQL hoàn chỉnh.
2. `schema.sql` cập nhật.
3. Báo cáo thực thi theo template `execution-protocol.md`.
4. Một commit duy nhất (1 task = 1 commit).

## 17. RISK

| ID | Rủi ro | Mức | Giảm thiểu |
|----|--------|-----|-----------|
| RK-01 | Cột `status` là enum tự tạo ⇒ so sánh chuỗi fail | 🟡 TB | C-03: cast `::text` |
| RK-02 | FK `profiles(id)` nhưng user thật thuộc `auth.users` | 🟢 Thấp | `profiles.id = auth.users.id` (schema.sql:5) |
| RK-03 | Policy quá chặn ⇒ tài xế/hành khách hợp lệ không chat được | 🔴 Cao | RQ-03 sao chép đúng logic đã có ở `chat/actions.ts:16-31` (đã được TASK-001 fix + verify) |
| RK-04 | PO áp dụng SQL có lỗi cú pháp | 🟡 TB | AC-04 bắt buộc PO chạy thử; file một khối, comment rõ |
| RK-05 | Migration xung đột nếu bảng đã được tạo tay giữa chừng | 🟡 TB | C-02: fail rõ ràng thay vì im lặng bỏ qua |

## 18. ESCALATION

**DỪNG thực thi và escalate PO** nếu:

- Phát hiện bảng `messages` **đã tồn tại** trong DB tại thời điểm thực thi (thông báo từ PO).
- Cần đổi schema bảng khác / thêm cột ngoài spec để policy hoạt động.
- Có từ 2 cách hiểu "thành viên chuyến" khác nhau về mặt bảo mật (ví dụ: tính cả hành khách
  `REQUESTED`? — hiện spec: **không**, chỉ `ACCEPTED`).

---

## Ghi chú

> **Task này KHÔNG thay đổi DB trực tiếp.** Antigravity chỉ viết file. PO áp dụng bằng tay qua
> Supabase Dashboard → SQL Editor (môi trường DEV đã PO xác nhận 2026-09-21).
>
> Sau khi PO áp dụng thành công, AC-04…AC-06 của TASK-002 được đánh giá trong chuỗi re-verify
> runtime của EPIC-03 (kèm TC-6/TC-7 và negative RLS test cho các runtime AC của TASK-001).
