# KẾ HOẠCH THỰC THI BẢN MVP (PHASE 1 — MVP RELEASE PLAN)
## Nền tảng Ghép xe Máy Sinh viên KTX ĐHQG-HCM (KTX Carpooling)

> **Mục tiêu**: Hoàn thiện phiên bản MVP cốt lõi, an toàn, ổn định và sẵn sàng cho sinh viên KTX Khu A & Khu B ĐHQG-HCM sử dụng để ghép xe đi học tiết kiệm chi phí.

---

## 1. PHẠM VI NGHỆP VỤ MVP (MVP SCOPE)

Bản MVP tập trung vào **5 luồng nghiệp vụ cốt lõi** và **hệ thống phân quyền an toàn**:

```mermaid
flowchart TD
    A[Đăng ký Email Sinh viên] --> B[Upload Thẻ KTX]
    B --> C[Admin Duyệt Thẻ KTX tại /admin]
    C --> D{Đã xác minh?}
    D -- Chưa --|Chặn Core Action| E[Hướng dẫn xác minh]
    D -- Đã xác minh --> F[Tài xế: Đăng chuyến đi mới]
    D -- Đã xác minh --> G[Hành khách: Tìm & Gửi yêu cầu ghép xe]
    F --> H[Tài xế duyệt Yêu cầu]
    G --> H
    H --> I[Chat nội bộ trao đổi điểm đón]
    I --> J[Hoàn thành chuyến & Đánh giá]
```

---

## 2. DẠNG TÍNH NĂNG CHI TIẾT TRONG MVP

### 2.1 Đăng ký, Đăng nhập & Danh tính Sinh viên (Auth & Identity)
- **Đăng ký tài khoản**: Sử dụng email sinh viên (`@hcmus.edu.vn`, `@hcmut.edu.vn`, `@uit.edu.vn`, v.v.).
- **Xác minh Email**: Xử lý code đổi session qua route `auth/callback` chuẩn PKCE.
- **Xác minh Thẻ KTX thủ công (Manual Admin Review)**:
  - Sinh viên nhập MSSV, chọn Khu A/Khu B, Tòa nhà và tải lên ảnh chụp Thẻ KTX.
  - Quản trị viên (Admin) truy cập trang [`/admin/verifications`](file:///d:/CNTT/KTX%20Carpooling/ktx-carpooling/src/app/admin/verifications/AdminVerificationsClient.tsx) để kiểm tra ảnh thẻ và bấm **Duyệt** hoặc **Từ chối**.

### 2.2 Quản lý Chuyến đi (Trip Management)
- **Tạo chuyến đi (Driver)**:
  - Chọn điểm xuất phát (Khu A / Khu B KTX, Tòa nhà, Điểm đón cụ thể).
  - Chọn trường đại học / Cơ sở điểm đến (HCMUS, HCMUT, UIT, USSH, IU, UEL,...).
  - Chọn ngày đi, giờ đón, số ghế trống, phương thức thanh toán.
  - **Tự động tính khoảng cách thực tế & giá gợi ý**: Tích hợp OSRM / Pricing Engine (`src/lib/pricing.ts`).
  - **Boundary DTO Mapper**: Đảm bảo ghi nhận 39 cột trên DB live normalized (FK vehicle, location, route).

### 2.3 Tìm kiếm & Ghép chuyến (Trip Search & Matching)
- **Tìm kiếm & Lọc chuyến (Passenger)**:
  - Lọc chuyến theo Khu vực KTX, Trường đại học điểm đến, Ngày đi, Giờ đi.
  - Thuật toán sắp xếp chuyến đi tương thích dựa trên mốc thời gian và khoảng cách địa lý (`src/lib/matching.ts`).
- **Gửi & Xử lý Yêu cầu**:
  - Hành khách gửi yêu cầu ghép xe.
  - Tài xế nhận thông báo và chấp nhận (Accept) hoặc Từ chối (Reject) yêu cầu.

### 2.4 Chat Nội bộ & Đánh giá (Chat & Ratings)
- **Chat Realtime theo chuyến đi**:
  - Chỉ cho phép Tài xế và Hành khách đã được chấp nhận (`ACCEPTED`) tham gia phòng chat riêng của chuyến đi.
  - Gợi ý tin nhắn nhanh (Quick replies) như: "Tôi đã đến điểm hẹn", "Đang đứng ở cổng tòa nhà",...
- **Đánh giá & Điểm uy tín**:
  - Đánh giá từ 1 - 5 sao và viết nhận xét sau khi hoàn thành chuyến đi.
  - Tự động cập nhật điểm đánh giá trung bình (`average_rating`) và số chuyến đã đi cho tài xế/hành khách.

### 2.5 Phân quyền & Bảo mật (Security & Authorization)
- **Platform Role**: Tách biệt rõ ràng vai trò hệ thống (`USER` / `ADMIN`).
- **Cưỡng chế Xác minh (Verification Enforcement)**: Sinh viên bắt buộc phải có trạng thái `dorm_card_verified === 'VERIFIED'` mới được thực hiện Đăng chuyến đi & Gửi yêu cầu ghép xe.
- **Bảo vệ Route & Action**: Bảo vệ các trang `/admin` và Server Actions chống truy cập trái phép.

---

## 3. TIÊU CHÍ KỸ THUẬT & GIAO DIỆN MVP

- **Giao diện chuẩn Đơn giản - Hiện đại**:
  - Phông chữ: `Be Vietnam Pro`.
  - Khung Container: `bg-white rounded-3xl border border-slate-200/80 shadow-xs`.
  - Ô nhập dữ liệu: `rounded-xl border border-slate-200 text-slate-900 font-medium`.
  - Nút bấm: `bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/20`.
- **Chất lượng Mã nguồn**:
  - Build verification: `npm run build` PASS 100% (19/19 static & dynamic routes).
  - TypeScript check: `npx tsc --noEmit` PASS 0 lỗi.
  - Phù hợp hoàn toàn với Next.js 16 App Router & Turbopack.

---

## 4. QUY TRÌNH KIỂM THỬ NGHỆP VỤ (MVP TEST PROTOCOL)

| STT | Luồng kiểm thử | Thao tác thực hiện | Kết quả mong đợi |
|---|---|---|---|
| 1 | Đăng ký & Xác minh Email | Tạo tài khoản sinh viên mới với email trường | Đăng ký thành công, nhận email xác minh |
| 2 | Upload thẻ KTX | Sinh viên điền MSSV & tải ảnh thẻ KTX | Hồ sơ chuyển sang trạng thái `PENDING` |
| 3 | Admin Duyệt thẻ | Đăng nhập tài khoản Admin vào `/admin/verifications` | Bấm Duyệt ➔ Profile chuyển sang `VERIFIED` |
| 4 | Tạo chuyến đi | Tài xế đã verify chọn Khu B -> HCMUS CS2 | Chuyến đi tạo thành công, hiển thị trên danh sách |
| 5 | Gửi yêu cầu ghép xe | Hành khách đã verify bấm "Đăng ký đi cùng" | Yêu cầu hiển thị trên danh sách chờ duyệt của Tài xế |
| 6 | Duyệt yêu cầu & Chat | Tài xế bấm Chấp nhận | Phòng chat mở cho 2 người trao đổi vị trí đón |
| 7 | Hoàn thành & Đánh giá | Hoàn thành chuyến đi & chấm 5 sao | Điểm trung bình của tài xế cập nhật chính xác |
