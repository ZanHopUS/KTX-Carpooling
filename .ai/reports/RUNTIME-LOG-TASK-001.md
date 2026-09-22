# RUNTIME LOG — TASK-001 (Lần chạy fixture được PO duyệt, 2026-09-21)

- **Người thực hiện:** Qoder (Orchestrator)
- **Sự kiện:** PO duyệt "duyệt toàn bộ" — chạy Option A (sửa đổi): tạo 3 user test + 2 trips +
  requests, chạy TC-1…TC-11 để verify AC runtime của TASK-001
- **Môi trường:** dev server `npm run dev` (Next.js 16, Turbopack) — `http://localhost:3000`
- **Kết quả tổng:** 🟠 **DỪNG TẠI BƯỚC TẠO FIXTURE TRIP** — chặn bởi lỗi schema DB thật
  (không phải lỗi code TASK-001). Chi tiết dưới đây.

---

## 1. Những gì đã thực hiện được

| Bước | Kết quả | Bằng chứng |
|------|---------|------------|
| Khởi động dev server | ✅ OK — `/login` trả 200 | curl 200 |
| Đọc UI các trang liên quan (`/register`, `/trips/create`, `/trips`, `/trips/[id]`, `/requests`, `/trips/[id]/chat`) để chuẩn bị automation | ✅ OK | — |
| Soạn TASK-002 (migration bảng `messages`) | ✅ Xong — `.ai/tasks/TASK-002.md` | — |
| Đăng ký **user test B** (tài xế T1) qua UI thật: `devtest.b@devtest.edu.vn` | ✅ **THÀNH CÔNG** | Log server: `SUPABASE SIGNUP RESULT { user: '4617a9f6-…', identities: 1, authError: null }`; redirect `/dashboard`; layout hiển thị đúng tên "B Test Driver" (profile đã ghi + đọc được) |
| Tạo **trip T1** qua UI thật (`/trips/create` → `createTripAction`) | ❌ **THẤT BẠI — lỗi DB** | Xem §2 |

## 2. Phát hiện chặn: bảng `trips` thiếu cột `available_seats`

Submit form đăng chuyến hợp lệ → alert UI và log dev server:

```
Create trip error: {
  code: 'PGRST204',
  details: null,
  hint: null,
  message: "Could not find the 'available_seats' column of 'trips' in the schema cache"
}
```

- Lỗi từ **PostgREST/Supabase thật** (không phải code TASK-001 — `createTripAction` nằm ngoài
  phạm vi TASK-001 và không từng được sửa).
- `createTripAction` **luôn luôn** gửi `available_seats` trong payload insert
  (`src/app/(main)/trips/actions.ts:31`), giá trị mặc định 1 — không có đường nào qua UI/action
  để tạo trip mà bỏ qua cột này.
- Cùng lúc xác nhận đường **đọc** bảng trips hoạt động (trang `/trips` load 200, bảng đang
  **trống** — 0 bản ghi).

### Suy luận kèm theo — **ĐÃ BỊ BÁC BỎ (2026-09-21, xem §8)**

Payload insert có thứ tự khóa: `driver_id, date, pickup_time, …, available_seats, …`. PGRST204
báo `available_seats` (khóa thứ 11) mà không báo `date` (khóa thứ 2) ⇒ các khóa trước đó được
chấp nhận ⇒ **cột `date` nhiều khả năng tồn tại đúng như code** (giải một phần tranh chấp D1 —
lệch với tài liệu `schema.sql` đang ghi `trip_date`).

> **BÁC BỎ:** CSV cột thật PO cung cấp (§8) cho thấy bảng có `trip_date` và **KHÔNG** có `date`,
> cùng 13 cột khác cũng không tồn tại. PGRST204 báo cột thiếu theo thứ tự **alphabet** của khóa
> payload (`available_seats` là khóa thiếu đứng đầu theo alphabet), không theo thứ tự khai báo —
> suy luận từ thứ tự payload ở trên là sai.

## 3. Tác động đến kế hoạch đã duyệt

| Hạng mục | Tác động |
|----------|----------|
| Tạo trip T1 (B), T2 (C) | 🔴 **Bất khả thi qua app** |
| Tạo requests R1, R2 (P gửi) | 🔴 Bất khả thi (cần trip tồn tại) |
| TC-1…TC-11 (toàn bộ) | 🔴 Bị chặn — mọi TC đều cần ít nhất 1 trip thật |
| AC-01…AC-03, AC-05, AC-06 (runtime) | 🔴 KHÔNG KIỂM ĐƯỢC — giữ nguyên, **không** đánh PASS khống |
| Đăng ký user P, C | ⏸ Tạm hoãn — không có ý nghĩa nếu không tạo được trip (tránh để lại user rác) |
| User test B đã tạo | ⚠️ **Giữ lại** để dùng tiếp khi unblock (sẽ dọn trong bước cleanup cuối cùng như cam kết) |

**Nhận định thêm:** đây là lỗi **chặn tính năng thật** của sản phẩm, không chỉ chặn việc test —
**mọi người dùng** (kể cả user thật) hiện không thể đăng chuyến đi mới trên DB này.

## 4. Các phương án mở cho PO

| # | Phương án | Ưu | Nhược |
|---|-----------|----|-------|
| A (khuyến nghị) | **PO sửa schema bảng `trips` trong Dashboard** (SQL Editor) để khớp code/schema tài liệu: thêm các cột còn thiếu (bắt đầu từ `available_seats`). Trước khi sửa, đối chiếu danh sách cột thật của `trips` với danh sách 17 cột code đang dùng (xem §5) | Khôi phục đúng schema tài liệu; mở lại toàn bộ luồng; sau đó Qoder tiếp tục fixture run như đã duyệt — không cần quyết định mới | Cần PO thao tác DB; có thể thiếu **nhiều hơn một** cột (PGRST204 mỗi lần chỉ báo 1 cột) |
| B | PO **tự insert fixture trips + trip_requests thủ công** bằng SQL (không sửa schema) | Nhanh cho việc test | App vẫn hỏng với user thật; insert tay phải khớp schema thật (phải biết các cột thiếu); các action update (`status`, `available_seats` trong `acceptTripRequestAction`) sẽ tiếp tục lỗi cột thiếu |
| C | Giao Antigravity task mới: **sửa `createTripAction` theo schema thật** | Không cần sửa DB | Đảo ngược nguồn sự thật (code đang khớp schema tài liệu; DB mới là thứ lệch); cần PO cung cấp schema thật trước; không giải quyết cho các action khác cũng ghi `available_seats` |

**SQL gợi ý cho phương án A** (PO chạy sau khi đã đối chiếu — dùng `if not exists` an toàn):

> ⛔ **THU HỒI (2026-09-21, xem §8):** SQL này KHÔNG còn phù hợp — bảng thật lệch **toàn bộ
> thiết kế**, không phải chỉ thiếu 1 cột. Đừng chạy "add column" cho tới khi PO quyết định
> hướng đồng bộ (§8.3).

```sql
alter table public.trips
  add column if not exists available_seats int not null default 1;
```

Lưu ý: nếu sau khi thêm `available_seats` vẫn còn lỗi PGRST204 cột khác ⇒ lặp lại với cột đó
(lý do nên đối chiếu toàn bộ danh sách cột §5 trước).

## 5. Danh sách 17 cột `trips` mà code đang đọc/ghi (đối chiếu với bảng thật)

`id, driver_id, date, pickup_time, pickup_area, pickup_building, pickup_point,
destination_university, destination_campus, destination_building, distance_km,
suggested_price, available_seats, payment_method, notes, status, created_at`

(nguồn: `createTripAction` insert + `trips/[id]/page.tsx`, `chat/page.tsx`, `requests/page.tsx`,
`dashboard/page.tsx` select)

## 6. Cập nhật trạng thái tài liệu liên quan

- `.ai/database-context.md` — thêm mục 15 (phát hiện runtime, nhãn ACTUAL/SUY LUẬN MẠNH).
- `.ai/tasks/TASK-001.md` — cập nhật lý do BLOCKED: chặn mới là schema `trips` thiếu cột.
- `.ai/tasks/TASK-002.md` — đã soạn xong (PROPOSED) theo quyết định của PO.

## 7. Bước tiếp theo (chờ PO)

1. PO chọn phương án §4 (khuyến nghị A).
2. Nếu A: PO chạy SQL sửa schema (kèm đối chiếu §5) → báo lại → Qoder resume fixture run
   (đăng ký P, C → tạo T1, T2 → R1, R2 → chạy TC-1…TC-11).
3. Verification report TASK-001 chỉ hoàn tất khi có kết quả runtime thật.

---

## 8. CẬP NHẬT NGHIÊM TRỌNG (2026-09-21) — PO đã cung cấp cột thật của `trips`

PO chạy query `information_schema.columns` và gửi CSV (`Supabase Snippet Untitled query.csv`).
Kết quả: **phát hiện lớn hơn nhiều so với "thiếu 1 cột"**. Chi tiết đầy đủ: `database-context.md` §16.

### 8.1 Bảng thật là MỘT THIẾT KẾ KHÁC HOÀN TOÀN

- Bảng `trips` thật có **27 cột** theo thiết kế normalized: `vehicle_id`, `route_id`,
  `pickup_location_id` (FK về `vehicles`/`routes`/`locations`), `trip_date`, `departure_time`,
  `class_start_time`, `class_end_time`, `distance_meters_snapshot`, `duration_seconds_snapshot`,
  `price_snapshot`, `currency`, `note`, `status` (enum), `cancellation_reason` (enum),
  `accepted_passenger_id`, `accepted_request_id`, các cột lifecycle (`cancelled_*`, `expired_at`,
  `started_at`, `completed_at`, `created_at`, `updated_at`).
- Trong 17 cột code insert, chỉ **3 cột tồn tại**: `driver_id`, `status`, `created_at`.
- **Không có dòng code nào** trong `src/` dùng thiết kế thật (grep toàn bộ — chỉ `class_start_time?`
  optional trong type). OSRM `lib/pricing.ts` cũng trả `distance_km` theo thiết kế code.
- `schema.sql` doc mô tả **thiết kế thứ 3** (trạng thái sau migration `20260916_align_ktx_schema.sql`
  chưa từng chạy — file không tồn tại, `supabase/migrations/` trống). Doc chỉ đúng 1 điểm: `trip_date`.

### 8.2 Tác động

| Hạng mục | Tình trạng |
|---|---|
| Script "add column" phương án A (§4) | ⛔ **THU HỒI** — sẽ tạo bảng lai, có thể vẫn fail do NOT NULL của thiết kế thật, làm bẩn bảng liên quan dữ liệu thật (`routes`/`locations`) |
| Fixture run TASK-001 qua UI | 🔴 **KHÔNG THỂ tiếp tục** cho tới khi code ↔ DB được đồng bộ (quyết định kiến trúc của PO, ngoài phạm vi TASK-001) |
| Sản phẩm thật | 🔴 "Đăng chuyến" hỏng với **mọi** user (đã biết trước); giờ biết rõ nguyên nhân gốc: toàn bộ tầng ghi trip viết theo schema chưa từng tồn tại trên DB |
| User test B | ⚠️ Giữ lại (chưa dọn — chờ PO quyết định hướng; nếu PO chọn dừng hẳn runtime verification thì sẽ dọn trong bước cleanup) |

### 8.3 Các lựa chọn mở cho PO

| # | Phương án | Diễn giải |
|---|-----------|-----------|
| **A1 (khuyến nghị)** | **Ghi nhận TASK-001 = static verification PASS; runtime ACs giữ KHÔNG KIỂM ĐƯỢC** với lý do mới (code ↔ DB lệch toàn bộ thiết kế — bằng chứng CSV). Mở **EPIC riêng "Đồng bộ code ↔ DB thật"**: PO quyết định hướng (sửa code theo DB thật, hay viết migration đưa DB về thiết kế code đang dùng — kèm TASK-002 messages). Verify runtime authorization làm lại sau khi EPIC đó hoàn thành. | Trung thực với bằng chứng; không phóng đại nghiêm trọng cũng không che giấu; tách vấn đề kiến trúc khỏi task bảo mật |
| A2 | PO **tự insert fixture bằng SQL theo schema thật** để chạy MỘT PHẦN TC runtime ngay | Chỉ khả thi một phần: cần biết cột `trip_requests` + giá trị enum `trips.status` (D3); TC-10 (update status positive) có thể fail nếu enum chữ thường; chat vẫn defer (TASK-002); danh sách TC sẽ co lại |
| A3 | Chạy "add column" như §4 cũ | ⛔ Không khuyến nghị — bảng lai, rủi ro NOT NULL, bẩn schema thật |

**Lưu ý:** chọn A2 hay A1 đều cần thêm thông tin từ PO nếu muốn hoàn thiện hồ sơ DB: danh sách bảng
public, cột `trip_requests` (kèm `is_nullable`, `udt_name`), giá trị enum `trips.status` (D3).

### 8.4 Quyết định của PO (2026-09-21)

PO chọn **A1** (qua AskUserQuestion). Hệ quả đã được ghi nhận trong hồ sơ:

| Hạng mục | Kết quả |
|---|---|
| TASK-001 | → `DONE` theo static verification (PO phê duyệt) — xem `TASK-001.md` §20 |
| Runtime AC-01…AC-06 | Giữ `KHÔNG KIỂM ĐƯỢC`, defer sang EPIC-03 |
| EPIC-03 | Đổi tên "Data Integrity & Code ↔ DB Alignment", mở `READY`, hấp thụ TASK-002 |
| TC-1…TC-11 | Sẽ chạy lại sau khi EPIC-03 hoàn thành (điều kiện hoàn thành của epic) |
