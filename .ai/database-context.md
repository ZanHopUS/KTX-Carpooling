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
| Trạng thái schema thật | **`UNKNOWN`** — không có đường truy cập project Supabase. |
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
| D1 | Tên cột ngày đi thật: `date` hay `trip_date`? | 🔴 Chặn |
| D2 | Cột trạng thái tài khoản: `status` hay `account_status`? | 🟠 Cao |
| D3 | Enum lưu chữ HOA hay chữ thường? | 🔴 Chặn |
| D4 | Bảng `ratings` có tồn tại không? Schema ra sao? | 🟠 Cao |
| D5 | Bảng `messages` có tồn tại không? | 🟠 Cao |
| D6 | Chấp nhận cung cấp **schema dump** hoặc kết nối read-only để chuyển `UNKNOWN` → `ACTUAL`? | 🔴 Chặn |
| D7 | Đưa file `20260916_align_ktx_schema.sql` vào repo? | 🟠 Cao |
| D8 | Cơ chế tạo tài khoản ADMIN? | 🟠 Cao |
| D9 | Xử lý 2 bucket thẻ KTX (gộp về 1 bucket private)? | 🔴 Bảo mật |
| D10 | Có áp dụng trạng thái `NEED_REVIEW` trong nghiệp vụ? | 🟡 Trung bình |
