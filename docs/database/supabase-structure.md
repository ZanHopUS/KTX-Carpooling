# Cấu trúc Cơ sở Dữ liệu Supabase — KTX Carpooling

Tài liệu này mô tả cấu trúc dữ liệu dự kiến và thực tiễn của hệ thống KTX Carpooling. Dữ liệu này được tổng hợp từ code hiện có, tài liệu trong repo, và các file dữ liệu chuẩn hóa được bạn cung cấp (`CautrucSupabase.txt`, `danh_sach_locations.csv`, `danh_sach_routes.csv`).

> Lưu ý quan trọng: phần lớn schema hiện đang có tính chất “được dự kiến / được ghi trong tài liệu” hơn là “được xác minh trực tiếp trên live Supabase instance”. Vì vậy, dữ liệu trong file này cần được xem như nguồn tham chiếu chính cho AI agent và team phát triển, trước khi production cần xác minh lại trên DB thật.

---

## 1. Tổng quan hệ thống dữ liệu

Mô hình dữ liệu của KTX Carpooling được thiết kế theo hướng:

- người dùng có profile và xác minh sinh viên
- danh sách locations / routes được chuẩn hóa
- mỗi trip là một chuyến đi KTX → trường của tài xế
- trip_requests là yêu cầu đi cùng của hành khách
- ratings, notifications, reports và cancellations hỗ trợ vòng đời sau chuyến

---

## 2. Các bảng dữ liệu chính

### 2.1 `profiles`
Lưu thông tin tài khoản người dùng và bản đồ role / xác minh.

| Cột | Kiểu | Mô tả |
|---|---|---|
| `id` | `uuid` | PK, liên kết với auth.users.id |
| `full_name` | `text` | Họ tên sinh viên |
| `student_id` | `text` | MSSV, nullable |
| `email` | `text` | Email sinh viên |
| `phone` | `text` | SĐT, nullable |
| `university` | `text` | Trường học |
| `date_of_birth` | `date` | Ngày sinh, nullable |
| `avatar_url` | `text` | Ảnh đại diện, nullable |
| `role` | `user_role` | Vai trò người dùng |
| `account_status` | `account_status` | Trạng thái tài khoản |
| `verification_status` | `verification_status` | Trạng thái xác minh |
| `dorm_area` | `text` | Khu KTX |
| `dorm_building` | `text` | Tòa nhà KTX |
| `dorm_room` | `text` | Phòng, nullable |
| `dorm_status` | `text` | Tình trạng KTX, nullable |
| `messenger_user_id` | `text` | ID Messenger, nullable |
| `average_rating` | `numeric` | Điểm đánh giá trung bình |
| `rating_count` | `int4` | Số lượt đánh giá |
| `completed_trip_count` | `int4` | Số chuyến hoàn thành |
| `cancelled_trip_count` | `int4` | Số chuyến hủy |
| `created_at` | `timestamptz` | Thời gian tạo |
| `updated_at` | `timestamptz` | Thời gian cập nhật |

### 2.2 `verified_student_records`
Kho dữ liệu sinh viên dùng để đối chiếu, xác minh thẻ KTX hoặc danh tính sinh viên.

| Cột | Kiểu | Mô tả |
|---|---|---|
| `id` | `uuid` | PK |
| `full_name` | `text` | Họ tên |
| `date_of_birth` | `date` | Ngày sinh |
| `university` | `text` | Trường |
| `student_id` | `text` | MSSV |
| `dorm_area` | `text` | Khu KTX |
| `dorm_building` | `text` | Tòa nhà |
| `is_active` | `bool` | Có còn active không |
| `imported_by` | `uuid` | Người import |
| `created_at` | `timestamptz` | Thời gian import |
| `updated_at` | `timestamptz` | Cập nhật lần cuối |

### 2.3 `locations`
Danh sách địa điểm KTX và trường học được định nghĩa sẵn.

| Cột | Kiểu | Mô tả |
|---|---|---|
| `id` | `uuid` | PK |
| `name` | `text` | Tên điểm |
| `address` | `text` | Địa chỉ |
| `latitude` | `float8` | Vĩ độ |
| `longitude` | `float8` | Kinh độ |
| `area_code` | `text` | Mã khu vực |
| `is_predefined` | `bool` | Có được định nghĩa sẵn hay không |
| `is_active` | `bool` | Có dùng được không |
| `created_at` | `timestamptz` | Thời gian tạo |
| `updated_at` | `timestamptz` | Cập nhật |
| `institution_type` | `text` | Loại cơ sở: dormitory, academy, university... |
| `campus_name` | `text` | Cơ sở / campus |
| `source_url` | `text` | Link nguồn |
| `verification_status` | `text` | Trạng thái xác minh |
| `verified_at` | `timestamptz` | Thời gian verify |

### 2.4 `routes`
Tuyến đường giữa điểm xuất phát và điểm đến, dùng cho tính khoảng cách / route lookup / pricing.

| Cột | Kiểu | Mô tả |
|---|---|---|
| `id` | `uuid` | PK |
| `start_location_id` | `uuid` | Điểm bắt đầu |
| `destination_location_id` | `uuid` | Điểm đến |
| `travel_mode` | `travel_mode` | Phương tiện |
| `distance_meters` | `int4` | Quãng đường mét |
| `duration_seconds` | `int4` | Thời gian ước tính |
| `provider` | `text` | Nhà cung cấp dữ liệu |
| `provider_route_id` | `text` | ID route bên provider |
| `route_geometry` | `jsonb` | Geo JSON hoặc polyline |
| `status` | `route_status` | Trạng thái tuyến |
| `calculated_at` | `timestamptz` | Thời điểm tính |
| `created_at` | `timestamptz` | Thời gian tạo |
| `updated_at` | `timestamptz` | Cập nhật |
| `route_code` | `text` | Mã route |

### 2.5 `pricing_rules`
Quy tắc giá dùng cho định giá cơ bản.

| Cột | Kiểu | Mô tả |
|---|---|---|
| `id` | `uuid` | PK |
| `name` | `text` | Tên quy tắc |
| `base_fare` | `int4` | Phí cơ bản |
| `price_per_km` | `int4` | Đơn giá theo km |
| `minimum_fare` | `int4` | Giá tối thiểu |
| `maximum_fare` | `int4` | Giá tối đa, nullable |
| `rounding_unit` | `int4` | Đơn vị làm tròn |
| `effective_from` | `timestamptz` | Áp dụng từ |
| `effective_to` | `timestamptz` | Hết hiệu lực lúc |
| `is_active` | `bool` | Có hiệu lực |
| `created_at` | `timestamptz` | Thời gian tạo |
| `updated_at` | `timestamptz` | Cập nhật |
| `code` | `varchar` | Mã quy tắc |

### 2.6 `route_prices`
Giá cố định / gợi ý cho từng tuyến.

| Cột | Kiểu | Mô tả |
|---|---|---|
| `id` | `uuid` | PK |
| `route_id` | `uuid` | FK routes.id |
| `pricing_rule_id` | `uuid` | FK pricing_rules.id |
| `suggested_price` | `int4` | Giá đề xuất |
| `currency` | `text` | Đơn vị tiền tệ |
| `is_active` | `bool` | Có hiệu lực |
| `calculated_at` | `timestamptz` | Thời điểm tính |
| `created_at` | `timestamptz` | Thời gian tạo |
| `updated_at` | `timestamptz` | Cập nhật |

### 2.7 `vehicles`
Phương tiện của người dùng, phục vụ cho tài xế đăng chuyến.

| Cột | Kiểu | Mô tả |
|---|---|---|
| `id` | `uuid` | PK |
| `owner_id` | `uuid` | Người sở hữu |
| `vehicle_type` | `vehicle_type` | Loại xe |
| `brand` | `text` | Hãng xe |
| `model` | `text` | Dòng xe |
| `license_plate` | `text` | Biển số |
| `color` | `text` | Màu xe |
| `registration_document_url` | `text` | Đường dẫn giấy tờ |
| `verification_status` | `verification_status` | Trạng thái xác minh |
| `verification_note` | `text` | Ghi chú |
| `verified_by` | `uuid` | Admin xác minh |
| `verified_at` | `timestamptz` | Thời điểm xác minh |
| `is_active` | `bool` | Xe còn hoạt động |
| `created_at` | `timestamptz` | Tạo lúc |
| `updated_at` | `timestamptz` | Cập nhật |

### 2.8 `document_verifications`
Lưu hồ sơ OCR / document kiểm tra giấy tờ của người dùng hoặc xe.

| Cột | Kiểu | Mô tả |
|---|---|---|
| `id` | `uuid` | PK |
| `user_id` | `uuid` | Người liên quan |
| `vehicle_id` | `uuid` | Xe liên quan, nullable |
| `document_type` | `document_type` | Loại giấy tờ |
| `document_url` | `text` | File upload |
| `ocr_data` | `jsonb` | Dữ liệu OCR |
| `extracted_full_name` | `text` | Tên trích xuất |
| `extracted_date_of_birth` | `date` | Ngày sinh |
| `extracted_student_id` | `text` | MSSV |
| `extracted_university` | `text` | Trường |
| `extracted_license_plate` | `text` | Biển số |
| `extracted_vehicle_type` | `text` | Loại xe |
| `extracted_vehicle_color` | `text` | Màu xe |
| `matching_result` | `jsonb` | Kết quả đối chiếu |
| `status` | `verification_status` | Trạng thái |
| `rejection_reason` | `text` | Lý do từ chối |
| `reviewed_by` | `uuid` | Người review |
| `reviewed_at` | `timestamptz` | Review lúc |
| `created_at` | `timestamptz` | Tạo lúc |
| `updated_at` | `timestamptz` | Cập nhật |

### 2.9 `trips`
Chuyến đi đi từ KTX đến trường. Đây là bảng cốt lõi của hệ thống.

| Cột | Kiểu | Mô tả |
|---|---|---|
| `id` | `uuid` | PK |
| `driver_id` | `uuid` | Người tài xế |
| `vehicle_id` | `uuid` | Xe used |
| `route_id` | `uuid` | Route liên kết |
| `pickup_location_id` | `uuid` | Điểm đón |
| `trip_date` | `date` | Ngày đi |
| `departure_time` | `time` | Giờ khởi hành |
| `class_start_time` | `time` | Giờ bắt đầu học |
| `class_end_time` | `time` | Giờ kết thúc học |
| `distance_meters_snapshot` | `int4` | Distance snapshot |
| `duration_seconds_snapshot` | `int4` | Duration snapshot |
| `price_snapshot` | `int4` | Giá snapshot |
| `currency` | `text` | Đơn vị tiền |
| `note` | `text` | Ghi chú |
| `status` | `trip_status` | Trạng thái chuyến |
| `accepted_passenger_id` | `uuid` | Hành khách được chấp nhận |
| `accepted_request_id` | `uuid` | Request accepted |
| `cancelled_by` | `uuid` | Người hủy |
| `cancelled_at` | `timestamptz` | Hủy lúc |
| `cancellation_reason` | `cancellation_reason` | Lý do hủy |
| `cancellation_note` | `text` | Ghi chú hủy |
| `expired_at` | `timestamptz` | Hết hạn lúc |
| `started_at` | `timestamptz` | Bắt đầu lúc |
| `completed_at` | `timestamptz` | Hoàn tất lúc |
| `created_at` | `timestamptz` | Tạo lúc |
| `updated_at` | `timestamptz` | Cập nhật |
| `date` | `date` | Alias / legacy field |
| `pickup_time` | `text` | Giờ đón dạng text |
| `pickup_area` | `text` | Khu vực đón |
| `pickup_building` | `text` | Tòa nhà đón |
| `pickup_point` | `text` | Điểm hẹn |
| `destination_university` | `text` | Trường đến |
| `destination_campus` | `text` | Cơ sở đến |
| `destination_building` | `text` | Tòa nhà đến |
| `distance_km` | `numeric` | Khoảng cách km |
| `suggested_price` | `numeric` | Giá đề xuất |
| `available_seats` | `int4` | Số ghế trống |
| `payment_method` | `text` | Phương thức thanh toán |
| `notes` | `text` | Ghi chú thêm |

### 2.10 `trip_requests`
Các yêu cầu đến từ hành khách muốn đi cùng chuyến.

| Cột | Kiểu | Mô tả |
|---|---|---|
| `id` | `uuid` | PK |
| `trip_id` | `uuid` | Chuyến đi |
| `passenger_id` | `uuid` | Hành khách |
| `message` | `text` | Lời nhắn |
| `status` | `trip_request_status` | Trạng thái yêu cầu |
| `responded_at` | `timestamptz` | Reply lúc |
| `responded_by` | `uuid` | Người trả lời |
| `created_at` | `timestamptz` | Tạo lúc |
| `updated_at` | `timestamptz` | Cập nhật |

### 2.11 `cancellations`
Lưu lịch sử hủy chuyến hoặc hủy yêu cầu.

| Cột | Kiểu | Mô tả |
|---|---|---|
| `id` | `uuid` | PK |
| `trip_id` | `uuid` | Chuyến đi, nullable |
| `trip_request_id` | `uuid` | Yêu cầu, nullable |
| `cancelled_by` | `uuid` | Người hủy |
| `reason` | `cancellation_reason` | Lý do |
| `note` | `text` | Ghi chú |
| `created_at` | `timestamptz` | Tạo lúc |

### 2.12 `ratings`
Đánh giá sau khi hoàn tất chuyến đi.

| Cột | Kiểu | Mô tả |
|---|---|---|
| `id` | `uuid` | PK |
| `trip_id` | `uuid` | Chuyến đi |
| `from_user_id` | `uuid` | Người đánh giá |
| `to_user_id` | `uuid` | Người bị đánh giá |
| `score` | `int4` | Số sao |
| `comment` | `text` | Bình luận |
| `available_at` | `timestamptz` | Thời điểm có thể đánh giá |
| `created_at` | `timestamptz` | Tạo lúc |

### 2.13 `return_trip_requests`
Yêu cầu chuyến về được gửi qua Messenger sau khi chuyến đi chính kết thúc.

| Cột | Kiểu | Mô tả |
|---|---|---|
| `id` | `uuid` | PK |
| `original_trip_id` | `uuid` | Chuyến gốc |
| `passenger_id` | `uuid` | Hành khách |
| `driver_id` | `uuid` | Tài xế |
| `status` | `return_request_status` | Trạng thái |
| `requested_at` | `timestamptz` | Thời điểm yêu cầu |
| `responded_at` | `timestamptz` | Thời điểm phản hồi |
| `response_note` | `text` | Ghi chú phản hồi |
| `messenger_message_id` | `text` | ID Messenger |
| `created_at` | `timestamptz` | Tạo lúc |
| `updated_at` | `timestamptz` | Cập nhật |

### 2.14 `contact_logs`
Lưu lịch sử chia sẻ thông tin liên lạc giữa hai bên.

| Cột | Kiểu | Mô tả |
|---|---|---|
| `id` | `uuid` | PK |
| `trip_id` | `uuid` | Chuyến đi |
| `requester_id` | `uuid` | Người yêu cầu |
| `target_user_id` | `uuid` | Người được yêu cầu |
| `contact_type` | `text` | Loại thông tin liên lạc |
| `messenger_message_id` | `text` | ID Messenger |
| `created_at` | `timestamptz` | Tạo lúc |

### 2.15 `notifications`
Thông báo hệ thống cho người dùng.

| Cột | Kiểu | Mô tả |
|---|---|---|
| `id` | `uuid` | PK |
| `user_id` | `uuid` | Người nhận |
| `type` | `notification_type` | Loại thông báo |
| `title` | `text` | Tiêu đề |
| `content` | `text` | Nội dung |
| `related_trip_id` | `uuid` | Chuyến liên quan |
| `related_request_id` | `uuid` | Yêu cầu liên quan |
| `is_read` | `bool` | Đã đọc chưa |
| `sent_to_messenger` | `bool` | Có gửi qua Messenger |
| `messenger_message_id` | `text` | ID tin nhắn Messenger |
| `created_at` | `timestamptz` | Tạo lúc |

### 2.16 `trip_reports`
Lưu báo cáo / khiếu nại về chuyến đi hoặc người tham gia.

| Cột | Kiểu | Mô tả |
|---|---|---|
| `id` | `uuid` | PK |
| `trip_id` | `uuid` | Chuyến đi |
| `reporter_id` | `uuid` | Người báo cáo |
| `reported_user_id` | `uuid` | Người bị báo cáo |
| `reason` | `text` | Lý do |
| `description` | `text` | Mô tả |
| `status` | `report_status` | Trạng thái |
| `reviewed_by` | `uuid` | Admin xử lý |
| `reviewed_at` | `timestamptz` | Xử lý lúc |
| `resolution_note` | `text` | Ghi chú quyết định |
| `created_at` | `timestamptz` | Tạo lúc |

### 2.17 `admin_actions`
Lưu lịch sử thao tác quản trị.

| Cột | Kiểu | Mô tả |
|---|---|---|
| `id` | `uuid` | PK |
| `admin_id` | `uuid` | Admin thực hiện |
| `action_type` | `text` | Loại hành động |
| `target_table` | `text` | Bảng đích |
| `target_id` | `uuid` | ID đối tượng |
| `old_data` | `jsonb` | Dữ liệu cũ |
| `new_data` | `jsonb` | Dữ liệu mới |
| `note` | `text` | Ghi chú |
| `created_at` | `timestamptz` | Tạo lúc |

---

## 3. Các enum / custom type

### 3.1 `user_role`
- `user`
- `admin`

Mặc dù code hiện tại trong app dùng kiểu `DRIVER`, `PASSENGER`, `BOTH`, `ADMIN`, đây là một điểm cần kiểm tra lại khi tích hợp DB thật, vì enum trong tài liệu và enum trong code có thể chưa đồng bộ.

### 3.2 `account_status`
- `active`
- `suspended`
- `banned`
- `pending`

### 3.3 `verification_status`
- `unverified`
- `pending`
- `verified`
- `rejected`
- `expired`

### 3.4 `location_type`
- `dormitory`
- `university`

### 3.5 `travel_mode`
- `motorcycle`

### 3.6 `route_status`
- `active`
- `inactive`

### 3.7 `vehicle_type`
- `motorbike`
- `electric_motorbike`
- `other`

### 3.8 `document_type`
- `dorm_card`
- `vehicle_registration`

### 3.9 `trip_status`
- `open`
- `full`
- `expired`
- `in_progress`
- `completed`
- `cancelled`

### 3.10 `trip_request_status`
- `pending`
- `accepted`
- `rejected`
- `cancelled`
- `expired`

### 3.11 `cancellation_reason`
- `no_passenger`
- `driver_cancelled`
- `passenger_cancelled`
- `schedule_changed`
- `vehicle_problem`
- `weather`
- `other`

### 3.12 `return_request_status`
- `pending`
- `accepted`
- `rejected`
- `cancelled`
- `expired`

### 3.13 `report_status`
- `pending`
- `reviewing`
- `resolved`
- `rejected`

### 3.14 `notification_type`
- `trip_created`
- `trip_request_received`
- `trip_request_accepted`
- `trip_request_rejected`
- `trip_cancelled`
- `trip_expired`
- `trip_starting`
- `late_reminder`
- `return_trip_request`
- `return_trip_accepted`
- `return_trip_rejected`
- `rating_available`
- `verification_result`
- `phone_shared`
- `system`

---

## 4. Quan hệ dữ liệu quan trọng

### 4.1 Profile → Trips
- Một user có thể là driver của nhiều trip
- Một user có thể là passenger trong nhiều trip requests

### 4.2 Trips → Trip requests
- Một trip có nhiều request
- Một request thuộc về một trip

### 4.3 Trip → Messages
- Một trip có nhiều tin nhắn trong room chat

### 4.4 Trips → Ratings
- Một trip có thể có nhiều đánh giá từ hai bên (mỗi người có thể đánh người còn lại)

### 4.5 Locations → Routes
- Một location xuất phát có nhiều route đi đến khác
- Một route chỉ liên kết 2 location chính

### 4.6 Vehicles → Trips
- Một phương tiện có thể được dùng cho nhiều trip

---

## 5. RLS và bảo mật

Mô hình dữ liệu ý định là có các chính sách bảo mật theo role:

- `profiles`: người dùng chỉ được chỉnh sửa chính profile của mình
- `trips`: chỉ tài xế sở hữu mới được sửa; hành khách chỉ có quyền gửi yêu cầu
- `trip_requests`: chỉ người gửi / người nhận / admin mới xem được
- `messages`: chỉ thành viên trong trip mới đọc và gửi
- `trip_reports`: chỉ người liên quan và admin mới xử lý

> Mức độ thực thi RLS cần được xác minh trực tiếp trên Supabase live instance. Tài liệu này mô tả quy tắc hợp lý và mong muốn, không phải bằng chứng live DB.

---

## 6. Mismatches và điểm cần xác minh

Các điểm có độ không chắc chắn cao cần kiểm tra trước khi production:

1. `date` vs `trip_date`
2. `status` vs `account_status`
3. `user_role` enum trong code và trong schema
4. `trip_status` chữ hoa trong app vs chữ thường trong schema document
5. `profiles` vs `users` table trong API verification route
6. `ADMIN` role creation method
7. `migrations/` folder thực sự trống hay chưa ứng dụng

---

## 7. Dữ liệu chuẩn hóa từ CSV

### 7.1 Locations source
Danh sách `danh_sach_locations.csv` chứa các bản ghi điểm đi/đến chính, ví dụ:
- KTX Khu A
- KTX Khu B
- HCMUS, HCMUT, UIT, USSH, IU, UEL
- nhiều trường và cơ sở lân cận

Các trường quan trọng của CSV:
- `name`
- `institution_type`
- `campus_name`
- `address`
- `latitude`
- `longitude`
- `area_code`
- `is_predefined`
- `is_active`
- `source_url`
- `verification_status`

### 7.2 Routes source
Danh sách `danh_sach_routes.csv` cung cấp chứng cứ về tuyến đường KTX → trường với thuộc tính:
- `route_code`
- `start_area_code`
- `destination_area_code`
- `travel_mode`
- `distance_meters`
- `duration_seconds`
- `provider`
- `status`

Ví dụ route mẫu:
- `KTXA_HCM_HCMUS_CS2`
- `KTXA_HCM_UIT`
- `KTXB_HCM_UEL`
- `KTXA_BD_TDMU`
- `KTXB_BD_VGU`

---

## 8. Kết luận

Schema dự kiến của KTX Carpooling rất phù hợp với mô hình ứng dụng hiện tại: người dùng, xác minh sinh viên, trip, trip request, rating, báo cáo, thông báo và route. Nếu được đồng bộ hóa với Supabase thật, nó sẽ là nền tảng đủ mạnh để hỗ trợ cả MVP và mở rộng sau này.

Điểm cần chú ý lớn nhất là bộ dữ liệu này nên được xem như một tài liệu domain + schema phong phú, chứ không phải schema live đã được xác minh. Trước khi deploy hoặc cập nhật production, cần thực hiện kiểm tra lại toàn bộ bảng trên Supabase và đồng bộ enum / tên cột / migration với code.
