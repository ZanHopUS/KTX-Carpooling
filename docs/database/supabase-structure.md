# Cấu trúc Cơ sở Dữ liệu Supabase — KTX Carpooling

Tài liệu chi tiết về thiết kế Schema, các Bảng, Trạng thái (Enums), Hàm RLS Policies và Triggers trong cơ sở dữ liệu Supabase PostgreSQL.

---

## 1. Danh sách các Bảng Dữ liệu (Tables)

### 1.1 Bảng `profiles`
Lưu thông tin cá nhân và vai trò người dùng (kết nối trực tiếp với `auth.users.id`).

| Cột | Kiểu Dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | `uuid` | PK, FK -> auth.users.id | Mã tài khoản |
| `full_name` | `text` | NOT NULL | Họ và tên sinh viên |
| `student_id` | `text` | Nullable | Mã số sinh viên (MSSV) |
| `email` | `text` | NOT NULL | Email sinh viên |
| `phone` | `text` | Nullable | Số điện thoại liên hệ |
| `university` | `text` | NOT NULL | Trường ĐH (HCMUS, HCMUT, UIT...) |
| `role` | `user_role` | Default 'BOTH' | Vai trò (`DRIVER`, `PASSENGER`, `BOTH`, `ADMIN`) |
| `account_status` | `account_status` | Default 'ACTIVE' | Trạng thái tài khoản (`ACTIVE`, `BLOCKED`) |
| `dorm_card_verified` | `verification_status`| Default 'PENDING' | Trạng thái duyệt thẻ KTX (`PENDING`, `VERIFIED`, `REJECTED`) |
| `dorm_area` | `text` | Nullable | Khu KTX (`KHU_A`, `KHU_B`) |
| `dorm_building` | `text` | Nullable | Tòa nhà KTX (B2, A1, C3...) |
| `dorm_card_url` | `text` | Nullable | Đường dẫn ảnh thẻ KTX trong Storage |
| `verification_note` | `text` | Nullable | Ghi chú lý do từ chối (Admin) |
| `rating` | `numeric` | Default 5.0 | Điểm đánh giá trung bình |
| `completed_trip_count`| `int4` | Default 0 | Số chuyến đi đã hoàn thành |
| `created_at` | `timestamptz` | Default now() | Thời gian tạo |

---

### 1.2 Bảng `trips`
Lưu danh sách chuyến đi xe máy do tài xế đăng.

| Cột | Kiểu Dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | `uuid` | PK | Mã chuyến đi |
| `driver_id` | `uuid` | FK -> profiles.id | Tài xế đăng chuyến |
| `trip_date` | `date` | NOT NULL | Ngày di chuyển (YYYY-MM-DD) |
| `pickup_time` | `time` | NOT NULL | Giờ đón sinh viên (HH:mm) |
| `pickup_area` | `text` | NOT NULL | Khu vực KTX (`KHU_A`, `KHU_B`) |
| `pickup_building` | `text` | NOT NULL | Tòa nhà đón (VD: B2) |
| `pickup_point` | `text` | NOT NULL | Điểm hẹn chi tiết (VD: Trước sảnh B2) |
| `destination_university` | `text` | NOT NULL | Trường đến (VD: HCMUS) |
| `destination_campus` | `text` | Nullable | Cơ sở đến (VD: CS2 Thủ Đức) |
| `available_seats` | `int4` | Default 1 | Số chỗ trống khả dụng |
| `distance_km` | `numeric` | NOT NULL | Khoảng cách tính bằng km (OSRM) |
| `suggested_price` | `int4` | NOT NULL | Chi phí gợi ý đóng góp (VNĐ) |
| `payment_method` | `payment_method` | Default 'CASH' | Phương thức thanh toán (`CASH`, `BANK_TRANSFER`) |
| `status` | `trip_status` | Default 'OPEN' | Trạng thái chuyến đi (`OPEN`, `ACCEPTED`, `COMPLETED`...) |
| `notes` | `text` | Nullable | Ghi chú thêm của tài xế |
| `created_at` | `timestamptz` | Default now() | Thời điểm tạo |

---

### 1.3 Bảng `trip_requests`
Lưu các yêu cầu đặt chuyến của hành khách gửi tới chuyến đi.

| Cột | Kiểu Dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | `uuid` | PK | Mã yêu cầu |
| `trip_id` | `uuid` | FK -> trips.id | Chuyến đi tương ứng |
| `passenger_id` | `uuid` | FK -> profiles.id | Hành khách gửi yêu cầu |
| `requested_pickup_time`| `time` | Nullable | Giờ đón đề xuất của hành khách |
| `match_score` | `int4` | Default 0 | Điểm khớp Match Score (%) |
| `message` | `text` | Nullable | Lời nhắn gửi tài xế |
| `status` | `trip_request_status`| Default 'PENDING' | Trạng thái (`PENDING`, `ACCEPTED`, `REJECTED`, `CANCELLED`) |
| `created_at` | `timestamptz` | Default now() | Thời gian gửi |

---

### 1.4 Bảng `messages`
Lưu tin nhắn thời gian thực trong phòng chat riêng của chuyến đi.

| Cột | Kiểu Dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | `uuid` | PK | Mã tin nhắn |
| `trip_id` | `uuid` | FK -> trips.id | Phòng chat của chuyến đi |
| `sender_id` | `uuid` | FK -> profiles.id | Người gửi |
| `content` | `text` | NOT NULL | Nội dung tin nhắn |
| `created_at` | `timestamptz` | Default now() | Thời gian gửi |

---

## 2. Danh sách Kiểu Dữ liệu Tùy chỉnh (Custom Enums)
- **`user_role`**: `'DRIVER'`, `'PASSENGER'`, `'BOTH'`, `'ADMIN'`
- **`verification_status`**: `'PENDING'`, `'VERIFIED'`, `'REJECTED'`, `'NEED_REVIEW'`
- **`trip_status`**: `'OPEN'`, `'REQUESTED'`, `'ACCEPTED'`, `'IN_PROGRESS'`, `'COMPLETED'`, `'CANCELLED'`, `'EXPIRED'`, `'REPORTED'`
- **`trip_request_status`**: `'PENDING'`, `'ACCEPTED'`, `'REJECTED'`, `'CANCELLED'`
- **`payment_method`**: `'CASH'`, `'BANK_TRANSFER'`

---

## 3. Chính sách Bảo mật Row Level Security (RLS)

### Bảng `profiles`
- **SELECT**: Người dùng được xem thông tin công khai của các profile khác (đã xác minh hoặc ACTIVE).
- **UPDATE**: Chỉ người dùng hiện tại mới được sửa thông tin profile của chính họ (`auth.uid() = id`).

### Bảng `trips`
- **SELECT**: Cho phép mọi tài khoản đã xác thực xem danh sách các chuyến đi công khai (`status <> 'CANCELLED'`).
- **INSERT**: Chỉ người dùng có vai trò Tài xế đã được xác minh mới được đăng chuyến đi.
- **UPDATE / DELETE**: Chỉ chính Tài xế đăng chuyến đó hoặc Admin mới có quyền cập nhật/xóa.

### Bảng `trip_requests`
- **SELECT**: Chỉ Hành khách gửi yêu cầu, Tài xế của chuyến đi đó, hoặc Admin mới có quyền xem.
- **UPDATE**: Hành khách (để hủy) hoặc Tài xế (để chấp nhận/từ chối) mới có quyền cập nhật.
