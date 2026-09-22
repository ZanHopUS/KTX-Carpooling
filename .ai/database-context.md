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
| Trạng thái schema thật | `trips` có đủ 27 cột được xác minh `ACTUAL` (§16); `profiles`, `ratings`, `messages`, `routes`, `locations` đã có bằng chứng trực tiếp về sự tồn tại hoặc vắng mặt (§14). Phần lớn cột, enum và RLS vẫn `UNKNOWN`. |
| Tài liệu mới | `docs/database/*.md` và `docs/product/*.md` mô tả **mô hình mục tiêu `DOCUMENTED`**, không thay thế bằng chứng live DB. |
| Rủi ro lớn nhất | Code đang ghi mô hình `trips` phẳng, trong khi DB thật dùng mô hình normalized; tính năng “Đăng chuyến” hỏng với mọi user. |

---

## 1. Nguồn sự thật về DB hiện có

| Nguồn | Vai trò | Độ tin cậy |
|---|---|---|
| CSV cột `public.trips` do PO xuất từ Supabase Dashboard | Bằng chứng trực tiếp cho 27 cột và kiểu dữ liệu `trips` | `ACTUAL` — xem §16 |
| Xác nhận của PO trên Supabase Dashboard | Sự tồn tại/vắng mặt của một số bảng, môi trường DEV | `ACTUAL` — xem §14 |
| `docs/database/supabase-structure.md` | Mô hình dữ liệu mục tiêu rộng, enum và RLS mong muốn | `DOCUMENTED` — không xác minh live |
| `docs/database/current-data.md`, `docs/product/*.md` | Domain, dữ liệu tham chiếu và nghiệp vụ mục tiêu | `DOCUMENTED`; các CSV/TXT được viện dẫn hiện không có trong workspace |
| `supabase/schema.sql` | Comment mô tả schema dự kiến | `DOCUMENTED` — không chạy được, không kiểm chứng live |
| `src/types/database.ts` và lời gọi `.from(...)` | Kỳ vọng của implementation hiện tại | `EXPECTED`, không phải bằng chứng DB thật |

> Chỉ dữ liệu ở §14 và §16 được gắn `ACTUAL`. Các tài liệu mới giúp xác định mô hình đích và mismatch, nhưng không được dùng để nâng cột, enum hoặc RLS lên `ACTUAL`.

---

## 2. Bảng được code gọi tới — nhãn `EXPECTED`

| Bảng | Nơi gọi (bằng chứng) | Nhãn |
|---|---|---|
| `profiles` | 12 nơi, gồm `(main)/layout.tsx:13`, `dashboard/page.tsx:16`, `(auth)/actions.ts:118` | `EXPECTED`; sự tồn tại `ACTUAL` (§14), cột chưa xác minh đủ |
| `trips` | `trips/actions.ts:37`, `trips/page.tsx:27,38`, `dashboard/page.tsx:25`, `chat/actions.ts:37` | `EXPECTED`; 27 cột thật `ACTUAL` (§16), lệch code |
| `trip_requests` | `trips/[id]/actions.ts:57,92,100,125,129,151`, `requests/page.tsx:16,37` | `EXPECTED`; schema live `UNKNOWN` |
| `messages` | `chat/page.tsx:61`, `chat/actions.ts:15,44` | `EXPECTED`, nhưng bảng **vắng mặt `ACTUAL`** trên live DB (§14) |
| `ratings` | `chat/actions.ts:87` | `EXPECTED`; sự tồn tại `ACTUAL` (§14), mô hình cột `DOCUMENTED` (§7) |
| **`users`** | `api/verifications/route.ts:35` | ❌ **SAI — gần như chắc chắn không tồn tại** (lỗi #3.1) |
| `trip_reports` | Không nơi nào gọi; chỉ có interface `types/database.ts:72` | `DOCUMENTED` trong docs mới; live schema vẫn `UNKNOWN` |

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

**Cập nhật tài liệu 2026-09-21:** `docs/database/supabase-structure.md` mô tả một mô hình `profiles` mục tiêu rộng hơn, gồm `account_status`, `verification_status`, `average_rating`, `rating_count`, `cancelled_trip_count`, `date_of_birth`, `avatar_url` và các trường KTX/Messenger. Đây là `DOCUMENTED`, không phải CSV/schema live. Các tên hiện code dùng (`status`, `dorm_card_verified`, `rating`) vẫn chưa được đối chiếu trực tiếp với cột live.

### 3.2 Câu hỏi cần PO quyết
1. Cột đúng là **`status`** hay **`account_status`**?
2. Giá trị `role` lưu **chữ HOA** hay **chữ thường**? (Code gửi HOA, tài liệu mới mô tả `user`/`admin` chữ thường.)
3. Có cần xử lý trạng thái xác minh đầy đủ theo tài liệu (`unverified`, `pending`, `verified`, `rejected`, `expired`) hay chỉ bộ giá trị code hiện có?
4. Các cột `email_verified`, `dorm_card_verified`, `rating` và `average_rating` có tồn tại/ánh xạ thế nào trên DB thật?
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

### 4.1 🔴 Xung đột đã xác minh: `date` vs `trip_date`
- **DB live `ACTUAL`** (§16): có **`trip_date`**, không có `date`.
- **Code `EXPECTED`**: `(main)/trips/actions.ts:37` insert **`date`**; `trips/page.tsx`, `matching.ts` đọc `trip.date`; type `Trip.date` khai báo `date`.
- **Tài liệu mới `DOCUMENTED`**: mô hình `trips` normalized liệt kê `trip_date` cùng 26 cột trùng CSV live, nhưng cũng liệt kê `date` là alias/legacy.
- **Kết luận**: `date` không phải alias tồn tại trên DB live hiện tại; mọi đường ghi/đọc code phụ thuộc nó đều phải được đồng bộ trong EPIC-03, không còn là câu hỏi cần PO xác nhận.

### 4.2 ⚠️ Xung đột case enum
- Code so sánh **chữ HOA**: `'OPEN'`, `'REQUESTED'`, `'ACCEPTED'`, `'COMPLETED'`, `'CANCELLED'`.
- Tài liệu mới `DOCUMENTED` liệt kê `trip_status` chữ thường: `open`, `full`, `expired`, `in_progress`, `completed`, `cancelled`; `supabase/schema.sql` comment lại ghi HOA.
- CSV live chỉ chứng minh `trips.status` là **enum**, không cung cấp các giá trị thành viên.
- **Rủi ro**: nếu DB lưu chữ thường, so sánh `===` sẽ sai ở `createTripRequestAction` ⇒ không gửi được yêu cầu.
- **Cần PO xác nhận/export enum**: giá trị enum `trips.status` thật.

---

## 5. `trip_requests`

| Cột | Tài liệu mới | Code | Nhãn |
|---|---|---|---|
| `id` | ✓ | ✓ | `DOCUMENTED` |
| `trip_id` | ✓ → `trips.id` | ✓ | `DOCUMENTED` |
| `passenger_id` | ✓ → `profiles.id` | ✓ | `DOCUMENTED` |
| `requested_pickup_time` | ❌ | ✓ | `EXPECTED` — live schema `UNKNOWN` |
| `match_score` | ❌ | ✓ | `EXPECTED` — live schema `UNKNOWN` |
| `message` | ✓ | Code hiện không insert khi tạo request | `DOCUMENTED`; live schema `UNKNOWN` |
| `status` | ✓, enum thường | `'PENDING'\|'ACCEPTED'\|'REJECTED'\|'CANCELLED'` | ⚠️ `DOCUMENTED`/code lệch case |
| `responded_at`, `responded_by`, `updated_at` | ✓ | ❌ | `DOCUMENTED` |
| `created_at` | ✓ | ✓ | `DOCUMENTED` |

> Chưa có bằng chứng trực tiếp cho schema `trip_requests`; bảng trên chỉ phân biệt mô hình mục tiêu trong docs với payload hiện code gửi.

---

## 6. `messages`

| Mô hình | Bằng chứng | Nhãn |
|---|---|---|
| Quan hệ trip → messages và RLS chỉ thành viên | `docs/database/supabase-structure.md` §§4–5 | `DOCUMENTED`; tài liệu không liệt kê cột |
| Code đọc/ghi `id`, `trip_id`, `sender_id`, `content`, `created_at` | `chat/page.tsx`, `chat/actions.ts` | `EXPECTED` |
| Bảng không tồn tại trên live DB DEV | PO kiểm tra Supabase Dashboard (§14) | `ACTUAL` — chat hiện lỗi runtime |

---

## 7. `ratings` — tồn tại `ACTUAL`, schema cột chưa xác minh

- **Sự tồn tại `ACTUAL`**: PO xác nhận bảng có trên Supabase Dashboard (§14).
- **Mô hình `DOCUMENTED`**: `id`, `trip_id`, `from_user_id`, `to_user_id`, `score`, `comment`, `available_at`, `created_at` trong `docs/database/supabase-structure.md` §2.12.
- **Code `EXPECTED`**: `submitRatingAction` gửi `trip_id`, `from_user_id`, `to_user_id`, **`stars`**, `comment` tại `chat/actions.ts:87`.
- **Mismatch cần xác minh**: docs gọi cột điểm là `score`, code gửi `stars`; chưa có CSV/schema live để kết luận cột nào tồn tại.

---

## 8. `trip_reports` — `DOCUMENTED`, live schema `UNKNOWN`

- Docs mới mô tả cột `id`, `trip_id`, `reporter_id`, `reported_user_id`, `reason`, `description`, `status`, thông tin review và `created_at`.
- Chỉ có `interface TripReport` ở `types/database.ts:72`; `grep` toàn `src/` → **không nơi nào sử dụng**.
- Landing page quảng cáo "Báo cáo sự cố", nhưng sự tồn tại bảng và luồng thực thi trên DB live vẫn `UNKNOWN`.

---

## 9. Enum — tổng hợp

| Enum | Giá trị theo tài liệu mới | Giá trị theo code | Nhãn |
|---|---|---|---|
| `user_role` | `user \| admin` (thường) | `DRIVER \| PASSENGER \| BOTH \| ADMIN` (HOA) | `DOCUMENTED`/`EXPECTED` xung đột; live `UNKNOWN` |
| `verification_status` | `unverified \| pending \| verified \| rejected \| expired` | `PENDING \| VERIFIED \| REJECTED` | `DOCUMENTED`/`EXPECTED` xung đột; live `UNKNOWN` |
| `trip_status` | `open \| full \| expired \| in_progress \| completed \| cancelled` | `OPEN \| REQUESTED \| ACCEPTED \| COMPLETED \| CANCELLED` | `DOCUMENTED`/`EXPECTED` xung đột; CSV chỉ xác nhận kiểu enum |
| `trip_request_status` | `pending \| accepted \| rejected \| cancelled \| expired` | `PENDING \| ACCEPTED \| REJECTED \| CANCELLED` | `DOCUMENTED`/`EXPECTED` xung đột; live `UNKNOWN` |
| `payment_method` | Không có enum tương ứng trong mô hình normalized | `CASH \| BANK_TRANSFER` | `EXPECTED`; live `UNKNOWN` |

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
| D3 | Giá trị enum live lưu chữ HOA hay thường? | 🔴 Chặn |
| D4 | `ratings` **đã tồn tại `ACTUAL`**; cần export schema cột và chốt `stars` hay `score`. | 🟠 Cao |
| D5 | `messages` **vắng mặt `ACTUAL`**; PO cần duyệt TASK-002 hoặc schema thay thế trước runtime chat. | 🟠 Cao |
| D6 | Chấp nhận cung cấp **schema dump** hoặc kết nối read-only để chuyển `UNKNOWN` → `ACTUAL`? | 🔴 Chặn |
| D7 | Đưa DDL/migration baseline từ DB thật vào repo? | 🟠 Cao |
| D8 | Cơ chế tạo tài khoản ADMIN? | 🟠 Cao |
| D9 | Xử lý 2 bucket thẻ KTX (gộp về 1 bucket private)? | 🔴 Bảo mật |
| D10 | Có áp dụng toàn bộ trạng thái xác minh được mô tả trong tài liệu mới? | 🟡 Trung bình |

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

## 17. Reconciliation với docs mới (2026-09-21)

Phần này là kết luận ưu tiên khi nội dung cũ trong tài liệu mâu thuẫn với bằng chứng mới:

| Đối tượng | Kết luận hiện tại | Nhãn |
|---|---|---|
| `trips` | Bảng tồn tại; schema live là normalized 27 cột; có `trip_date`, không có `date`; code hiện không tương thích với write path | `ACTUAL` |
| `locations` | Bảng tồn tại và có dữ liệu trên DB DEV; chưa có dump đầy đủ cột | `ACTUAL` về sự tồn tại/dữ liệu, `UNKNOWN` về schema chi tiết |
| `routes` | Bảng tồn tại và có dữ liệu trên DB DEV; chưa có dump đầy đủ cột | `ACTUAL` về sự tồn tại/dữ liệu, `UNKNOWN` về schema chi tiết |
| `ratings` | Bảng tồn tại; cột thật chưa được dump; code dùng `stars`, docs mục tiêu dùng `score` | `ACTUAL` về sự tồn tại, `UNKNOWN` về schema |
| `messages` | Không tồn tại trên DB DEV; các route chat hiện không thể chạy end-to-end | `ACTUAL` |
| `trip_requests` | Code và docs đều tham chiếu, nhưng chưa có bằng chứng schema live trực tiếp | `UNKNOWN` |
| `notifications`, `trip_reports` | Chỉ được mô tả trong docs/type; chưa có bằng chứng live | `DOCUMENTED`, live `UNKNOWN` |

### 17.1 Quy tắc đọc tài liệu mới

- `docs/database/supabase-structure.md` là mô hình mục tiêu rộng, không tự động chứng minh schema live.
- `docs/database/current-data.md` là domain/dataset tham chiếu; danh sách trường mở rộng không đồng nghĩa UI hiện tại hỗ trợ toàn bộ.
- CSV locations/routes là nguồn domain quan trọng, nhưng các file nguồn không nằm trong workspace hiện tại; không tự suy luận thêm cột live từ CSV.
- Không sửa code trips, matching, pricing hoặc chat trước khi EPIC-03 chốt hướng: sửa code theo DB normalized hay đưa DB về thiết kế khác bằng migration có chủ đích.

### 17.2 Các mục cũ đã superseded

- Mục §14 trước đây ghi `trips` và `trip_requests` là `UNKNOWN`; `trips` đã được nâng lên `ACTUAL` ở §15–§16. `trip_requests` vẫn `UNKNOWN`.
- Mục §4.1 trước đây coi `date` vs `trip_date` là câu hỏi mở; bằng chứng CSV đã giải quyết: DB dùng `trip_date`, code dùng `date` là sai.
- Mục §6 đã được xác nhận dứt điểm: `messages` vắng mặt trên DB DEV, không chỉ là chưa kiểm tra.
