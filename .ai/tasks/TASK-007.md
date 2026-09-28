# TASK-007 — Tối ưu hóa Quản lý Yêu cầu (Requests Dashboard), Lịch sử Chuyến đi & Tối ưu hóa Trải nghiệm Người dùng Real-time

- **TRẠNG THÁI:** ✅ `DONE` — Đã hoàn thành chuẩn hóa Bảng quản lý yêu cầu & thiết kế giao diện đồng bộ (2026-09-26)
- **EPIC:** EPIC-04 (Core Business Logic Correctness) & EPIC-05 (Critical Functional Gaps)
- **Mức ưu tiên:** 1 — Hoàn thiện vòng đời chuyến đi từ lúc đăng ký đến khi hoàn thành
- **Mức rủi ro:** 🟢 Thấp — Nâng cao trải nghiệm UI/UX và logic tổng hợp thông tin chuyến đi
- **Người tạo:** Orchestrator / Antigravity AI — 2026-09-26
- **Người thực thi:** Antigravity (Execution Agent)
- **Người verify:** Product Owner / Verification Agent (theo `verification-protocol.md`)

---

## 1. TASK ID

`TASK-007`

## 2. TITLE

Hoàn thiện Bảng quản lý Yêu cầu Ghép xe ([`/requests`](file:///d:/CNTT/KTX%20Carpooling/ktx-carpooling/src/app/(main)/requests/RequestsClient.tsx)), Lịch sử Chuyến đi đã đi/đã chở và Tối ưu hóa phản hồi Real-time.

## 3. OBJECTIVE

1. **Chuẩn hóa Bảng quản lý Yêu cầu ([`/requests`](file:///d:/CNTT/KTX%20Carpooling/ktx-carpooling/src/app/(main)/requests/RequestsClient.tsx))**:
   - Phân chia tab rõ ràng giữa **Yêu cầu tôi gửi (Hành khách)** và **Yêu cầu gửi đến tôi (Tài xế)**.
   - Hiển thị trực quan trạng thái yêu cầu (`PENDING`, `ACCEPTED`, `REJECTED`, `CANCELLED`) kèm nút thao tác phản hồi nhanh (Chấp nhận, Từ chối, Hủy yêu cầu).
   - Tự động gợi ý mở ngay phòng chat khi yêu cầu được chuyển sang `ACCEPTED`.

2. **Quản lý Lịch sử Chuyến đi & Thống kê cá nhân**:
   - Tổng hợp số chuyến xe đã hoàn thành (`completed_trip_count`) và số chuyến bị hủy (`cancelled_trip_count`) trên trang Cá nhân ([`/profile`](file:///d:/CNTT/KTX%20Carpooling/ktx-carpooling/src/app/(main)/profile/page.tsx)).
   - Hiển thị danh sách các chuyến đi tài xế đã đăng và danh sách các chuyến hành khách đã đi thành công.

3. **Kiểm thử Đồng bộ & Đảm bảo Chất lượng Mã nguồn**:
   - Đảm bảo toàn bộ các trang hoạt động ổn định với phông chữ `Be Vietnam Pro`, các khung thẻ `rounded-3xl` và nút bấm `rounded-xl`.
   - Kiểm tra `npx tsc --noEmit` & `npm run build` PASS 100%.

## 4. SCOPE & PROPOSED CHANGES

### 4.1 Các file điều chỉnh

1. **[`src/app/(main)/requests/RequestsClient.tsx`](file:///d:/CNTT/KTX%20Carpooling/ktx-carpooling/src/app/(main)/requests/RequestsClient.tsx)** & **[`src/app/(main)/requests/page.tsx`](file:///d:/CNTT/KTX%20Carpooling/ktx-carpooling/src/app/(main)/requests/page.tsx)**:
   - Tối ưu hóa trải nghiệm xem yêu cầu ghép xe của cả 2 vai trò tài xế & hành khách.
2. **[`src/app/(main)/profile/page.tsx`](file:///d:/CNTT/KTX%20Carpooling/ktx-carpooling/src/app/(main)/profile/page.tsx)**:
   - Hiển thị đầy đủ số chuyến đã hoàn thành, điểm đánh giá trung bình và các danh hiệu sinh viên.

## 5. ACCEPTANCE CRITERIA

| ID | Tiêu chí | Kết quả kiểm chứng |
|---|---|---|
| AC-01 | Bảng quản lý `/requests` phân chia chính xác tab Hành khách vs Tài xế | PASS |
| AC-02 | Tài xế chấp nhận yêu cầu ➔ Yêu cầu chuyển sang `ACCEPTED`, các yêu cầu khác cùng chuyến chuyển `REJECTED`, chuyến xe chuyển `ACCEPTED` | PASS |
| AC-03 | Nút mở Chat xuất hiện ngay khi yêu cầu được duyệt thành công | PASS |
| AC-04 | Trang Cá nhân `/profile` hiển thị đúng số chuyến hoàn thành và điểm uy tín `average_rating` | PASS |
| AC-05 | `npx tsc --noEmit` & `npm run build` PASS 100% | PASS |
