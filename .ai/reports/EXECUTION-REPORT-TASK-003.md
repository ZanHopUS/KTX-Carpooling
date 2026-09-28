# EXECUTION REPORT — TASK-003

- **Task ID**: `TASK-003`
- **Tiêu đề**: Thu thập bằng chứng schema/enum/RLS live còn thiếu & thiết lập baseline contract trong repo
- **Trạng thái**: ✅ `DONE`
- **Ngày hoàn thành**: 2026-09-22
- **Người thực thi**: PO (cung cấp bằng chứng SQL dump) + Antigravity (Tổng hợp & thiết lập Baseline Contract)

---

## 1. Tóm tắt kết quả thực hiện

TASK-003 đã thu thập đầy đủ 100% bằng chứng trực tiếp từ Supabase DEV SQL Editor và hoàn thành thiết lập **Baseline Contract** trong repository mà không cần thực hiện bất kỳ lệnh DDL/DML làm thay đổi DB và không làm thay đổi mã nguồn ứng dụng `src/`.

---

## 2. Kết quả thu thập bằng chứng DB (`ACTUAL`)

1. **Xác minh 18/18 bảng tồn tại (`ACTUAL`)**:
   `admin_actions`, `cancellations`, `contact_logs`, `document_verifications`, `locations`, `messages`, `notifications`, `pricing_rules`, `profiles`, `ratings`, `return_trip_requests`, `route_prices`, `routes`, `trip_reports`, `trip_requests`, `trips`, `vehicles`, `verified_student_records`.
2. **Nâng nhãn Schema 100% sang `ACTUAL`**:
   - `trips`: Có tổng cộng 39 cột (26 cột normalized + 13 cột mở rộng phẳng).
   - `profiles`: 22 cột (gồm `account_status`, `verification_status`, `role`).
   - `ratings`: 8 cột (tên cột điểm số chuẩn là **`score`**, có constraint `UNIQUE (trip_id, from_user_id)`).
   - `trip_requests`: 9 cột (`status` dùng `trip_request_status`).
   - `vehicles`: 15 cột (`vehicle_type`, `verification_status`).
3. **Xác minh Enum Values**: Toàn bộ 12 enum custom đều là **lowercase** (chữ thường).
4. **Xác minh RLS Security**: 100% 18 bảng đều đã được bật RLS (`relrowsecurity = true`) và có các policy tương ứng.
5. **Xác minh Helper Functions**: Đã xác nhận sự tồn tại của `is_admin()`, `is_verified_user()`, `can_rate_trip()`.

---

## 3. Các artifact đã tạo/cập nhật

1. [`docs/database/evidence-20260922.md`](file:///d:/CNTT/KTX%20Carpooling/ktx-carpooling/docs/database/evidence-20260922.md): Lưu trữ output thô từ SQL query do PO xuất.
2. [`docs/database/live-schema-baseline.md`](file:///d:/CNTT/KTX%20Carpooling/ktx-carpooling/docs/database/live-schema-baseline.md): File Baseline Contract chuẩn cho ứng dụng và các task phát triển tiếp theo.
3. [`.ai/database-context.md`](file:///d:/CNTT/KTX%20Carpooling/ktx-carpooling/.ai/database-context.md): Nâng toàn bộ nhãn `UNKNOWN` sang `ACTUAL`.
4. [`.ai/tasks/TASK-003.md`](file:///d:/CNTT/KTX%20Carpooling/ktx-carpooling/.ai/tasks/TASK-003.md): Cập nhật trạng thái `DONE`.

---

## 4. Handoff

- TASK-003 chính thức đạt trạng thái **✅ `DONE`**.
- Hệ thống đã sẵn sàng 100% để lập kế hoạch và triển khai **TASK-004** (Triển khai Boundary DTO Mapping cho `trips` để sửa dứt điểm lỗi Đăng chuyến đi).
