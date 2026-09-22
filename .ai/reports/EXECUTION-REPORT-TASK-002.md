# EXECUTION REPORT — TASK-002 (UPDATED AFTER VERIFIER REVIEW)

## 1. Trạng thái
✅ **DONE** (PO đã áp dụng migration và xác nhận các kiểm tra database/RLS runtime; Qoder đã hoàn tất independent verification)

## 2. Các finding đã xử lý theo yêu cầu Verifier
1. **Accepted-passenger RLS (Canonical Membership):**
   - Đã bổ sung kiểm tra trực tiếp trên cột chuẩn hóa `t.accepted_passenger_id = auth.uid()` của bảng `public.trips` (theo schema normalized 27 cột của DB live).
   - Đồng thời giữ nguyên điều kiện tương thích với `public.trip_requests` (`upper(r.status::text) = 'ACCEPTED'`) để hỗ trợ đầy đủ cả hai mô hình quan hệ thành viên chuyến.
2. **Admin INSERT Authorization:**
   - Đã bổ sung quyền INSERT cho Admin (`upper(p.role::text) = 'ADMIN'`) trong `messages_insert_policy` theo đúng acceptance criteria / approved role model.
   - Vẫn đảm bảo nguyên tắc an ninh nghiêm ngặt: bắt buộc `sender_id = auth.uid()` trong mọi trường hợp, ngăn chặn hoàn toàn việc giả mạo `sender_id`.

## 3. Commit mốc & Files changed thuộc TASK-002
- Commit mốc: `f2ac8ebafff70b5fd9a00770d2c26ed71031c665`
- Files thay đổi thuộc phạm vi TASK-002:
  - `supabase/migrations/20260921_create_messages.sql` (NEW — migration DDL + RLS hoàn chỉnh)
  - `supabase/schema.sql` (MODIFY — chú thích tài liệu bảng `messages` và các policy)
   - `.ai/tasks/TASK-002.md` (MODIFY — trạng thái `DONE`)
  - `.ai/reports/EXECUTION-REPORT-TASK-002.md` (MODIFY — cập nhật báo cáo thực thi)
- **Bảo toàn Working Tree:** Không có bất kỳ thay đổi nào ngoài scope của TASK-002 bị reset, revert, checkout hoặc xóa.

## 4. Chi tiết RLS Policies cập nhật
Đã bật RLS: `ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;`

1. **Policy Đọc (`messages_select_policy`):**
   - Scope: `TO authenticated`
   - Điều kiện `USING`:
     - Tài xế của chuyến (`t.driver_id = auth.uid()`), **HOẶC**
     - Hành khách được chấp nhận trên chuyến canonical (`t.accepted_passenger_id = auth.uid()`), **HOẶC**
     - Hành khách có yêu cầu `ACCEPTED` trong `trip_requests` (`r.passenger_id = auth.uid() AND upper(r.status::text) = 'ACCEPTED'`), **HOẶC**
     - Quản trị viên (`upper(p.role::text) = 'ADMIN'`).
2. **Policy Ghi (`messages_insert_policy`):**
   - Scope: `TO authenticated`
   - Điều kiện `WITH CHECK`:
     - Bắt buộc `sender_id = auth.uid()` (chống giả mạo `sender_id`), **VÀ**
     - Người gửi phải là:
       - Tài xế của chuyến (`t.driver_id = auth.uid()`), **HOẶC**
       - Hành khách được chấp nhận canonical (`t.accepted_passenger_id = auth.uid()`), **HOẶC**
       - Hành khách có yêu cầu `ACCEPTED` (`r.passenger_id = auth.uid() AND upper(r.status::text) = 'ACCEPTED'`), **HOẶC**
       - Quản trị viên (`upper(p.role::text) = 'ADMIN'`).
3. **Bất biến dữ liệu:**
   - Không cấu hình policy cho `UPDATE` và `DELETE` (tin nhắn không thể bị sửa/xóa bởi người dùng thông thường).
4. **Quyền truy cập:**
   - `GRANT SELECT, INSERT ON TABLE public.messages TO authenticated;` (Public/anon bị từ chối).

## 5. Tests / Checks đã chạy
1. **TypeScript Check:**
   ```bash
   npx tsc --noEmit
   # Exit code: 0 (Clean, không có lỗi type)
   ```
2. **Git Diff Check:**
   - `git diff supabase/`: Chỉ có thay đổi chú thích trong `supabase/schema.sql`.
   - File migration mới nằm đúng thư mục `supabase/migrations/20260921_create_messages.sql`.
   - Toàn bộ thay đổi của các task khác và file tài liệu trong working tree được bảo toàn 100%.

## 6. Security Verification Matrix

| Kịch bản kiểm tra | Kỳ vọng | Đánh giá Static Logic |
|---|---|---|
| **1. Anonymous / Public** | Bị từ chối hoàn toàn | **PASS** — Policy `TO authenticated`, anon không được cấp quyền |
| **2. User không liên quan** | Không thể đọc hoặc gửi tin nhắn | **PASS** — Không thỏa mãn driver, accepted passenger hay admin |
| **3. Driver hợp lệ** | Đọc và gửi được tin nhắn trong chuyến | **PASS** — Thỏa mãn `t.driver_id = auth.uid()` |
| **4. Accepted Passenger (Canonical)** | Đọc và gửi được tin nhắn | **PASS** — Thỏa mãn `t.accepted_passenger_id = auth.uid()` |
| **5. Accepted Passenger (trip_requests)** | Đọc và gửi được tin nhắn | **PASS** — Thỏa mãn `r.passenger_id = auth.uid() AND upper(r.status::text) = 'ACCEPTED'` |
| **6. Forged `sender_id`** | Bị từ chối khi insert | **PASS** — Bắt buộc `sender_id = auth.uid()` |
| **7. Admin** | Đọc và gửi được tin nhắn | **PASS** — Thỏa mãn `upper(p.role::text) = 'ADMIN'` kèm `sender_id = auth.uid()` |

## 7. Runtime Verification: VERIFIED
- PO xác nhận migration đã được áp dụng thành công qua Supabase SQL Editor.
- `public.messages` tồn tại; Supabase REST anon probe trả HTTP 200 với kết quả `[]`.
- Hai foreign key tồn tại: `messages.trip_id -> trips.id` và `messages.sender_id -> profiles.id`.
- RLS policies tồn tại: `messages_select_policy` và `messages_insert_policy`.
- Driver access: SUCCESS.
- Accepted passenger access: SUCCESS.
- Admin access: SUCCESS.
- Unrelated user denial: SUCCESS.
- Anonymous denial: SUCCESS.
- Forged `sender_id` denial: SUCCESS.

## 8. Independent verification
- `npx tsc --noEmit`: PASS.
- `npm run build`: PASS.
- `npm run lint`: FAIL với 8 lỗi và 12 cảnh báo pre-existing ngoài scope TASK-002; không có file source TASK-002 nào bị sửa để xử lý các lỗi này.
- Git working tree có các thay đổi tài liệu nền từ trước; implementation scope TASK-002 gồm migration và cập nhật chú thích `supabase/schema.sql`, cùng task/report metadata.

## 9. Handoff
- TASK-002 đã chuyển sang: **✅ `DONE`**.
