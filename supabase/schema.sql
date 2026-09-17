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

-- RPC: accept_trip_request(uuid)
-- Helpers: is_admin(), is_verified_user()
