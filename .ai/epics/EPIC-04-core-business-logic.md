# EPIC-04 — Core Business Logic Correctness

| Trường | Giá trị |
|---|---|
| **EPIC ID** | EPIC-04 |
| **Tên** | Core Business Logic Correctness |
| **Ưu tiên** | 4 (Core business logic) |
| **Mức độ** | 🟠 Cao |
| **Trạng thái** | `PROPOSED` |
| **Phụ thuộc** | EPIC-03 (cần biết schema thật trước khi sửa logic) |

---

## 1. Goal

Làm cho hai thuật toán lõi — **ghép chuyến** và **tính giá** — chạy đúng như đặc tả trong `docs/product/project-report.md`, và làm cho dữ liệu chuyến đi có ngữ nghĩa đúng để thuật toán có cái mà so khớp.

---

## 2. Current state (bằng chứng)

| # | Vấn đề | Vị trí |
|---|---|---|
| 1 | UI có chọn `dormArea` nhưng **không truyền vào `MatchingCriteria`** ⇒ lọc theo khu KTX vô tác dụng | `(main)/trips/TripsSearchClient.tsx` |
| 2 | `pickup_score` được khai báo nhưng **không bao giờ gán** ⇒ điểm tối đa thực tế 75/100 thay vì 100 | `src/lib/matching.ts` |
| 3 | `destinationCampus` lưu **index** (`"1"`) thay vì tên campus ⇒ matching campus (+25) không bao giờ khớp đúng | `(main)/trips/create/page.tsx` |
| 4 | Matching chạy hoàn toàn ở **client** ⇒ không kiểm soát được kết quả | `TripsSearchClient.tsx` |
| 5 | Form tìm kiếm nhanh ở landing gửi `university` + `date` nhưng `/trips` **không đọc** ⇒ tính năng chết | `src/app/page.tsx` vs `(main)/trips/page.tsx` |
| 6 | So sánh trạng thái nhạy case: `trip.status !== 'OPEN'` trong khi DB có thể lưu chữ thường | `trips/[id]/actions.ts` |
| 7 | `available_seats` luôn = 1 (readOnly) — không có UI chọn số ghế | `(main)/trips/create/page.tsx` |
| 8 | `lib/matching.ts` có `trip.status?.toUpperCase() !== 'OPEN'` — dấu hiệu phòng thủ cho thấy từng gặp giá trị lạ | `src/lib/matching.ts` |

**Đối chứng tích cực:**
- `PRICING_CONFIG` (2.000đ/km, tối thiểu 5.000đ) đúng đặc tả; `calculateSuggestedPrice` dùng `Math.max` đúng.
- Có fallback `DISTANCE_MATRIX` khi OSRM lỗi.

---

## 3. Target state

- [ ] Bộ lọc theo khu KTX hoạt động thật (chọn Khu A chỉ ra chuyến Khu A).
- [ ] Điểm khớp sử dụng đủ 100 điểm; mọi thành phần trong công thức đều có tác dụng.
- [ ] `destination_campus` lưu **giá trị đọc được** (khớp với `UNIVERSITIES[].campuses`).
- [ ] Landing "Tìm chuyến đi nhanh" lọc được theo trường + ngày.
- [ ] Mọi so sánh trạng thái không phụ thuộc case.
- [ ] Kết quả matching **tất định**: cùng input ⇒ cùng output; có thể kiểm thử bằng hàm thuần.

---

## 4. Dependencies

| Loại | Nội dung |
|---|---|
| Phụ thuộc | **EPIC-03** — phải biết case enum thật trước khi bỏ `toUpperCase()` và dùng so sánh chuẩn |
| Cần PO | **Q7** — có cưỡng chế "chỉ sinh viên đã xác minh"? |
| Cần PO | Số ghế: giữ cố định 1 hay cho tài xế chọn? |
| Cần PO | Có chuyển matching lên server? (ảnh hưởng kiến trúc) |

---

## 5. Risk

| Rủi ro | Mức | Giảm thiểu |
|---|---|---|
| Sửa campus từ index sang tên ⇒ chuyến cũ hiển thị sai | 🟠 Cao | Cần migration dữ liệu cũ + kiểm tra |
| Bỏ `toUpperCase()` khi DB thật lưu chữ thường ⇒ vỡ luồng | 🔴 Chặn | Chờ Q4 |
| Chuyển matching lên server là thay đổi kiến trúc lớn | 🟠 Cao | Cân nhắc tách thành epic riêng; cần PO duyệt |
| Trọng số matching thay đổi ⇒ hành vi người dùng thay đổi | 🟡 TB | Giữ nguyên trọng số đã chốt |

---

## 6. Tasks

| Task | Tên | Trạng thái |
|---|---|---|
| TASK-00x *(đề xuất)* | Đưa `dormArea` vào `MatchingCriteria` và tiêu chí lọc | `PROPOSED` |
| TASK-00x *(đề xuất)* | Sửa `pickup_score` để điểm khớp đạt đủ 100 | `PROPOSED` |
| TASK-00x *(đề xuất)* | Lưu tên campus thay vì index + migration dữ liệu cũ | `PROPOSED` |
| TASK-00x *(đề xuất)* | Cho `/trips` đọc tham số `university` & `date` từ query string | `PROPOSED` |
| TASK-00x *(đề xuất)* | Chuẩn hoá so sánh trạng thái (không nhạy case) | `PROPOSED` — phụ thuộc Q4 |
| TASK-00x *(đề xuất)* | Viết test cho `lib/matching.ts` và `lib/pricing.ts` | `PROPOSED` |

---

## 7. Điều kiện hoàn thành EPIC

- [ ] `lib/matching.ts` và `lib/pricing.ts` có test bao phủ các trường hợp biên
- [ ] Không còn thành phần nào trong công thức điểm bị "chết"
- [ ] Dữ liệu campus trong DB đọc được bằng tên
- [ ] Lọc theo khu KTX + trường + ngày đều hoạt động từ UI
