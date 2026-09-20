# Hướng dẫn Sử dụng & Phát triển — KTX Carpooling

Tài liệu chi tiết hướng dẫn cài đặt, cấu hình môi trường, quy trình phát triển và luồng sử dụng ứng dụng **KTX Carpooling**.

---

## 1. Hướng dẫn Cài đặt & Khởi chạy

### 1.1 Tải mã nguồn & Cài đặt Thư viện
```bash
# Clone repository
git clone <repository-url>
cd ktx-carpooling

# Cài đặt dependencies
npm install
```

### 1.2 Cấu hình Biến môi trường (`.env.local`)
Tạo file `.env.local` tại thư mục gốc dự án với các thông số sau:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>

# AI Search Configuration (Google Gemini)
GEMINI_API_KEY=<your-gemini-api-key>

# Facebook Messenger Webhook Configuration (Option)
MESSENGER_VERIFY_TOKEN=<your-custom-verify-token>
MESSENGER_PAGE_ACCESS_TOKEN=<your-page-access-token>
```

### 1.3 Lệnh khởi chạy
```bash
# Khởi chạy môi trường Dev (Port 3000)
npm run dev

# Kiểm tra Linter
npm run lint

# Build bản Production
npm run build
npm run start
```

---

## 2. Các Quy định Quy chuẩn Code (Development Conventions)

### 2.1 Tuân thủ Quy chuẩn Next.js 16 (App Router)
- **`params` & `searchParams` trong Page**: Trong Next.js 16, `params` và `searchParams` là `Promise`. Cần `await params` trong Server Component hoặc `use(params)` trong Client Component.
  ```tsx
  export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    // ...
  }
  ```
- **Cookies**: Hàm `cookies()` từ `next/headers` là async function, phải dùng `await cookies()`.
- **Middleware**: Phải đặt tại `src/middleware.ts` và `export function middleware(request: NextRequest)`.

---

## 3. Quy trình Nghiệp vụ Người dùng (User Workflows)

### 3.1 Luồng Đăng ký & Xác minh Email Sinh viên
1. Sinh viên nhập Email trường (`@student.hcmus.edu.vn`, `@st.hcmut.edu.vn`...).
2. Đăng ký thông tin KTX (Khu A / Khu B, tòa nhà) và vai trò (`DRIVER`, `PASSENGER`, `BOTH`).
3. Nhập mã OTP 6 chữ số gửi về email sinh viên để kích hoạt tài khoản.

### 3.2 Luồng Đăng chuyến đi (Tài xế)
1. Truy cập `/trips/create`.
2. Chọn điểm đón (Khu KTX, Tòa nhà, Điểm hẹn chi tiết).
3. Chọn trường đại học và cơ sở học.
4. Chọn ngày đi, giờ xuất phát và giờ vào lớp.
5. Hệ thống tự động tính khoảng cách km và gợi ý mức giá.
6. Xác nhận đăng chuyến (`status: OPEN`).

### 3.3 Luồng Tìm chuyến & Gửi yêu cầu đi cùng (Hành khách)
1. Truy cập `/trips` hoặc nhập câu hỏi tìm kiếm bằng AI ở góc trên.
2. Danh sách chuyến đi hiển thị cùng phần trăm điểm khớp (Match Score %).
3. Bấm xem chi tiết chuyến `/trips/[id]`, gửi câu hỏi/lời nhắn và bấm **Gửi yêu cầu đi cùng**.
4. Tài xế nhận thông báo tại `/requests`, bấm **Chấp nhận** hoặc **Từ chối**.
5. Sau khi chấp nhận, hệ thống mở phòng Chat trực tiếp `/trips/[id]/chat`.

---

## 4. Quy trình Quản trị viên (Admin Workflow)
1. Đăng nhập tài khoản Admin và truy cập `/admin/verifications`.
2. Kiểm tra danh sách sinh viên đã tải ảnh thẻ KTX (`PENDING`).
3. Đối chiếu ảnh thẻ KTX với thông tin đăng ký.
4. Bấm **Duyệt hồ sơ** (`VERIFIED`) hoặc **Từ chối** (`REJECTED`) kèm lý do.
