# Dữ liệu Khởi tạo & Danh mục Hệ thống — Current Data

Tài liệu quản lý danh mục địa điểm, tuyến đường, quy tắc tính giá và danh sách tên miền email sinh viên được chấp nhận.

---

## 1. Danh mục Địa điểm Khởi tạo (Locations)

### 1.1 Ký túc xá
- **Ký túc xá Khu A**:
  - Tọa độ GPS: `10.8783, 106.8066`
  - Các tòa nhà: A1, A2, A3, A4, A5, A6, A7, A8, A15, A16, A17, A18, A19, A20.
- **Ký túc xá Khu B**:
  - Tọa độ GPS: `10.8809, 106.8021`
  - Các tòa nhà: B1, B2, B3, B4, B5, C1, C2, C3, C4, C5, C6, D1, D2, D3, D4, D5, D6, E1.

### 1.2 Trường Đại học Thành viên ĐHQG-HCM

| Mã trường | Tên trường | Danh sách Cơ sở & Tọa độ GPS |
|---|---|---|
| **HCMUS** | ĐH Khoa học Tự nhiên | - CS1: 227 Nguyễn Văn Cừ, Q.5 (`10.7628, 106.6823`)<br>- CS2: Linh Trung, TP. Thủ Đức (`10.8756, 106.8007`) |
| **HCMUT** | ĐH Bách khoa | - CS1: Lý Thường Kiệt, Q.10 (`10.7725, 106.6578`)<br>- CS2: Linh Trung, TP. Thủ Đức (`10.8800, 106.8058`) |
| **UIT** | ĐH Công nghệ Thông tin | - CS Chính: Linh Trung, TP. Thủ Đức (`10.8703, 106.8037`) |
| **USSH** | ĐH KHXH & Nhân văn | - CS1: Đinh Tiên Hoàng, Q.1 (`10.7844, 106.7027`)<br>- CS2: Linh Trung, TP. Thủ Đức (`10.8715, 106.8022`) |
| **IU** | ĐH Quốc Tế | - CS Chính: Linh Trung, TP. Thủ Đức (`10.8775, 106.8015`) |
| **UEL** | ĐH Kinh tế - Luật | - CS Chính: Linh Trung, TP. Thủ Đức (`10.8659, 106.7779`) |

---

## 2. Ma trận Khoảng cách Chuẩn (Fallback Distance Matrix)

Khi không có kết nối tới OpenStreetMap OSRM API, hệ thống tự động tra cứu ma trận khoảng cách chuẩn hóa (tính bằng km):

| Điểm xuất phát | Điểm đến (Trường) | CS1 (Nội thành) | CS2 (Thủ Đức / Lĩnh Trung) |
|---|---|---|---|
| **Khu A** | HCMUS | 18.5 km | 2.5 km |
| **Khu A** | HCMUT | 17.0 km | 2.0 km |
| **Khu A** | UIT | — | 1.5 km |
| **Khu A** | USSH | 16.5 km | 2.2 km |
| **Khu A** | IU | — | 1.8 km |
| **Khu A** | UEL | — | 3.5 km |
| **Khu B** | HCMUS | 20.0 km | 3.8 km |
| **Khu B** | HCMUT | 18.5 km | 3.2 km |
| **Khu B** | UIT | — | 2.8 km |
| **Khu B** | USSH | 18.0 km | 3.5 km |
| **Khu B** | IU | — | 2.9 km |
| **Khu B** | UEL | — | 4.2 km |

---

## 3. Danh sách Tên miền Email Sinh viên Chấp nhận (Email Domain Whitelist)

Triển khai tại hàm `isValidStudentEmailDomain` ([`src/utils/constants.ts`](file:///d:/CNTT/KTX%20Carpooling/ktx-carpooling/src/utils/constants.ts#L67-L89)):

- `@student.hcmus.edu.vn`
- `@mcs.hcmus.edu.vn`
- `@hcmus.edu.vn`
- `@st.hcmut.edu.vn`
- `@hcmut.edu.vn`
- `@student.uit.edu.vn`
- `@uit.edu.vn`
- `@student.ussh.edu.vn`
- `@ussh.edu.vn`
- `@student.hcmiu.edu.vn`
- `@hcmiu.edu.vn`
- `@st.uel.edu.vn`
- `@uel.edu.vn`
- Tất cả các tên miền kết thúc bằng `.edu.vn`.
