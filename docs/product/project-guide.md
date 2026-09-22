# Hướng dẫn Sử dụng & Phát triển — KTX Carpooling

Tài liệu này tổng hợp hướng dẫn cài đặt, cấu hình môi trường, quy trình phát triển, luồng nghiệp vụ và ràng buộc kiến trúc cho dự án KTX Carpooling.

---

## 1. Mục tiêu dự án

KTX Carpooling là nền tảng kết nối sinh viên ở KTX Khu A và Khu B với các sinh viên có cùng hướng đi đến trường hoặc cùng tuyến đường trong khu vực ĐHQG-HCM. Mục tiêu chính là:

- tiết kiệm chi phí đi học
- giảm số lượng xe cá nhân đi riêng
- tăng tính an toàn và hiệu quả cho sinh viên nội trú
- hỗ trợ xác minh danh tính qua email sinh viên và thẻ KTX
- cung cấp quy trình ghép chuyến rõ ràng từ tìm đáp ứng đến chat và đánh giá

---

## 2. Đối tượng sử dụng

### 2.1 Người dùng
- Tài xế: người có xe máy và muốn đăng chuyến
- Hành khách: người cần đi cùng và gửi yêu cầu ghép xe
- Cả hai: người có thể vừa đi và vừa chở
- Quản trị viên: duyệt hồ sơ xác minh thẻ KTX, giám sát trạng thái hệ thống

### 2.2 Ràng buộc doanh nghiệp
- Chỉ sinh viên có email thuộc các trường thành viên hoặc email học thuật hợp lệ mới được đăng ký
- Chuyển phát xác minh phải dựa trên email sinh viên và thẻ KTX
- Mỗi chuyến cần có khoảng cách và giá tham khảo được tính tự động
- Tài xế và hành khách cần xác nhận trước khi mở chat

---

## 3. Công nghệ sử dụng

### 3.1 Frontend / Fullstack
- Next.js 16.3.5
- React 19.2.8
- TypeScript
- Tailwind CSS v4
- App Router pattern

### 3.2 Backend / Storage / Auth
- Supabase Auth
- Supabase PostgreSQL
- Supabase Storage
- Supabase SSR client

### 3.3 External integrations
- Google Gemini API cho parsing truy vấn ngôn ngữ tự nhiên
- OpenStreetMap OSRM cho tính khoảng cách thực tế
- Facebook Messenger webhook (stub / skeleton, chưa phải tích hợp hoàn chỉnh)

---

## 4. Cấu trúc thư mục chính

```text
.
├── docs/
│   ├── audit/
│   ├── database/
│   └── product/
├── public/
├── src/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── types/
│   ├── utils/
│   ├── proxy.ts
│   └── ...
├── supabase/
│   ├── schema.sql
│   └── migrations/
├── package.json
├── next.config.ts
├── tsconfig.json
├── eslint.config.mjs
├── README.md
└── .env.local (local environment)
```

---

## 5. Cấu hình môi trường

Tạo file `.env.local` ở thư mục gốc:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>

GEMINI_API_KEY=<key>
MESSENGER_VERIFY_TOKEN=<verify-token>
MESSENGER_PAGE_ACCESS_TOKEN=<page-access-token>
```

### 5.1 Biến quan trọng
- `NEXT_PUBLIC_SUPABASE_URL`: endpoint Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: key dùng cho client-side và server session
- `GEMINI_API_KEY`: dùng cho AI parsing query
- `MESSENGER_VERIFY_TOKEN`: xác thực webhook Facebook Messenger
- `MESSENGER_PAGE_ACCESS_TOKEN`: token page Messenger

---

## 6. Lệnh khởi chạy

```bash
npm install
npm run dev
```

Các lệnh bổ sung:

```bash
npm run lint
npm run build
npm run start
```

Mặc định app chạy ở port 3000.

---

## 7. Quy chuẩn phát triển trong dự án

### 7.1 Next.js 16 conventions
- `params` và `searchParams` ở page có thể là Promise
- `cookies()` từ `next/headers` là async; cần `await cookies()`
- `src/proxy.ts` được dùng thay cho middleware trong Next.js 16 theo cách triển khai hiện tại
- Route bảo vệ nên dựa trên session check ở server side

### 7.2 Ký tự và naming
- File / biến / function: tiếng Anh theo chuẩn ngắn gọn nhưng rõ nghĩa
- Giao diện người dùng: tiếng Việt
- Enum và trạng thái: giữ chữ in hoa như `OPEN`, `PENDING`, `VERIFIED`, `ACCEPTED`

### 7.3 Tách tầng logic
- UI pages không nên chứa toàn bộ logic nghiệp vụ
- Logic matching, pricing, AI parsing đã tách ra thành module riêng trong `src/lib`
- Kiểu dữ liệu và domain model nằm trong `src/types/database.ts`

---

## 8. Luồng nghiệp vụ người dùng

### 8.1 Đăng ký sinh viên
1. Người dùng điền email sinh viên và thông tin cá nhân
2. Hệ thống validate tên miền email
3. Người dùng nhập thông tin KTX: khu, tòa nhà, trường
4. Hệ thống gửi OTP qua email
5. Sau khi xác minh, tài khoản được kích hoạt

### 8.2 Xác minh thẻ KTX
1. Người dùng upload ảnh thẻ KTX
2. Hồ sơ chuyển trạng thái `PENDING`
3. Quản trị viên duyệt hoặc từ chối
4. Kết quả lưu vào trạng thái `VERIFIED` / `REJECTED`

### 8.3 Tài xế tạo chuyến đi
1. Chọn khu KTX và điểm đón
2. Chọn trường đến, cơ sở, giờ đi
3. Hệ thống tính khoảng cách và đề xuất giá
4. Chuyến lưu với status `OPEN`
5. Hành khách có thể thấy và gửi yêu cầu

### 8.4 Hành khách tìm chuyến
1. Chọn ngày, trường, giờ, khu vực
2. Hệ thống lọc chuyến phù hợp
3. Match score được tính dựa trên trường, campus, lệch thời gian, uy tín tài xế
4. Người dùng gửi yêu cầu đi cùng với lời nhắn

### 8.5 Chấp nhận và chat
1. Tài xế xem danh sách yêu cầu ở `/requests`
2. Chấp nhận hoặc từ chối
3. Khi chấp nhận, hai bên được vào phòng chat
4. Chat diễn ra trong `/trips/[id]/chat`

### 8.6 Hoàn thành chuyến
- Sau khi đi xong, hệ thống có thể theo dõi trạng thái và cho phép đánh giá
- Điểm đánh giá có ảnh hưởng đến uy tín tài xế và đối tác

---

## 9. Luồng quản trị viên

1. Đăng nhập tài khoản admin
2. Vào trang duyệt hồ sơ xác minh
3. Kiểm tra ảnh thẻ KTX và thông tin sinh viên
4. Duyệt hoặc từ chối hồ sơ
5. Theo dõi trạng thái các yêu cầu và chuyến đi liên quan

---

## 10. Luồng dữ liệu và tích hợp

### 10.1 Supabase
- Auth: xác thực tài khoản
- PostgreSQL: lưu profile, trips, trip_requests, messages
- Storage: lưu ảnh thẻ KTX và các file upload

### 10.2 AI parsing
- Câu hỏi tự nhiên của người dùng được chuyển thành JSON gồm:
  - date
  - pickup_building
  - pickup_time
  - destination_school
  - class_period
- Nếu Gemini không phản hồi, hệ thống dùng regex fallback dành cho từ vựng sinh viên ĐHQG-HCM

### 10.3 Pricing & distance
- Ưu tiên tính toán khoảng cách thực tế với OSRM
- Nếu mất mạng hoặc API lỗi, có matrix fallback
- Giá được định nghĩa theo:
  - khoảng cách km
  - 2.000đ/km
  - tối thiểu 5.000đ

---

## 11. Dữ liệu địa lý và tuyến đường

Dự án dựa trên danh sách khu KTX và trường học đã được chuẩn hóa:

- Khu A và Khu B là điểm xuất phát chính
- Trường đại học thành viên bao gồm: HCMUS, HCMUT, UIT, USSH, IU, UEL
- Ngoài ra còn có nhiều trường khác trong dataset được dùng cho mở rộng hoặc mẫu dữ liệu dự phòng

Các bản ghi địa điểm và tuyến đường được quản lý qua CSV/seed data gốc, dạng:
- `danh_sach_locations.csv`
- `danh_sach_routes.csv`

Mỗi route có các thuộc tính: `route_code`, `start_area_code`, `destination_area_code`, `travel_mode`, `distance_meters`, `duration_seconds`, `provider`, `status`.

---

## 12. Những điểm cần lưu ý cho developer

- Thư mục `supabase/migrations/` hiện đang rỗng; cần có migration thật nếu triển khai production
- Nhiều mối quan hệ DB có thể đang lệch giữa docs và implementation thực tế
- Cần xác minh schema thật trên Supabase trước khi sửa DB hoặc thêm bảng mới
- RLS, authorization, và auth callback cần được kiểm tra kỹ trước khi deploy thực tế
- Nhiều file trong dữ liệu mô tả có thể là “theo kỳ vọng” thay vì “thực tế chạy trên DB”

---

## 13. Kết luận

Dự án KTX Carpooling có một nền tảng tốt với mô hình nghiệp vụ rõ ràng, tầng dữ liệu tách rành rẽ và UI hướng đến người dùng sinh viên. Tuy nhiên, trước khi đưa vào production, cần ưu tiên các vấn đề như:

- quyền admin và user authorization
- xác thực callback email và redirect
- schema database thật vs docs
- quản lý migrations và RLS
- kiểm tra tính nhất quán giữa code và dữ liệu đã chuẩn hóa

Đây là danh sách cần theo dõi để dự án trưởng thành hơn, dễ mở rộng và an toàn hơn cho người dùng thật.
