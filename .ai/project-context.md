# PROJECT CONTEXT — KTX Carpooling

> Bối cảnh nghiệp vụ & phạm vi dự án. Nguồn: `docs/product/project-report.md`, `docs/product/project-guide.md`, `docs/database/current-data.md`, `docs/database/supabase-structure.md`, `src/utils/constants.ts`. Trạng thái thực tế được tách riêng khỏi nghiệp vụ mục tiêu.

---

## 1. Một câu tóm tắt

Ứng dụng web **ghép chuyến xe máy** cho sinh viên sống tại **Ký túc xá Khu A & Khu B — ĐHQG-HCM**, giúp sinh viên có xe chở sinh viên cùng tuyến đến các trường đại học thành viên, chia sẻ chi phí minh bạch.

---

## 2. Người dùng & vai trò

| Vai trò | Mô tả | Quyền chính |
|---|---|---|
| **Tài xế (DRIVER)** | Sinh viên KTX có xe máy | Đăng chuyến, xem yêu cầu, chấp nhận/từ chối, chat, hoàn thành chuyến |
| **Hành khách (PASSENGER)** | Sinh viên KTX cần đi ké | Tìm chuyến, gửi yêu cầu, huỷ yêu cầu, chat, đánh giá |
| **Cả hai (BOTH)** | Mặc định khi đăng ký | Cả hai nhóm quyền trên |
| **Quản trị viên (ADMIN)** | Ban quản trị | Duyệt/từ chối hồ sơ xác minh thẻ KTX |

> ⚠️ Giá trị `ADMIN` không xuất hiện trong form đăng ký (`(auth)/register/page.tsx` chỉ có DRIVER/PASSENGER/BOTH). Cách một tài khoản trở thành ADMIN chưa được tài liệu hoá — xem `database-context.md`.

---

## 3. Địa bàn hoạt động

- **Điểm đi**: KTX Khu A (Linh Trung, Thủ Đức) và KTX Khu B (Linh Trung, Thủ Đức).
  - `DORM_AREAS = [KHU_A, KHU_B]`
  - `DORM_BUILDINGS`: Khu A = A1–A5, Khu B = B1–B5 *(nguồn: `src/utils/constants.ts`)*
- **Điểm đến lõi trong code/UI**: 6 trường — HCMUS, HCMUT, UIT, USSH, IU, UEL.
- **Dataset locations/routes mở rộng**: còn có UEH, UEF, VGU, VLU, FPT, HUTECH, TDTU, NTTU và các trường/khu vực khác. Không được giả định dropdown hiện tại đã hỗ trợ toàn bộ dataset.
- `locations` và `routes` đã được PO xác nhận tồn tại và có dữ liệu trên DB DEV; schema cột đầy đủ vẫn cần dump.

---

## 4. Luồng nghiệp vụ chính

### 4.1 Đăng ký & xác minh (2 lớp)
1. **Lớp 1 — Email sinh viên**: đăng ký bằng email trường (whitelist trong `ALLOWED_STUDENT_EMAIL_DOMAINS`, cho phép mọi domain `.edu.vn`), xác minh qua **OTP 6 số** gửi về mail.
2. **Lớp 2 — Thẻ KTX**: upload ảnh thẻ KTX + MSSV + khu/tòa nhà → trạng thái `PENDING` → ADMIN duyệt `VERIFIED` / `REJECTED`.

### 4.2 Tài xế đăng chuyến
- Nhập: ngày, giờ đón (HH:mm), khu/tòa/điểm đón, trường + campus + tòa đến, ghi chú, phương thức thanh toán.
- Số ghế mặc định = 1 (`readOnly` trong form).
- Hệ thống tự tính **khoảng cách thực tế** → **giá gợi ý**.

**Trạng thái thực tế:** code hiện gửi mô hình `trips` phẳng, trong khi DB DEV dùng schema normalized 27 cột (`trip_date`, `vehicle_id`, `route_id`, `pickup_location_id`, snapshot fields...). Vì vậy tính năng chưa hoạt động end-to-end và mọi thay đổi trip phải đi qua EPIC-03.

### 4.3 Hành khách tìm & gửi yêu cầu
- Tìm theo trường/ngày, hệ thống **xếp hạng bằng điểm khớp** (0–100%).
- Gửi yêu cầu → chuyến chuyển `REQUESTED`, chờ tài xế phản hồi.

### 4.4 Tài xế chấp nhận / từ chối
- Chấp nhận 1 yêu cầu → chuyến `ACCEPTED`, các yêu cầu khác bị `REJECTED`, ghế về 0.

### 4.5 Chat & hoàn thành
- Chỉ tài xế + hành khách đã `ACCEPTED` vào được phòng chat.
- Nút nhanh: "đã đến điểm đón", "báo trễ 5 phút", "hoàn thành chuyến", "đánh giá".

**Trạng thái thực tế:** bảng `messages` không tồn tại trên DB DEV; chat là code path chưa chạy được, không được mô tả như tính năng đang hoạt động.

### 4.6 Đánh giá
- Sau chuyến, hai bên đánh giá nhau (1–5 sao + nhận xét). Điểm uy tín hiển thị trên hồ sơ.

**Trạng thái thực tế:** bảng `ratings` tồn tại, nhưng schema cột/runtime chưa được dump; code dùng `stars` trong khi tài liệu mục tiêu dùng `score`.

### 4.7 Auth runtime

- Code thiết kế OTP và email confirmation.
- Supabase DEV hiện tắt confirm email, nên signup cấp session ngay; OTP chưa phải hành vi bắt buộc của môi trường hiện tại.

---

## 5. Quy tắc nghiệp vụ đã chốt

### 5.1 Ghép chuyến — lọc cứng (rule filter)
`src/lib/matching.ts` → `filterCompatibleTrips`:
- Cùng **ngày** đi
- Lệch **giờ đón ≤ 5 phút** *(hằng số `MAX_TIME_DIFF_MINUTES = 5`)*
- Còn **ghế trống** (`available_seats > 0`)
- Chuyến đang **OPEN**
- Cùng **trường đại học** đến

### 5.2 Ghép chuyến — điểm khớp (weighted score)
`calculateMatchScore`:

| Tiêu chí | Điểm |
|---|---|
| Cùng trường | +40 |
| Cùng campus | +25 |
| Lệch giờ = 0 phút | +25 |
| Lệch giờ ≤ 3 phút | +20 |
| Lệch giờ ≤ 5 phút | +10 |
| Điểm uy tín tài xế ≥ 4.5 | +10 |

### 5.3 Giá gợi ý (bắt buộc, không đổi nếu chưa có quyết định PO)
`src/utils/constants.ts` → `PRICING_CONFIG`:
```
PRICE_PER_KM = 2.000 VNĐ
MINIMUM_PRICE = 5.000 VNĐ
giá = max(khoảng_cách_km × 2.000, 5.000)
```

### 5.4 Đo khoảng cách
- Ưu tiên: **OSRM** (`router.project-osrm.org`, profile xe máy) — khoảng cách đường thực tế.
- Dự phòng: `DISTANCE_MATRIX` trong `src/lib/pricing.ts` (ma trận khoảng cách tĩnh).

---

## 6. Phạm vi (Scope)

### Trong phạm vi
- Đăng ký / đăng nhập / OTP email sinh viên
- Xác minh thẻ KTX (upload + duyệt thủ công)
- Đăng chuyến, tìm chuyến, ghép chuyến, yêu cầu, chấp nhận/từ chối/huỷ
- Chat nội bộ, đánh giá, tính giá & khoảng cách
- Trang quản trị duyệt xác minh

### Ngoài phạm vi / chưa triển khai
- Thanh toán trong ứng dụng (chỉ chia sẻ chi phí, thanh toán trực tiếp)
- Ứng dụng di động native
- Chat realtime (hiện là gửi server action rồi refetch)
- Tích hợp Messenger thật (mới có webhook stub)
- AI tìm kiếm ngôn ngữ tự nhiên (Gemini — chưa cấu hình API key)
- Báo cáo vi phạm (có thiết kế UI/type, chưa có luồng hoàn chỉnh)

### 6.1 Các phụ thuộc đã biết

- Schema normalized của `trips` phải được chốt trước khi sửa matching, pricing snapshot hoặc tạo trip.
- Chat phụ thuộc việc tạo bảng `messages` hoặc chọn thiết kế thay thế.
- Dataset locations/routes rộng hơn các trường lõi mà code hiện đang khai báo.

---

## 7. Ràng buộc phi chức năng

- **Chỉ dành cho sinh viên KTX** — hệ thống không phục vụ người ngoài.
- Chi phí tham khảo phải **minh bạch trước khi xác nhận**.
- Thiết kế **light-only** (dark mode bị vô hiệu hoá có chủ đích trong `globals.css`).
- Ngôn ngữ giao diện: **tiếng Việt**.
