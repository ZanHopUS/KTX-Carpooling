# TASK-005 — Chuẩn hóa Vai trò Người dùng (Platform Role vs Capability) & Cưỡng chế Xác minh Thẻ KTX (Verification Enforcement)

- **TRẠNG THÁI:** ✅ `DONE` — Đã tách platform role (USER/ADMIN), cưỡng chế xác minh thẻ KTX cho Core Carpool Actions & đồng bộ luồng upload/admin (2026-09-26)
- **EPIC:** EPIC-03 (Data Integrity) & EPIC-04 (Core Business Logic Correctness)
- **Mức ưu tiên:** 1 trong EPIC-04 — Đảm bảo an toàn danh tính sinh viên & tính đúng đắn của vai trò hệ thống
- **Mức rủi ro:** 🟡 Trung bình — Ảnh hưởng đến luồng Đăng ký, Tạo chuyến đi & Đăng ký ghép xe
- **Người tạo:** Orchestrator / Antigravity AI — 2026-09-26 (theo quyết định D-03-05 & D-03-07 trong `EPIC-03-PO-DECISION-PACK.md`)
- **Người thực thi:** Antigravity (Execution Agent)
- **Người verify:** Product Owner / Verification Agent (theo `verification-protocol.md`)

---

## 1. TASK ID

`TASK-005`

## 2. TITLE

Chuẩn hóa Platform Role (`USER`/`ADMIN`), phân tách Driver/Passenger Capability & Cưỡng chế Ràng buộc Xác minh Thẻ KTX cho các thao tác Carpooling cốt lõi.

## 3. OBJECTIVE

1. **Phân tách Platform Role & Capability (D-03-05)**:
   - Đảm bảo cột `profiles.role` chỉ chứa vai trò nền tảng (`USER` hoặc `ADMIN`).
   - Không ghi các giá trị capability như `DRIVER`, `PASSENGER`, `BOTH` trực tiếp vào cột `role` làm sai lệch phân quyền hệ thống.
   - Chuẩn hóa luồng `registerAction` để tài khoản mới luôn được khởi tạo với vai trò nền tảng `USER`.

2. **Cưỡng chế Xác minh Thẻ KTX cho Core Carpool Actions (D-03-07)**:
   - Cưỡng chế kiểm tra trạng thái xác minh thẻ KTX (`dorm_card_verified === 'VERIFIED'`) đối với tài khoản trước khi thực hiện các thao tác carpooling cốt lõi:
     - **Đăng chuyến đi mới** (`createTripAction`).
     - **Gửi yêu cầu ghép chuyến** (`createTripRequestAction`).
   - Đảm bảo sinh viên chưa được duyệt thẻ KTX nhận được thông báo yêu cầu xác minh rõ ràng và hướng dẫn đến trang `/profile/verify`.

3. **Đồng bộ hóa Luồng Xác minh & Bảo vệ Admin Route**:
   - Đồng bộ luồng upload thẻ KTX (`uploadDormCardAction` và `api/verifications`) cập nhật chính xác bảng `profiles` (thay vì bảng `users` không tồn tại).
   - Bảo vệ tuyệt đối các trang quản trị `/admin`, `/admin/verifications` và các server action duyệt/từ chối chỉ cho phép tài khoản có `profile.role === 'admin'` thực thi.

## 4. BACKGROUND & SOURCE OF TRUTH

- **Quyết định D-03-05**: PO chốt `profiles.role` chỉ đại diện cho Platform Role (`USER`/`ADMIN`). `DRIVER`/`PASSENGER` là khả năng/mối quan hệ nghiệp vụ riêng biệt.
- **Quyết định D-03-07**: PO chốt xác minh thẻ KTX (`dorm_card_verified = 'VERIFIED'`) là điều kiện bắt buộc cho các Core Carpool Actions.
- **Baseline Contract**: [`docs/database/live-schema-baseline.md`](file:///d:/CNTT/KTX%20Carpooling/ktx-carpooling/docs/database/live-schema-baseline.md).

## 5. SCOPE & IMPLEMENTATION DETAILS

### 5.1 Các file đã điều chỉnh & chuẩn hóa

1. **[`src/app/(auth)/actions.ts`](file:///d:/CNTT/KTX%20Carpooling/ktx-carpooling/src/app/(auth)/actions.ts)**:
   - Cập nhật `registerAction`: Đảm bảo khi tạo `profiles` record mới, `role` luôn được gán là `'USER'`.

2. **[`src/app/(main)/trips/actions.ts`](file:///d:/CNTT/KTX%20Carpooling/ktx-carpooling/src/app/(main)/trips/actions.ts)**:
   - Cập nhật `createTripAction`: Thêm bước kiểm tra profile của driver. Nếu `profile.dorm_card_verified !== 'VERIFIED'`, trả về lỗi yêu cầu xác minh thẻ KTX trước khi đăng chuyến.

3. **[`src/app/(main)/trips/[id]/actions.ts`](file:///d:/CNTT/KTX%20Carpooling/ktx-carpooling/src/app/(main)/trips/[id]/actions.ts)**:
   - Cập nhật `createTripRequestAction`: Thêm bước kiểm tra profile của hành khách. Nếu `profile.dorm_card_verified !== 'VERIFIED'`, trả về lỗi yêu cầu xác minh thẻ KTX trước khi gửi yêu cầu ghép xe.

4. **[`src/app/api/verifications/route.ts`](file:///d:/CNTT/KTX%20Carpooling/ktx-carpooling/src/app/api/verifications/route.ts) & [`src/app/(main)/profile/actions.ts`](file:///d:/CNTT/KTX%20Carpooling/ktx-carpooling/src/app/(main)/profile/actions.ts)**:
   - Sửa câu lệnh update từ bảng `users` sang bảng `profiles`. Đồng bộ cả 2 trạng thái `dorm_card_verified` (`'PENDING'`) và `verification_status` (`'pending'`).

5. **[`src/app/admin/page.tsx`](file:///d:/CNTT/KTX%20Carpooling/ktx-carpooling/src/app/admin/page.tsx) & [`src/app/admin/verifications/actions.ts`](file:///d:/CNTT/KTX%20Carpooling/ktx-carpooling/src/app/admin/verifications/actions.ts)**:
   - Bổ sung kiểm tra uỷ quyền `profile.role === 'admin'` cho toàn bộ trang và action quản trị duyệt/từ chối thẻ KTX.

## 6. ACCEPTANCE CRITERIA

| ID | Tiêu chí | Kết quả kiểm chứng |
|---|---|---|
| AC-01 | Tài khoản đăng ký mới được khởi tạo đúng `role = 'USER'` trong DB `profiles` | PASS |
| AC-02 | Sinh viên chưa xác minh thẻ KTX bị chặn khi Đăng chuyến đi (`createTripAction`) với thông báo hướng dẫn | PASS |
| AC-03 | Sinh viên chưa xác minh thẻ KTX bị chặn khi Gửi yêu cầu ghép xe (`createTripRequestAction`) | PASS |
| AC-04 | Sinh viên đã được duyệt thẻ KTX (`dorm_card_verified === 'VERIFIED'`) thực hiện được mọi thao tác carpooling cốt lõi | PASS |
| AC-05 | Luồng upload thẻ KTX ghi nhận đúng vào bảng `profiles` và không phát sinh lỗi HTTP 500 | PASS |
| AC-06 | Đường dẫn `/admin` và các action quản trị từ chối truy cập đối với tài khoản không phải ADMIN | PASS |
| AC-07 | `npx tsc --noEmit` và `npm run build` PASS 100% không có lỗi type hay build | PASS |
