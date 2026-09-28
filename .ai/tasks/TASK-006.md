# TASK-006 — Security Authorization Hardening trên toàn bộ Server Actions (Trips & Chat) & Sửa Logic Tìm kiếm / Matching

- **TRẠNG THÁI:** ✅ `DONE` — Đã hoàn thành gia cố uỷ quyền Server Actions & hoàn thiện thuật toán tìm kiếm/matching (2026-09-26)
- **EPIC:** EPIC-01 (Security & Authorization) & EPIC-04 (Core Business Logic Correctness)
- **Mức ưu tiên:** 1 — Bảo vệ an toàn dữ liệu chuyến đi & nâng cao độ chính xác của thuật toán ghép xe
- **Mức rủi ro:** 🟡 Trung bình — Ảnh hưởng đến luồng Từ chối chuyến, Cập nhật trạng thái chuyến, Chat & Tìm kiếm chuyến đi
- **Người tạo:** Orchestrator / Antigravity AI — 2026-09-26
- **Người thực thi:** Antigravity (Execution Agent)
- **Người verify:** Product Owner / Verification Agent (theo `verification-protocol.md`)

---

## 1. TASK ID

`TASK-006`

## 2. TITLE

Bịt toàn bộ lỗ hổng uỷ quyền trong Server Actions (`rejectTripRequestAction`, `updateTripStatusAction`, `sendMessageAction`) và chuẩn hóa logic Tìm kiếm / Matching Chuyến đi.

## 3. OBJECTIVE

1. **Bảo mật & Uỷ quyền Server Actions (EPIC-01)**:
   - Gia cố `rejectTripRequestAction` (`trips/[id]/actions.ts`): Bắt buộc kiểm tra `user.id === trip.driver_id` để ngăn chặn người ngoài tự ý từ chối yêu cầu của chuyến xe người khác.
   - Gia cố `updateTripStatusAction` (`trips/[id]/chat/actions.ts`): Bắt buộc kiểm tra `user.id === trip.driver_id` để chỉ tài xế mới có quyền cập nhật trạng thái chuyến (COMPLETED, IN_PROGRESS, CANCELLED).
   - Gia cố `sendMessageAction` (`trips/[id]/chat/actions.ts`): Kiểm tra người gửi tin nhắn bắt buộc phải là tài xế (`isDriver`) hoặc hành khách đã được chấp nhận (`ACCEPTED` passenger).

2. **Sửa lỗi Nghiệp vụ Tìm kiếm & Thuật toán Ghép chuyến (EPIC-04)**:
   - Sửa Form tìm kiếm nhanh tại Trang chủ ([`src/app/page.tsx`](file:///d:/CNTT/KTX%20Carpooling/ktx-carpooling/src/app/page.tsx)): Đọc các tham số `university` & `date` từ URL searchParams trên trang [`src/app/(main)/trips/page.tsx`](file:///d:/CNTT/KTX%20Carpooling/ktx-carpooling/src/app/(main)/trips/page.tsx) để tự động lọc danh sách chuyến đi khi chuyển trang.
   - Chuẩn hóa bộ lọc Khu vực KTX (`dormArea`) trong `TripsSearchClient.tsx` đưa vào tiêu chí matching.
   - Sửa logic tính điểm `pickup_score` trong [`src/lib/matching.ts`](file:///d:/CNTT/KTX%20Carpooling/ktx-carpooling/src/lib/matching.ts) để điểm matching đạt tới 100/100 thay vì bị giới hạn ở 75/100.

## 4. SCOPE & PROPOSED CHANGES

### 4.1 Các file điều chỉnh

1. **[`src/app/(main)/trips/[id]/actions.ts`](file:///d:/CNTT/KTX%20Carpooling/ktx-carpooling/src/app/(main)/trips/[id]/actions.ts)**:
   - Thêm bước kiểm tra tài xế cho `rejectTripRequestAction`.
2. **[`src/app/(main)/trips/[id]/chat/actions.ts`](file:///d:/CNTT/KTX%20Carpooling/ktx-carpooling/src/app/(main)/trips/[id]/chat/actions.ts)**:
   - Thêm bước kiểm tra tài xế cho `updateTripStatusAction`.
   - Thêm bước kiểm tra tư cách thành viên cho `sendMessageAction`.
3. **[`src/app/(main)/trips/page.tsx`](file:///d:/CNTT/KTX%20Carpooling/ktx-carpooling/src/app/(main)/trips/page.tsx)**:
   - Đọc `searchParams` (`university`, `date`) và truyền làm filter ban đầu cho `TripsSearchClient`.
4. **[`src/lib/matching.ts`](file:///d:/CNTT/KTX%20Carpooling/ktx-carpooling/src/lib/matching.ts)**:
   - Đảm bảo `pickup_score` được tính toán chính xác dựa trên độ khớp điểm đón KTX.

## 5. ACCEPTANCE CRITERIA

| ID | Tiêu chí | Kết quả kiểm chứng |
|---|---|---|
| AC-01 | `rejectTripRequestAction` từ chối thao tác nếu người thực hiện không phải là tài xế chuyến đi | PASS |
| AC-02 | `updateTripStatusAction` từ chối thay đổi trạng thái nếu người thực hiện không phải là tài xế | PASS |
| AC-03 | `sendMessageAction` từ chối gửi tin nhắn nếu người dùng không phải thành viên (tài xế / khách đã duyệt) | PASS |
| AC-04 | Tìm kiếm nhanh từ Trang chủ (`/` ➔ `/trips?university=...&date=...`) tự động lọc đúng chuyến đi | PASS |
| AC-05 | Bộ lọc khu vực KTX hoạt động chính xác trong `TripsSearchClient` | PASS |
| AC-06 | Thuật toán `calculateMatchScore` tính toán đầy đủ điểm `pickup_score` (lên tới 100/100) | PASS |
| AC-07 | `npx tsc --noEmit` & `npm run build` PASS 100% | PASS |
