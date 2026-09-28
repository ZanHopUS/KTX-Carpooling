# Live Schema Baseline Contract — KTX Carpooling

> **Ngày khởi tạo**: 2026-09-22 (Thu thập theo TASK-003, Nguồn bằng chứng: [`docs/database/evidence-20260922.md`](file:///d:/CNTT/KTX%20Carpooling/ktx-carpooling/docs/database/evidence-20260922.md))  
> **Trạng thái**: ✅ `ACTUAL` — Đây là nguồn sự thật (Canonical Source of Truth) cho toàn bộ cấu trúc DB live trên Supabase DEV.

---

## 1. Bảng so sánh tổng quan: Live DB vs Application Code vs Old Docs

| Đối tượng | Live DB (`ACTUAL`) | Code App (`src/`) | Old Docs (`DOCUMENTED`) | Ghi chú & Đánh giá |
|---|---|---|---|---|
| **Bảng `trips`** | Normalized 27 cột chính + 13 cột mở rộng phẳng (tổng 39 cột) | Viết theo 17 cột phẳng cũ | 27 cột normalized | **Live DB đã có đầy đủ cả 2 nhóm cột**. Cần dùng Boundary DTO Mapping để đọc/ghi mượt mà. |
| **Bảng `messages`** | 5 cột (`id, trip_id, sender_id, content, created_at`) | Dùng 5 cột trên | Đã tạo qua TASK-002 | ✅ Đồng bộ 100%. |
| **Bảng `ratings`** | Cột `score` (int4 1-5), `comment`, `available_at` | Code gọi `stars` | Cột `stars` | ⚠️ **Cột thực tế trên DB là `score`**, không phải `stars`. Code cần map sang `score`. |
| **Bảng `profiles`** | `role` (`user` / `admin`), `verification_status` (`unverified`, `pending`, `verified`, `rejected`, `expired`) | Dùng `role` & `dorm_card_verified` | `account_status`, `role` | `profiles.role` chỉ gồm `'user'` và `'admin'`. Phân quyền xác minh KTX dùng `verification_status`. |
| **Bảng `users`** | **KHÔNG TỒN TẠI** | `api/verifications/route.ts` gọi | Không có | 🔴 Bug code trong `api/verifications/route.ts` gọi nhầm `users`. Cần đổi sang `profiles`. |
| **RLS Policies** | Bật RLS trên 100% 18 bảng (18/18 `true`) | Cần tuân thủ RLS | Cần RLS | DB đã cài sẵn `is_verified_user()`, `is_admin()`, `can_rate_trip()`. |

---

## 2. Chi tiết Cấu trúc Các Bảng Cốt Lõi (`public`)

### 2.1 Bảng `trips` (39 cột)
* **Khóa chính**: `id` (uuid, default: `gen_random_uuid()`)
* **Khóa ngoại**:
  * `driver_id` $\rightarrow$ `profiles(id)`
  * `vehicle_id` $\rightarrow$ `vehicles(id)`
  * `route_id` $\rightarrow$ `routes(id)`
  * `pickup_location_id` $\rightarrow$ `locations(id)`
  * `accepted_passenger_id` $\rightarrow$ `profiles(id)`
  * `accepted_request_id` $\rightarrow$ `trip_requests(id)`
  * `cancelled_by` $\rightarrow$ `profiles(id)`
* **Nhóm cột Chuyến đi Normalized**: `trip_date` (date), `departure_time` (time), `class_start_time` (time), `class_end_time` (time), `distance_meters_snapshot` (int4), `duration_seconds_snapshot` (int4), `price_snapshot` (int4), `currency` (text, default `'VND'`), `status` (`trip_status`, default `'open'`).
* **Nhóm cột Phẳng (Code App đọc/ghi)**: `date` (date), `pickup_time` (text), `pickup_area` (text), `pickup_building` (text), `pickup_point` (text), `destination_university` (text), `destination_campus` (text), `destination_building` (text), `distance_km` (numeric), `suggested_price` (numeric), `available_seats` (int4, default `1`), `payment_method` (text, default `'CASH'`), `notes` (text).

### 2.2 Bảng `profiles` (22 cột)
* **Khóa chính**: `id` (uuid, FK $\rightarrow$ `auth.users(id)` ON DELETE CASCADE)
* **Cột chính**: `full_name` (text, NOT NULL), `student_id` (text), `email` (text), `phone` (text), `university` (text), `date_of_birth` (date), `avatar_url` (text).
* **Vai trò & Trạng thái**:
  * `role`: `user_role` enum (`'user'`, `'admin'`), default `'user'`.
  * `account_status`: `account_status` enum (`'active'`, `'suspended'`, `'banned'`, `'pending'`), default `'pending'`.
  * `verification_status`: `verification_status` enum (`'unverified'`, `'pending'`, `'verified'`, `'rejected'`, `'expired'`), default `'unverified'`.
* **Khu KTX**: `dorm_area` (text), `dorm_building` (text), `dorm_room` (text), `dorm_status` (text).
* **Thống kê**: `average_rating` (numeric 0-5, default `0`), `rating_count` (int4, default `0`), `completed_trip_count` (int4, default `0`), `cancelled_trip_count` (int4, default `0`).

### 2.3 Bảng `trip_requests` (9 cột)
* **Khóa chính**: `id` (uuid, default: `gen_random_uuid()`)
* **Khóa ngoại**: `trip_id` $\rightarrow$ `trips(id)` ON DELETE CASCADE, `passenger_id` $\rightarrow$ `profiles(id)`, `responded_by` $\rightarrow$ `profiles(id)`.
* **Trạng thái & Lời nhắn**: `message` (text), `status` (`trip_request_status` enum: `'pending'`, `'accepted'`, `'rejected'`, `'cancelled'`, `'expired'`), default `'pending'`. `responded_at` (timestamptz).

### 2.4 Bảng `messages` (5 cột)
* **Khóa chính**: `id` (uuid, default: `gen_random_uuid()`)
* **Khóa ngoại**: `trip_id` $\rightarrow$ `trips(id)` ON DELETE CASCADE, `sender_id` $\rightarrow$ `profiles(id)`.
* **Nội dung**: `content` (text, NOT NULL, Check: `trim(content) <> ''`), `created_at` (timestamptz, default `now()`).

### 2.5 Bảng `ratings` (8 cột)
* **Khóa chính**: `id` (uuid, default: `gen_random_uuid()`)
* **Khóa ngoại**: `trip_id` $\rightarrow$ `trips(id)` ON DELETE CASCADE, `from_user_id` $\rightarrow$ `profiles(id)`, `to_user_id` $\rightarrow$ `profiles(id)`.
* **Điểm & Ràng buộc**: `score` (int4, CHECK: `1 <= score <= 5`), `comment` (text), `available_at` (timestamptz).
* **Ràng buộc Unique**: UNIQUE (`trip_id`, `from_user_id`) — Mỗi người chỉ được đánh giá 1 lần per trip. CHECK: `from_user_id <> to_user_id` — Không tự đánh giá chính mình.

### 2.6 Bảng `vehicles` (15 cột)
* **Khóa chính**: `id` (uuid, default: `gen_random_uuid()`)
* **Khóa ngoại**: `owner_id` $\rightarrow$ `profiles(id)` ON DELETE CASCADE, `verified_by` $\rightarrow$ `profiles(id)`.
* **Thông tin xe**: `vehicle_type` (`vehicle_type` enum: `'motorbike'`, `'electric_motorbike'`, `'other'`), `brand` (text), `model` (text), `license_plate` (text, NOT NULL), `color` (text), `registration_document_url` (text).
* **Trạng thái**: `verification_status` (`verification_status` enum), `is_active` (boolean, default `true`).

### 2.7 Bảng `locations` & `routes`
* **`locations`**: `id`, `name`, `address`, `latitude`, `longitude`, `area_code`, `is_predefined`, `is_active`, `institution_type`, `campus_name`.
* **`routes`**: `id`, `start_location_id`, `destination_location_id`, `travel_mode` (`'motorcycle'`), `distance_meters`, `duration_seconds`, `status` (`'active'`). UNIQUE (`start_location_id`, `destination_location_id`, `travel_mode`).

---

## 3. Liệt kê toàn bộ Enum Types trên Live DB

| Enum Name | Các giá trị hợp lệ (Values & Casing) |
|---|---|
| `user_role` | `'user'`, `'admin'` |
| `verification_status` | `'unverified'`, `'pending'`, `'verified'`, `'rejected'`, `'expired'` |
| `account_status` | `'active'`, `'suspended'`, `'banned'`, `'pending'` |
| `trip_status` | `'open'`, `'full'`, `'expired'`, `'in_progress'`, `'completed'`, `'cancelled'` |
| `trip_request_status` | `'pending'`, `'accepted'`, `'rejected'`, `'cancelled'`, `'expired'` |
| `vehicle_type` | `'motorbike'`, `'electric_motorbike'`, `'other'` |
| `cancellation_reason` | `'no_passenger'`, `'driver_cancelled'`, `'passenger_cancelled'`, `'schedule_changed'`, `'vehicle_problem'`, `'weather'`, `'other'` |
| `document_type` | `'dorm_card'`, `'vehicle_registration'` |
| `report_status` | `'pending'`, `'reviewing'`, `'resolved'`, `'rejected'` |
| `return_request_status` | `'pending'`, `'accepted'`, `'rejected'`, `'cancelled'`, `'expired'` |
| `route_status` | `'active'`, `'inactive'` |
| `travel_mode` | `'motorcycle'` |

---

## 4. RLS Policies & Helper Functions trên DB

### 4.1 Hàm Helper tích hợp trong Postgres
* `is_admin()`: Kiểm tra `profiles.role = 'admin'` của user hiện tại (`auth.uid()`).
* `is_verified_user()`: Kiểm tra user hiện tại đã có `verification_status = 'verified'`.
* `can_rate_trip(trip_id)`: Kiểm tra xem user có quyền đánh giá chuyến đi hay không.

### 4.2 Tóm tắt RLS cho các thao tác chính
* **Tạo Chuyến (`trips` INSERT)**: Bắt buộc `driver_id = auth.uid() AND is_verified_user()`.
* **Gửi Yêu cầu (`trip_requests` INSERT)**: Bắt buộc `passenger_id = auth.uid() AND is_verified_user()`.
* **Chat (`messages` INSERT/SELECT)**: Chỉ tài xế, hành khách được `ACCEPTED`, hoặc Admin mới có quyền truy cập.
* **Đánh giá (`ratings` INSERT)**: Bắt buộc `from_user_id = auth.uid() AND can_rate_trip(trip_id)`.

---

## 5. Kết luận cho Lập trình viên (App Mapping Contract)

1. Khi gọi Supabase từ App: Dùng đúng tên cột `score` trong bảng `ratings` (không dùng `stars`).
2. Luồng đăng ký / upload thẻ KTX: Đổi mọi lệnh gọi bảng `users` thành bảng `profiles`.
3. Khi insert chuyến đi (`trips`): Có thể điền đồng thời nhóm cột normalized (`trip_date`, `departure_time`, `price_snapshot`,...) và nhóm cột phẳng mở rộng (`date`, `pickup_time`, `pickup_area`, `pickup_point`, `available_seats`,...) vì DB live **đã có sẵn cả 39 cột**.
