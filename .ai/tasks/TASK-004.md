# TASK-004 — Triển khai Boundary DTO Mapper cho trips (Sửa lỗi Đăng chuyến đi & Đồng bộ Read/Write Path)

- **TRẠNG THÁI:** ✅ `DONE` — Đã triển khai xong tripMapper.ts, sửa createTripAction & read path tại /trips, /trips/[id] (2026-09-22)
- **EPIC:** EPIC-03 — Data Integrity & Code ↔ DB Alignment

- **Mức ưu tiên:** 1 trong EPIC-03 — sửa lỗi BLOCKER không thể tạo chuyến đi của toàn bộ hệ thống
- **Mức rủi ro:** 🟡 Trung bình — Thay đổi tầng Data Access/Mapper của `trips`, không thay đổi cấu trúc DB
- **Người tạo:** Orchestrator — 2026-09-22 (theo quyết định D-03-01 trong `EPIC-03-PO-DECISION-PACK.md` §10)
- **Người thực thi:** Antigravity (Execution Agent)
- **Người verify:** Verification Agent / PO (theo `verification-protocol.md`)

---

## 1. TASK ID

`TASK-004`

## 2. TITLE

Triển khai Boundary DTO Mapper cho bảng `trips` (sửa lỗi Đăng chuyến đi, map enum lowercase, tự động điền các cột NOT NULL normalized).

## 3. OBJECTIVE

Giải quyết dứt điểm lỗi **"Đăng chuyến đi" (Create Trip)** bị hỏng ở tất cả người dùng hiện tại do xung đột giữa mã nguồn (mô hình phẳng 17 cột) và Database DEV live (mô hình normalized 27 cột + 13 cột phẳng mở rộng, enum lowercase, NOT NULL constraints trên `vehicle_id`, `route_id`, `pickup_location_id`, `trip_date`, `departure_time`,...).

Nhiệm vụ này sẽ:
1. Tạo module Mapper [`src/lib/mappers/tripMapper.ts`](file:///d:/CNTT/KTX%20Carpooling/ktx-carpooling/src/lib/mappers/tripMapper.ts) làm ranh giới chuyển đổi 2 chiều giữa DTO phẳng của App UI $\leftrightarrow$ Row dữ liệu DB.
2. Tự động xử lý fallback / lookup cho các ràng buộc NOT NULL normalized (`vehicle_id`, `route_id`, `pickup_location_id`, `trip_date`, `departure_time`, `price_snapshot`,...) khi tạo chuyến đi từ form UI.
3. Chuẩn hoá enum `status` từ `'OPEN'` (chữ HOA) sang `'open'` (chữ thường) để khớp với enum type `trip_status` trên Postgres.
4. Cập nhật `createTripAction` và các trang đọc dữ liệu chuyến đi (`/trips`, `/trips/[id]`, `/dashboard`, `/requests`) qua tầng Mapper.

## 4. BACKGROUND & SOURCE OF TRUTH

- **Quyết định D-03-01**: PO chốt áp dụng Boundary DTO Mapping. UI tiếp tục dùng DTO phẳng mong muốn, tầng Mapper tự động chuyển đổi sang/từ schema persistence DB live mà không sửa đổi DB.
- **Baseline Contract**: [`docs/database/live-schema-baseline.md`](file:///d:/CNTT/KTX%20Carpooling/ktx-carpooling/docs/database/live-schema-baseline.md) (§2.1 `trips` 39 cột, §3 Enum values lowercase).

## 5. SCOPE & PROPOSED CHANGES

### 5.1 Các file tạo mới / chỉnh sửa
1. **[NEW] [`src/lib/mappers/tripMapper.ts`](file:///d:/CNTT/KTX%20Carpooling/ktx-carpooling/src/lib/mappers/tripMapper.ts)**:
   - `toDbTripInsertPayload(...)`: Map DTO phẳng $\rightarrow$ Payload ghi DB (điền đồng thời cột phẳng & cột normalized, chuẩn hoá enum lowercase, đảm bảo FK hợp lệ).
   - `toAppTripDTO(...)`: Map Persistence Row DB $\rightarrow$ DTO phẳng cho UI render.
   - `ensureDriverDependencies(...)`: Tự động tìm hoặc tạo vehicle/location/route mặc định cho driver nếu chưa truyền ID để thoả mãn FK NOT NULL.
2. **[MODIFY] [`src/app/(main)/trips/actions.ts`](file:///d:/CNTT/KTX%20Carpooling/ktx-carpooling/src/app/%28main%29/trips/actions.ts)**:
   - Cập nhật `createTripAction` sử dụng `toDbTripInsertPayload` thay vì insert phẳng trực tiếp.
3. **[MODIFY] các trang đọc chuyến đi**:
   - `src/app/(main)/trips/page.tsx` & `TripsSearchClient.tsx`
   - `src/app/(main)/trips/[id]/page.tsx`
   - `src/app/(main)/dashboard/page.tsx`
   - `src/app/(main)/requests/page.tsx`

## 6. ACCEPTANCE CRITERIA

| ID | Tiêu chí | Cách kiểm chứng |
|---|---|---|
| AC-01 | Đăng chuyến đi mới thành công qua form UI mà không gặp lỗi 22P02 (enum) hay NOT NULL constraint | Runtime verification test |
| AC-02 | Dữ liệu chuyến đi được lưu đầy đủ ở cả nhóm cột normalized và nhóm cột phẳng mở rộng trong DB | Inspect DB row |
| AC-03 | Danh sách chuyến đi trên `/trips` và `/dashboard` hiển thị chính xác các thông tin chuyến đi vừa tạo | UI verification |
| AC-04 | Trang chi tiết chuyến đi `/trips/[id]` hiển thị đúng thông tin tài xế và chuyến đi | UI verification |
| AC-05 | `npm run build` & `npx tsc --noEmit` PASS không có lỗi type | Terminal test |
