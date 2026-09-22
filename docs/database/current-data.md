# Dữ liệu Khởi tạo & Danh mục Hệ thống — Current Data

Tài liệu này tổng hợp dữ liệu địa điểm, tuyến đường, danh sách tên miền email sinh viên được chấp nhận, pricing, và dữ liệu chuẩn hóa dùng trong hệ thống KTX Carpooling.

> Nguồn dữ liệu chính: các file `danh_sach_locations.csv`, `danh_sach_routes.csv`, và các tài liệu mã nguồn / mô tả trong repo. Đây là nguồn dữ liệu đặc biệt hữu ích cho AI agent khi cần hiểu phạm vi địa lý, danh mục điểm đi/đến và route chuẩn hóa.

---

## 1. Danh mục địa điểm khởi tạo

### 1.1 Ký túc xá

#### KTX Khu A
- Tọa độ: `10.8781, 106.8031`
- Mã area: `KTX_A`
- Địa chỉ: đường Tạ Quang Bửu, khu 33, phường Linh Xuân, TP.HCM

#### KTX Khu B
- Tọa độ: `10.8867, 106.8172`
- Mã area: `KTX_B`
- Địa chỉ: đường Mạc Đĩnh Chi, khu Tân Hòa, phường Đông Hòa, TP.HCM

### 1.2 Các trường và điểm quan trọng trong dataset

| Mã area | Tên | Loại | Cơ sở / campus | Địa chỉ | Tọa độ |
|---|---|---|---|---|---|
| `HCM_HCMUS_CS1` | ĐH Khoa học Tự nhiên | university_school | CS1 (Nguyễn Văn Cừ) | 227 Nguyễn Văn Cừ, Q.5 | 10.7628, 106.6825 |
| `HCM_HCMUS_CS2` | ĐH Khoa học Tự nhiên | university_school | CS2 (Linh Trung) | Khu đô thị ĐHQG-HCM | 10.8757, 106.7998 |
| `HCM_HCMUT_CS1` | ĐH Bách khoa | university_school | CS1 (Lý Thường Kiệt) | 268 Lý Thường Kiệt, Q.10 | 10.7725, 106.6577 |
| `HCM_HCMUT_CS2` | ĐH Bách khoa | university_school | CS2 (ĐHQG-HCM) | Khu đô thị ĐHQG-HCM | 10.8794, 106.8063 |
| `HCM_USSH_CS1` | ĐH KHXH & NV | university_school | CS1 (Đinh Tiên Hoàng) | 10-12 Đinh Tiên Hoàng, Q.1 | 10.7865, 106.7018 |
| `HCM_USSH_CS2` | ĐH KHXH & NV | university_school | CS2 (Linh Trung) | Khu ĐHQG-HCM | 10.8715, 106.8012 |
| `HCM_UIT` | ĐH CNTT | university_school | CS chính | Đường Hàn Thuyên, Linh Trung | 10.8701, 106.8030 |
| `HCM_IU` | ĐH Quốc tế | university_school | CS chính | Khu ĐHQG-HCM | 10.8776, 106.8016 |
| `HCM_UEL` | ĐH Kinh tế - Luật | university_school | CS chính | 669 Quốc lộ 1K, Linh Xuân | 10.8778, 106.7779 |
| `HCM_UEH_A` | UEH | university | CS A | 59C Nguyễn Đình Chiểu | 10.7811, 106.6953 |
| `HCM_UEH_B` | UEH | university | CS B | 279 Nguyễn Tri Phương | 10.7602, 106.6663 |
| `HCM_UTE` | ĐH SPKT TP.HCM | university | CS chính | 1 Võ Văn Ngân | 10.8514, 106.7719 |
| `HCM_NLU` | ĐH Nông Lâm | university | CS chính | Khu phố 6, Linh Trung | 10.8712, 106.7885 |
| `HCM_UHS` | ĐH Y Dược | university_school | CS chính | Khu ĐHQG-HCM | 10.8698, 106.8038 |
| `HCM_FPT` | ĐH FPT | university | Khu công nghệ cao | Đường D1, Long Thạnh Mỹ | 10.8532, 106.7978 |
| `HCM_HUTECH_KCNC` | HUTECH | university | Khu công nghệ cao | Đường D1 | 10.8546, 106.7942 |
| `HCM_NTTU_KCNC` | ĐH Nguyễn Tất Thành | university | Khu công nghệ cao | Đường D1 | 10.8521, 106.7963 |
| `HCM_TDTU` | ĐH Tôn Đức Thắng | university | Trụ sở Tân Phong | 19 Nguyễn Hữu Thọ | 10.7327, 106.6995 |
| `HCM_UEF` | UEF | university | CS chính | 141-145 Điện Biên Phủ | 10.7968, 106.7087 |
| `HCM_VLU_CS3` | VLU | university | CS3 | 69/68 Đường Thầy Trâm | 10.8256, 106.6999 |
| `BD_HCMUT_CS2` | ĐH Bách khoa | university_school | CS2 (Di An) | Khu ĐHQG-HCM, Di An | 10.8794, 106.8063 |
| `BD_TLU` | ĐH Thủy lợi | university_branch | BĐ | Thị xã Thủ Dầu Một | 10.8687, 106.7490 |
| `BD_TDMU` | ĐH Thủ Dầu Một | university | Trụ sở chính | TP. Thủ Dầu Một | 10.9805, 106.6746 |
| `BD_BDU` | ĐH Bình Dương | university | Trụ sở chính | TP. Thủ Dầu Một | 10.9922, 106.6575 |
| `BD_EIU` | ĐH Quốc tế Miền Đông | university | CS chính | TP. Thủ Dầu Một | 11.0531, 106.6662 |
| `BD_VGU` | VGU | university | Khuôn viên chính | Vĩnh Đại 4, Bến Cát | 11.1105, 106.6136 |

---

## 2. Ma trận khoảng cách fallback

Đây là ma trận fallback cho trường hợp OSRM không khả dụng. Giá trị dưới đây là khoảng cách ước tính theo km và được sử dụng như dữ liệu backup khi không có route API.

| Điểm xuất phát | Điểm đến | Khoảng cách ước tính |
|---|---|---|
| KTX Khu A | HCMUS CS2 | 2.5 km |
| KTX Khu A | HCMUS CS1 | 18.5 km |
| KTX Khu A | HCMUT CS2 | 2.0 km |
| KTX Khu A | HCMUT CS1 | 17.0 km |
| KTX Khu A | UIT | 1.5 km |
| KTX Khu A | USSH CS2 | 2.2 km |
| KTX Khu A | USSH CS1 | 16.5 km |
| KTX Khu A | IU | 1.8 km |
| KTX Khu A | UEL | 3.5 km |
| KTX Khu B | HCMUS CS2 | 3.8 km |
| KTX Khu B | HCMUT CS2 | 3.2 km |
| KTX Khu B | UIT | 2.8 km |
| KTX Khu B | USSH CS2 | 3.5 km |
| KTX Khu B | IU | 2.9 km |
| KTX Khu B | UEL | 4.2 km |

---

## 3. Dữ liệu route chuẩn hóa

### 3.1 Mô tả
File `danh_sach_routes.csv` gồm rất nhiều route mẫu mô tả quãng đường giữa KTX và các khu vực đến. Mỗi route có các thuộc tính:
- `route_code`
- `start_area_code`
- `destination_area_code`
- `travel_mode`
- `distance_meters`
- `duration_seconds`
- `provider`
- `status`

### 3.2 Ví dụ route có sẵn

```text
KTXA_BD_GDQP_DHQG
KTXA_HCM_HCMUS_CS2
KTXA_HCM_USSH_CS2
KTXA_HCM_UIT
KTXA_HCM_UEL
KTXA_HCM_IU
KTXB_HCM_HCMUS_CS2
KTXB_HCM_UIT
KTXB_HCM_UEL
KTXB_HCM_HCMUT_CS1
KTXB_HCM_HSU
KTXA_BD_TDMU
KTXA_BD_VGU
KTXB_BD_EIU
KTXB_BD_VGU
```

### 3.3 Ý nghĩa route_code
- `KTXA_...` = xuất phát từ KTX Khu A
- `KTXB_...` = xuất phát từ KTX Khu B
- `HCM_...` = trường ở thành phố Hồ Chí Minh
- `BD_...` = trường ở Bình Dương / khu vực ngoài TP.HCM

---

## 4. Danh sách tên miền email sinh viên hợp lệ

Email sinh viên cần thuộc các miền dưới đây hoặc bất kỳ miền nào kết thúc bằng `.edu.vn`:

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
- các miền `.edu.vn` khác

---

## 5. Quy tắc pricing

### 5.1 Giá đề xuất tuyến
Công thức hiện tại được dùng trong hệ thống:

$$
\text{suggested price} = \max(\text{distance\_km} \times 2000, 5000)
$$

### 5.2 Dữ liệu pricing chuẩn hóa
- `base_fare`: 0 hoặc chi phí cơ bản
- `price_per_km`: 2000
- `minimum_fare`: 5000
- `currency`: `VND`

---

## 6. Dữ liệu khu KTX / trường chính theo source

### 6.1 KTX
- KTX Khu A — `KTX_A`
- KTX Khu B — `KTX_B`

### 6.2 Trường chính trong hệ thống
- HCMUS
- HCMUT
- UIT
- USSH
- IU
- UEL

### 6.3 Dữ liệu mở rộng
- UEH
- UEF
- VGU
- VLU
- FPT
- HUTECH
- TDTU
- NTTU
- và nhiều trường khác trong dataset

---

## 7. Tài liệu nguồn / dữ liệu tham chiếu

- `danh_sach_locations.csv`
- `danh_sach_routes.csv`
- `CautrucSupabase.txt`
- `src/utils/constants.ts`
- `src/lib/pricing.ts`
- `src/lib/matching.ts`
- `src/types/database.ts`

---

## 8. Lưu ý quan trọng cho AI agent

1. `danh_sach_locations.csv` và `danh_sach_routes.csv` nên được xem là dữ liệu chuẩn hóa có giá trị thực tế cho domain KTX Carpooling.
2. Cấu trúc Supabase trong `CautrucSupabase.txt` nên được dùng như tài liệu định nghĩa bảng và enum, nhưng cần còn kiểm tra với DB thật trước khi production.
3. Một số tên trường trong code có thể khác với tên trong tài liệu vì đang có xung đột thực tế: `date` vs `trip_date`, `status` vs `account_status`, `role` enum case.
4. Dữ liệu này hỗ trợ cho việc mô tả business logic và phục vụ phân tích logic, không phải thay thế cho schema live DB.

---

## 9. Kết luận

Dữ liệu hiện tại đủ cho việc xây dựng mô hình nhận thức về dự án: nơi đi, nơi đến, tuyến đường, định giá, danh sách trường, và cách dữ liệu nên được tổ chức để các AI agent hiểu được business domain của KTX Carpooling.

Đây là nguồn dữ liệu cực kỳ quan trọng khi cần triển khai hoặc mở rộng hệ thống lớn hơn, cũng như cần thực hiện đồng bộ hóa với Supabase chính thức.
