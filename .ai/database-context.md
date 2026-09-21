# DATABASE CONTEXT — KTX Carpooling

> Phân loại trạng thái database theo 4 nhãn bắt buộc: `DOCUMENTED` · `ACTUAL` · `EXPECTED` · `UNKNOWN`.
> **Nguyên tắc:** không có bằng chứng trực tiếp ⇒ `UNKNOWN`. Không được nâng `UNKNOWN` → `ACTUAL` bằng suy luận.

---

## 0. Kết luận nhanh

| Câu hỏi | Trả lời |
|---|---|
| Có file DDL chạy được trong repo? | **KHÔNG.** `supabase/schema.sql` chỉ là **comment**, không có câu lệnh SQL nào. |
| Có migration? | **KHÔNG.** `supabase/migrations/` rỗng hoàn toàn (0 file). |
| File migration được tham chiếu | `migrations/20260916_align_ktx_schema.sql` — **KHÔNG TỒN TẠI trong repo**. |
| Trạng thái schema thật | `trips` đã xác minh **`ACTUAL`** (§16 — lệch hoàn toàn với code, 3 thiết kế khác nhau); các bảng khác vẫn `UNKNOWN`. |
| Rủi ro lớn nhất | Không thể tái lập môi trường; không thể review thay đổi schema; tài liệu và code mâu thuẫn về tên cột. |

---

## 1. Nguồn sự thật về DB hiện có

| Nguồn | Vai trò | Độ tin cậy |
|---|---|---|
| `supabase/schema.sql` | **Comment mô tả** schema "sau khi căn với project đang chạy" | Trung bình — do người viết tay, không kiểm chứng được |
| `docs/database/supabase-structure.md` | Mô tả bảng/cột/enum/RLS | Trung bình — có chỗ lệch với code |
| `docs/database/current-data.md` | Dữ liệu tĩnh: tòa KTX, campus, ma trận khoảng cách | Cao (khớp `constants.ts`) |
| `src/types/database.ts` | Type TS mà code tin dùng | Cao cho **kỳ vọng của code**, không phải cho DB thật |
| Lời gọi `.from(...)` trong code | Bằng chứng bảng **phải tồn tại** để app chạy | Cao |

> **Không có nguồn nào là `ACTUAL`.** Toàn bộ hiểu biết về schema đều là gián tiếp.

---

## 2. Bảng được code gọi tới — nhãn `EXPECTED`

| Bảng | Nơi gọi (bằng chứng) | Nhãn |
|---|---|---|
| `profiles` | 12 nơi, gồm `(main)/layout.tsx:13`, `dashboard/page.tsx:16`, `(auth)/actions.ts:118` | `EXPECTED` |
| `trips` | `trips/actions.ts:37`, `trips/page.tsx:27,38`, `dashboard/page.tsx:25`, `chat/actions.ts:37` | `EXPECTED` |
| `trip_requests` | `trips/[id]/actions.ts:57,92,100,125,129,151`, `requests/page.tsx:16,37` | `EXPECTED` |
| `messages` | `chat/page.tsx:61`, `chat/actions.ts:15,44` | `EXPECTED` |
| `ratings` | `chat/actions.ts:63` | `EXPECTED` ⚠️ không có trong bất kỳ tài liệu nào |
| **`users`** | `api/verifications/route.ts:35` | ❌ **SAI — gần như chắc chắn không tồn tại** (lỗi #3.1) |
| `trip_reports` | Không nơi nào gọi; chỉ có interface `types/database.ts:72` | `UNKNOWN` — dead type |

---

## 3. `profiles`

### 3.1 Cột — so sánh 3 nguồn

| Cột | Tài liệu | `schema.sql` | Code / Type | Nhãn | Ghi chú |
|---|---|---|---|---|---|
| `id` | ✓ | = `auth.users.id` | ✓ | `DOCUMENTED` | |
| `email` | ✓ | — | ✓ | `DOCUMENTED` | |
| `full_name` | ✓ | — | ✓ | `DOCUMENTED` | |
| `phone` | ✓ | — | ✓ | `DOCUMENTED` | |
| `university` | ✓ | **nguồn sự thật** | ✓ | `DOCUMENTED` | |
| `student_id` | ✓ | — | ✓ | `DOCUMENTED` | |
| `dorm_area` | ✓ | — | ✓ | `DOCUMENTED` | |
| `dorm_building` | ✓ | — | ✓ | `DOCUMENTED` | |
| `dorm_card_url` | ✓ | — | ✓ | `DOCUMENTED` | |
| `dorm_card_verified` | ✓ | `PENDING\|VERIFIED\|REJECTED\|NEED_REVIEW` | `'PENDING'\|'VERIFIED'\|'REJECTED'` | ⚠️ **XUNG ĐỘT** | `NEED_REVIEW` có trong schema nhưng **không có trong code** |
| `role` | `BOTH` default | `passenger\|driver\|both\|admin` | `'DRIVER'\|'PASSENGER'\|'BOTH'\|'ADMIN'` | ⚠️ **XUNG ĐỘT CASE** | Form đăng ký gửi **CHỮ HOA** |
| `rating` | ✓ (default 5.0) | — | ✓ | `DOCUMENTED` | Không bao giờ được cập nhật (#3.6) |
| `completed_trip_count` | ✓ | — | ✓ | `DOCUMENTED` | Không nơi nào ghi |
| `cancelled_trip_count` | ❌ không có | — | ✓ `types/database.ts` | `UNKNOWN` | Cột **chưa từng được tài liệu hoá** |
| `email_verified` | ❌ không có | — | ✓ `(auth)/actions.ts:128,163` | `UNKNOWN` | Code **ghi** cột này ⇒ DB phải có |
| `status` | `account_status` | — | ✓ `'ACTIVE'\|'BLOCKED'` | ⚠️ **XUNG ĐỘT TÊN CỘT** | Tài liệu nói `account_status` |
| `verification_note` | ✓ | ✓ | ✓ | `DOCUMENTED` | |
| `school` | ❌ | ✓ "cột cũ, đồng bộ từ university" | ❌ | `UNKNOWN` | **Cột di sản** |
| `verification_status` | ❌ | ✓ "cột cũ, không dùng" | ❌ | `UNKNOWN` | **Cột di sản** |

### 3.2 Câu hỏi cần PO quyết
1. Cột đúng là **`status`** hay **`account_status`**?
2. Giá trị `role` lưu **chữ HOA** hay **chữ thường**? (Code gửi HOA, schema comment ghi thường.)
3. Có cần xử lý trạng thái **`NEED_REVIEW`** không? (Có trong schema, không có trong code/UI.)
4. `cancelled_trip_count` và `email_verified` đã tồn tại trong DB thật chưa?
5. Tài khoản **ADMIN** được tạo bằng cách nào? (Không có UI, không có seed script.)

---

## 4. `trips`

| Cột | Tài liệu | `schema.sql` | Code / Type | Nhãn | Ghi chú |
|---|---|---|---|---|---|
| `id` | ✓ | — | ✓ | `DOCUMENTED` | |
| `driver_id` | ✓ → `profiles.id` | ✓ | ✓ | `DOCUMENTED` | |
| **ngày đi** | `trip_date` | `trip_date` | **`date`** | 🔴 **XUNG ĐỘT TÊN CỘT** | Xem mục 4.1 |
| `pickup_time` | ✓ | ✓ | ✓ (`"HH:mm"`) | `DOCUMENTED` | |
| `pickup_area` | ✓ | ✓ | ✓ | `DOCUMENTED` | |
| `pickup_building` | ✓ | ✓ | ✓ | `DOCUMENTED` | |
| `pickup_point` | ✓ | ✓ | ✓ | `DOCUMENTED` | |
| `destination_university` | ✓ | ✓ | ✓ | `DOCUMENTED` | |
| `destination_campus` | ✓ | ✓ | ✓ | ⚠️ **SAI NGỮ NGHĨA** | Code lưu **index** (`"1"`) rồi hiển thị trực tiếp |
| `destination_building` | ✓ | ✓ | ✓ | `DOCUMENTED` | |
| `distance_km` | ✓ | ✓ | ✓ | `DOCUMENTED` | |
| `suggested_price` | ✓ | ✓ | ✓ | `DOCUMENTED` | |
| `payment_method` | ✓ | `CASH\|BANK_TRANSFER` | ✓ | `DOCUMENTED` | |
| `available_seats` | ✓ | ✓ | ✓ (=1) | `DOCUMENTED` | |
| `status` | ✓ | `OPEN\|REQUESTED\|ACCEPTED\|…` | `'OPEN'\|'REQUESTED'\|'ACCEPTED'\|'COMPLETED'\|'CANCELLED'` | ⚠️ **XUNG ĐỘT CASE** | Xem 4.2 |
| `class_period` | ❌ | ❌ | ✓ `types/database.ts` | `UNKNOWN` | Không tài liệu, không dùng |
| `class_start_time` | ❌ | ❌ | ✓ `types/database.ts` | `UNKNOWN` | Không tài liệu, không dùng |
| `start_location` | ❌ | ✓ "cột cũ / phụ" | ❌ | `UNKNOWN` | **Cột di sản** |
| `destination` | ❌ | ✓ "cột cũ / phụ" | ❌ | `UNKNOWN` | **Cột di sản** |
| `vehicle_type` | ❌ | ✓ "cột cũ / phụ" | ❌ | `UNKNOWN` | **Cột di sản** |
| `notes` | ❌ | ✓ "cột cũ / phụ" | ✓ | ⚠️ | Code có nhập `notes` |
| `created_at` | ✓ | — | ✓ | `DOCUMENTED` | |

### 4.1 🔴 Xung đột nghiêm trọng: `date` vs `trip_date`
- **Nguồn A** (`docs/database/supabase-structure.md` + `supabase/schema.sql:18`): cột là **`trip_date`**, comment ghi rõ *"schema sau khi căn với project Supabase đang chạy"*.
- **Nguồn B** (implementation): `(main)/trips/actions.ts:37` insert **`date`**; `trips/page.tsx`, `matching.ts` đọc `trip.date`; type `Trip.date` khai báo `date`.
- **Ảnh hưởng nếu DB thật là `trip_date`**: `createTripAction` insert **thất bại** (cột không tồn tại) ⇒ **không đăng được chuyến**; tìm kiếm và matching cũng hỏng.
- **Ảnh hưởng nếu DB thật là `date`**: tài liệu + `schema.sql` sai, cần cập nhật.
- **Cần PO quyết định**: tên cột thật là gì? → xem `.ai/reports/onboarding-report.md` §CONFLICTS.

### 4.2 ⚠️ Xung đột case enum
- Code so sánh **chữ HOA**: `'OPEN'`, `'REQUESTED'`, `'ACCEPTED'`, `'COMPLETED'`, `'CANCELLED'`.
- `schema.sql:22` ghi `status (OPEN | REQUESTED | ACCEPTED | …)` — HOA.
- `lib/matching.ts` có `trip.status?.toUpperCase() !== 'OPEN'` — **dấu hiệu phòng thủ**, gợi ý lập trình viên từng gặp giá trị chữ thường.
- **Rủi ro**: nếu DB lưu chữ thường, so sánh `===` sẽ sai ở `createTripRequestAction` ⇒ không gửi được yêu cầu.
- **Cần PO quyết định**: giá trị enum thật là gì?

---

## 5. `trip_requests`

| Cột | Tài liệu | `schema.sql` | Code | Nhãn |
|---|---|---|---|---|
| `id` | ✓ | — | ✓ | `DOCUMENTED` |
| `trip_id` | ✓ → `trips.id` | ✓ | ✓ | `DOCUMENTED` |
| `passenger_id` | ✓ → `profiles.id` | ✓ | ✓ | `DOCUMENTED` |
| `requested_pickup_time` | ✓ | ✓ | ✓ | `DOCUMENTED` |
| `match_score` | ✓ | ✓ | ✓ | `DOCUMENTED` |
| `message` | ✓ | ✓ | ✓ | `DOCUMENTED` |
| `status` | ✓ | ✓ | `'PENDING'\|'ACCEPTED'\|'REJECTED'\|'CANCELLED'` | `DOCUMENTED` |
| `created_at` | ✓ | — | ✓ | `DOCUMENTED` |

---

## 6. `messages`

| Cột | Tài liệu | Code | Nhãn |
|---|---|---|---|
| `id` | ✓ | ✓ | `DOCUMENTED` |
| `trip_id` | ✓ | ✓ | `DOCUMENTED` |
| `sender_id` | ✓ | ✓ | `DOCUMENTED` |
| `content` | ✓ | ✓ | `DOCUMENTED` |
| `created_at` | ✓ | ✓ | `DOCUMENTED` |

> **Sự tồn tại thật của bảng này = `UNKNOWN`.** Chưa có bằng chứng nào ngoài code gọi tới.

---

## 7. Bảng `ratings` — hoàn toàn `UNKNOWN`

- **Bằng chứng duy nhất**: `chat/actions.ts:63` `.from('ratings').insert({...})`.
- **KHÔNG** xuất hiện trong `docs/`, **KHÔNG** xuất hiện trong `supabase/schema.sql`.
- Type `Rating` có ở `types/database.ts:62`.
- **Câu hỏi**: bảng có tồn tại? Tên cột là gì? `submitRatingAction` hiện có chạy được không?
- Nếu bảng không tồn tại ⇒ chức năng đánh giá **hỏng hoàn toàn** (im lặng, không báo lỗi cho người dùng).

---

## 8. Bảng `trip_reports` — `UNKNOWN` (khả năng cao không tồn tại)

- Chỉ có `interface TripReport` ở `types/database.ts:72`.
- `grep` toàn `src/` → **không nơi nào sử dụng**.
- Landing page quảng cáo "Báo cáo sự cố" (mục #3.17).

---

## 9. Enum — tổng hợp

| Enum | Giá trị theo tài liệu | Giá trị theo code | Nhãn |
|---|---|---|---|
| `user_role` | `passenger \| driver \| both \| admin` (thường) | `DRIVER \| PASSENGER \| BOTH \| ADMIN` (HOA) | ⚠️ `UNKNOWN` + xung đột |
| `verification_status` | `PENDING \| VERIFIED \| REJECTED \| NEED_REVIEW` | `PENDING \| VERIFIED \| REJECTED` | ⚠️ thiếu `NEED_REVIEW` |
| `trip_status` | `OPEN \| REQUESTED \| ACCEPTED \| …` | `OPEN \| REQUESTED \| ACCEPTED \| COMPLETED \| CANCELLED` | `UNKNOWN` (case) |
| `trip_request_status` | mô tả có | `PENDING \| ACCEPTED \| REJECTED \| CANCELLED` | `DOCUMENTED` |
| `payment_method` | `CASH \| BANK_TRANSFER` | ✓ | `DOCUMENTED` |

---

## 10. RLS — `DOCUMENTED` (chưa xác minh)

Theo `docs/database/supabase-structure.md`:

| Bảng | Policy được mô tả |
|---|---|
| `profiles` | Đọc công khai; chỉ chủ sở hữu sửa; admin sửa tất cả |
| `trips` | Đọc công khai; **INSERT chỉ tài xế đã xác minh**; sửa bởi chủ chuyến |
| `trip_requests` | SELECT giới hạn: hành khách của yêu cầu, tài xế của chuyến, admin; UPDATE: hành khách huỷ hoặc tài xế chấp nhận/từ chối |
| `messages` | Chỉ thành viên chuyến |

### ⚠️ Điểm mấu chốt
- Code dùng **anon key** ⇒ **RLS là tuyến phòng thủ duy nhất ở tầng DB**.
- Nếu RLS đã đúng như tài liệu, một số lỗ hổng mục #3.3–#3.6 **có thể** đã bị chặn ở DB — nhưng **không thể xác minh** ⇒ vẫn phải coi là rủi ro.
- **RLS thật = `UNKNOWN`.**

---

## 11. Hàm & RPC — `UNKNOWN`

| Đối tượng | Nguồn | Dùng trong code? |
|---|---|---|
| `is_admin()` | `schema.sql:29` (comment) | ❌ Không |
| `is_verified_user()` | `schema.sql:29` (comment) | ❌ Không |
| `accept_trip_request(uuid)` | `schema.sql:28` (comment) | ❌ Không — code tự làm bằng nhiều câu update |

> Code **không gọi** RPC `accept_trip_request`, dù nó tồn tại. Nghi vấn: logic chấp nhận đã bị **cài lại bằng tay** ở tầng ứng dụng → có thể lệch với logic trong DB.

---

## 12. Storage buckets — `DOCUMENTED` một phần

| Bucket | Quyền | Dùng ở | Vấn đề |
|---|---|---|---|
| `dorm-cards` | **public** | `(main)/profile/actions.ts` | 🔴 Ảnh thẻ KTX (họ tên + MSSV) **lộ công khai** |
| `verification_docs` | không rõ (kỳ vọng private) | `api/verifications/route.ts` | Route đang hỏng (#3.1) |

---

## 13. Hành động cần PO quyết định

| # | Câu hỏi | Mức độ |
|---|---|---|
| D1 | **ĐÃ GIẢI (2026-09-21): `trip_date`** — code dùng `date` là SAI (bằng chứng CSV của PO, §16) | ✅ Xong |
| D2 | Cột trạng thái tài khoản: `status` hay `account_status`? | 🟠 Cao |
| D3 | Enum lưu chữ HOA hay chữ thường? | 🔴 Chặn |
| D4 | Bảng `ratings` có tồn tại không? Schema ra sao? | 🟠 Cao |
| D5 | Bảng `messages` có tồn tại không? | 🟠 Cao |
| D6 | Chấp nhận cung cấp **schema dump** hoặc kết nối read-only để chuyển `UNKNOWN` → `ACTUAL`? | 🔴 Chặn |
| D7 | Đưa file `20260916_align_ktx_schema.sql` vào repo? | 🟠 Cao |
| D8 | Cơ chế tạo tài khoản ADMIN? | 🟠 Cao |
| D9 | Xử lý 2 bucket thẻ KTX (gộp về 1 bucket private)? | 🔴 Bảo mật |
| D10 | Có áp dụng trạng thái `NEED_REVIEW` trong nghiệp vụ? | 🟡 Trung bình |

---

## 14. Xác nhận thực tế từ Product Owner (2026-09-21) — cập nhật nhãn `ACTUAL`

Nguồn: PO kiểm tra Supabase Dashboard, trả lời checklist trong `.ai/reports/ENVIRONMENT-ASSESSMENT-TASK-001.md` mục 7.

| Đối tượng | PO xác nhận | Nhãn mới | Ghi chú |
|---|---|---|---|
| Môi trường project | DEV — project tạo để phát triển, chưa đưa cho người dùng thật; Site URL `http://localhost:3000`, Redirect `http://localhost:3000/**` | `ACTUAL` | |
| `auth.users` | 2 user: PO (email thật) + 1 admin | `ACTUAL` | Giải một phần D8: đã có sẵn tài khoản ADMIN (cách tạo không rõ) |
| `profiles` | Tồn tại, 2 bản ghi (PO + admin) | `ACTUAL` (sự tồn tại) | Cột vẫn theo bảng §3 — chưa xác minh từng cột |
| `ratings` | **TỒN TẠI** | `ACTUAL` (sự tồn tại) | Giải một phần D4 — schema cột vẫn `UNKNOWN` |
| `messages` | **KHÔNG TỒN TẠI** | `ACTUAL` | Giải D5; chặn AC-04 TASK-001 + toàn bộ tính năng chat hiện hỏng trên DB này |
| `routes`, `locations` | TỒN TẠI, chứa dữ liệu thật | `ACTUAL` (sự tồn tại) | Hai bảng KHÔNG có trong tài liệu — schema cột `UNKNOWN` |
| `trips`, `trip_requests` | Chưa xác nhận | `UNKNOWN` | Cần PO kiểm tra Table Editor |
| Bucket `dorm-cards` | Chưa có ảnh thật | `ACTUAL` | |

---

## 15. Phát hiện từ runtime verification (2026-09-21, sau khi PO duyệt fixture run)

Nguồn: chạy app thật trên dev server (`npm run dev`) theo kế hoạch fixture đã PO duyệt
("duyệt toàn bộ"). Chi tiết: `.ai/reports/RUNTIME-LOG-TASK-001.md`.

| Đối tượng | Bằng chứng | Nhãn | Ghi chú |
|---|---|---|---|
| `trips` — sự tồn tại + đường đọc | Trang `/trips` load 200, query `select *` không lỗi; `/dashboard` đếm `count(trips)` = 0 | `ACTUAL` | Bảng **tồn tại**, đọc được, **đang trống** (0 bản ghi) |
| `trips.available_seats` | `createTripAction` lỗi `PGRST204: "Could not find the 'available_seats' column of 'trips' in the schema cache"` (log dev server + alert UI) | `ACTUAL` | Cột **KHÔNG tồn tại** ⇒ tính năng "Đăng chuyến" **hỏng hoàn toàn** với mọi user |
| `trips.date` | ~~SUY LUẬN MẠNH: cột `date` tồn tại~~ — **BỊ BÁC BỎ** bởi CSV cột thật của PO (§16): bảng có `trip_date`, KHÔNG có `date`. PGRST204 báo cột thiếu theo thứ tự **alphabet** của khóa payload (`available_seats` đứng đầu trong các khóa thiếu), không theo thứ tự khai báo — suy luận cũ từ thứ tự payload là sai | `ACTUAL` (bác bỏ) | Giải **D1**: tên cột thật là `trip_date` — tài liệu + `schema.sql` ĐÚNG, code dùng `date` là SAI |
| `trip_requests` | Chưa có thao tác nào chạm tới (không tạo được trip) | `UNKNOWN` | Vẫn chờ kiểm chứng |
| Đăng ký user (auth + `profiles`) | `registerAction` với email test `devtest.b@devtest.edu.vn` thành công: có user id, `identities: 1`, session cấp ngay, redirect `/dashboard`, profile đọc được (hiển thị tên) | `ACTUAL` | **"Confirm email" đang TẮT** trong project Supabase — signup được session ngay không cần OTP; insert `profiles` hoạt động |
| Ràng buộc email | Email `devtest.edu.vn` (không có thật) vẫn qua được validate domain | `ACTUAL` | Như phân tích code: whitelist 14 domain + chấp nhận mọi đuôi `.edu.vn` |
| Cột `trips` còn thiếu khác ngoài `available_seats`? | PO xuất CSV cột thật từ Dashboard (2026-09-21, xem §16): **14/17** cột code insert KHÔNG tồn tại trong bảng | `ACTUAL` | Đã đối chiếu xong — chi tiết §16 |

**Hệ quả:** không thể tạo fixture trip qua app ⇒ toàn bộ 11 test case runtime của TASK-001
bị chặn (mọi TC đều cần ít nhất 1 trip). Verification runtime tiếp tục **BLOCKED**.

---

## 16. Cột thật của `trips` — PO cung cấp CSV từ Supabase Dashboard (2026-09-21)

Nguồn: PO chạy query `information_schema.columns` (bảng `public.trips`) và xuất CSV
(`Supabase Snippet Untitled query.csv`). Bằng chứng trực tiếp ⇒ nhãn `ACTUAL`.

### 16.1 Danh sách 27 cột thật

| Cột | Kiểu | Cột | Kiểu |
|---|---|---|---|
| `id` | uuid | `cancelled_by` | uuid |
| `driver_id` | uuid | `cancelled_at` | timestamptz |
| `vehicle_id` | uuid | `cancellation_reason` | **enum** |
| `route_id` | uuid | `cancellation_note` | text |
| `pickup_location_id` | uuid | `expired_at` | timestamptz |
| `trip_date` | date | `started_at` | timestamptz |
| `departure_time` | time | `completed_at` | timestamptz |
| `class_start_time` | time | `created_at` | timestamptz |
| `class_end_time` | time | `updated_at` | timestamptz |
| `distance_meters_snapshot` | integer | `status` | **enum** |
| `duration_seconds_snapshot` | integer | `accepted_passenger_id` | uuid |
| `price_snapshot` | integer | `accepted_request_id` | uuid |
| `currency` | text | | |
| `note` | text | | |

### 16.2 Đối chiếu với 17 cột code insert (`createTripAction`)

| Trạng thái | Cột |
|---|---|
| ✅ Tồn tại — **3/17** | `driver_id`, `status`, `created_at` |
| ❌ KHÔNG tồn tại — **14/17** | `date`, `pickup_time`, `pickup_area`, `pickup_building`, `pickup_point`, `destination_university`, `destination_campus`, `destination_building`, `distance_km`, `suggested_price`, `available_seats`, `payment_method`, `notes` (+ `id` tự sinh) |
| Bảng có mà code **không dùng** — 22 cột | `vehicle_id`, `route_id`, `pickup_location_id`, `trip_date`, `departure_time`, `class_start_time`, `class_end_time`, `distance_meters_snapshot`, `duration_seconds_snapshot`, `price_snapshot`, `currency`, `note`, `accepted_passenger_id`, `accepted_request_id`, `cancelled_by`, `cancelled_at`, `cancellation_reason`, `cancellation_note`, `expired_at`, `started_at`, `completed_at`, `updated_at` |

### 16.3 Kết luận

1. **`trips` thật là một thiết kế HOÀN TOÀN KHÁC** (normalized: FK `vehicle_id`/`route_id`/`pickup_location_id`
   trỏ về `vehicles`/`routes`/`locations`; cột snapshot khoảng cách/thời gian/giá; cột lifecycle). Khớp với việc
   PO xác nhận `routes` + `locations` có dữ liệu thật (§14).
2. **Không có dòng code nào dùng thiết kế thật.** Grep toàn `src/` cho
   `route_id|pickup_location_id|distance_meters_snapshot|duration_seconds_snapshot|class_start_time|accepted_passenger_id|departure_time|price_snapshot`
   → chỉ khớp duy nhất `class_start_time?` (optional) trong `types/database.ts:40`. Tính năng OSRM
   (`lib/pricing.ts`) trả về `distance_km` — theo thiết kế của CODE, không phải `distance_meters_snapshot`.
3. **Ba thiết kế lệch nhau**: (a) DB thật — normalized; (b) code — flat 17 cột; (c) `schema.sql` doc — mô tả
   trạng thái SAU migration `20260916_align_ktx_schema.sql` **chưa từng chạy** (file không có trong repo,
   `supabase/migrations/` trống). Doc chỉ đúng 1 điểm với DB thật: cột `trip_date`.
4. **Đề xuất `add column if not exists` 15 cột trong RUNTIME-LOG §4 đã THU HỒI** — nếu áp dụng sẽ tạo bảng lai,
   có thể vẫn fail do ràng buộc NOT NULL của thiết kế thật (CSV không kèm `is_nullable` nên chưa biết), và làm
   bẩn bảng đã chứa dữ liệu thật qua `routes`/`locations`.
5. `trips.status` + `cancellation_reason` là **enum** — giá trị (HOA/thường) vẫn `UNKNOWN` (**D3 chưa giải**);
   code ghi `'OPEN'`, `'COMPLETED'`… chữ HOA.
6. **Luồng ghi trip qua app hỏng toàn bộ**: create fail (14 cột không tồn tại); update status phụ thuộc giá trị
   enum; đường đọc `select *` vẫn hoạt động.

**Hệ quả orchestration:** fixture run TASK-001 không thể tiếp tục qua UI. Đồng bộ code ↔ DB là quyết định
kiến trúc thuộc PO, ngoài phạm vi TASK-001 (chi tiết: `.ai/reports/RUNTIME-LOG-TASK-001.md` §8).
