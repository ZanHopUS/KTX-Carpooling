-- KTX Carpooling — schema sau khi căn với project Supabase đang chạy.
-- Project thật: chạy file migrations/20260916_align_ktx_schema.sql trong SQL Editor.
-- File này chỉ là tài liệu (không chạy đè lên DB đã có bảng).

-- profiles.id = auth.users.id
-- trips.driver_id → profiles.id
-- trip_requests.trip_id → trips.id | passenger_id → profiles.id

-- profiles
--   university          -- trường (HCMUS, UIT, …) — nguồn sự thật
--   school              -- cột cũ, đồng bộ từ university
--   dorm_card_verified  -- PENDING | VERIFIED | REJECTED | NEED_REVIEW
--   verification_status -- cột cũ, không dùng khi code
--   role                -- passenger | driver | both | admin
--   verification_note   -- lý do từ chối (admin)

-- trips
--   trip_date, pickup_time
--   pickup_area, pickup_building, pickup_point
--   destination_university, destination_campus, destination_building
--   distance_km, suggested_price, payment_method (CASH | BANK_TRANSFER)
--   available_seats, status (OPEN | REQUESTED | ACCEPTED | …)
--   start_location, destination, vehicle_type, notes — cột cũ / phụ

-- trip_requests
--   requested_pickup_time, match_score, message, status

-- messages (tạo bởi migration 20260921_create_messages.sql)
--   id (uuid, PK), trip_id (FK -> trips.id ON DELETE CASCADE), sender_id (FK -> profiles.id)
--   content (text, check non-empty), created_at (timestamptz)
--   Index: (trip_id, created_at ASC)
--   RLS:
--     - SELECT: tài xế | hành khách ACCEPTED (canonical trips.accepted_passenger_id HOẶC trip_requests) | admin
--     - INSERT: sender_id = auth.uid() AND (tài xế | hành khách ACCEPTED | admin)
--     - UPDATE / DELETE: không cấp quyền (tin nhắn bất biến)

-- RPC: accept_trip_request(uuid)
-- Helpers: is_admin(), is_verified_user()
