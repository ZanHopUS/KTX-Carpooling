# Báo cáo Kiểm thử & Đánh giá Codebase (Repository Audit)

Báo cáo tổng hợp kết quả phân tích hiện trạng mã nguồn, kiến trúc và nợ kỹ thuật (Technical Debt) dự án **KTX Carpooling**.

---

## 1. Kết quả Đánh giá Tổng quan

| Tiêu chí | Trạng thái | Ghi chú |
|---|---|---|
| **Framework & Core Libs** | ✅ Đạt | Next.js 16.3.5, React 19.2.8, Tailwind CSS v4, `@supabase/ssr` 0.12.7. |
| **Next.js 16 Compatibility** | ⚠️ Cần lưu ý | Đã dùng `await params` & `await cookies()`, nhưng Middleware bị đặt sai tên file. |
| **Cấu trúc `src/`** | ⚠️ Cần cải thiện | `src/components/` đang trống, các component chưa được mô-đun hóa. |
| **Bảo mật & Phân quyền** | 🔴 Nguy cơ cao | Server Actions của Admin chưa verify role; API route gọi sai tên bảng `users`. |
| **Database Migrations** | 🔴 Thiếu | Thư mục `supabase/migrations/` trống, `schema.sql` chỉ là ghi chú text. |

---

## 2. Chi tiết các Lỗi & Technical Debt Phát hiện

### 2.1 Middleware bị vô hiệu hóa do đặt sai tên file
- **Hiện trạng**: File cấu hình middleware hiện tại đặt tại [`src/proxy.ts`](file:///d:/CNTT/KTX%20Carpooling/ktx-carpooling/src/proxy.ts).
- **Vấn đề**: Next.js không nhận diện file `proxy.ts`. Do đó, Middleware bị bỏ qua hoàn toàn, các protected route như `/dashboard`, `/trips/create`, `/requests`, `/profile` không được bảo vệ từ Server Request level.
- **Khắc phục**: Đổi tên file thành `src/middleware.ts` và export function `middleware`.

### 2.2 Sai tên bảng trong API Endpoint Upload Thẻ KTX
- **Hiện trạng**: Trong [`src/app/api/verifications/route.ts`](file:///d:/CNTT/KTX%20Carpooling/ktx-carpooling/src/app/api/verifications/route.ts#L35):
  ```typescript
  await supabase.from('users').update({ ... })
  ```
- **Vấn đề**: Toàn bộ hệ thống sử dụng bảng `profiles`. Việc gọi tới bảng `users` sẽ sinh ra runtime error HTTP 500 khi sinh viên tải ảnh thẻ KTX lên.
- **Khắc phục**: Sửa tên bảng thành `profiles`.

### 2.3 Thiếu Phân quyền Admin trong Server Actions
- **Hiện trạng**: [`src/app/admin/verifications/actions.ts`](file:///d:/CNTT/KTX%20Carpooling/ktx-carpooling/src/app/admin/verifications/actions.ts#L10) chỉ kiểm tra `if (!user)` mà không kiểm tra `user.role === 'ADMIN'`.
- **Vấn đề**: Bất kỳ tài khoản sinh viên thông thường nào đã đăng nhập cũng có thể gửi request duyệt/từ chối hồ sơ thẻ KTX.
- **Khắc phục**: Thêm bước kiểm tra vai trò người dùng trước khi update DB.

### 2.4 Thư mục Auth Callback bị trống
- **Hiện trạng**: [`src/app/auth/callback`](file:///d:/CNTT/KTX%20Carpooling/ktx-carpooling/src/app/auth/callback) là thư mục rỗng.
- **Vấn đề**: Khi Supabase gửi email xác minh và người dùng bấm vào link redirect về `/auth/callback`, trang sẽ bị lỗi 404.
- **Khắc phục**: Tạo file `src/app/auth/callback/route.ts` xử lý `exchangeCodeForSession`.

---

## 3. Lộ trình Triển khai Task Đề xuất (Roadmap)

### Giai đoạn 1: Sửa lỗi Kiến trúc & Bảo mật (Bắt buộc)
1. **Task 1.1**: Đổi tên [`src/proxy.ts`](file:///d:/CNTT/KTX%20Carpooling/ktx-carpooling/src/proxy.ts) -> `src/middleware.ts` và đổi export function thành `middleware`.
2. **Task 1.2**: Tạo file `src/app/auth/callback/route.ts` xử lý Auth Callback PKCE code exchange.
3. **Task 1.3**: Sửa file [`src/app/api/verifications/route.ts`](file:///d:/CNTT/KTX%20Carpooling/ktx-carpooling/src/app/api/verifications/route.ts) đổi tên bảng `users` -> `profiles`.
4. **Task 1.4**: Bổ sung kiểm tra `role === 'ADMIN'` trong [`src/app/admin/verifications/actions.ts`](file:///d:/CNTT/KTX%20Carpooling/ktx-carpooling/src/app/admin/verifications/actions.ts).
5. **Task 1.5**: Chuẩn hóa file Migration DDL trong `supabase/migrations/20260920000000_init_schema.sql`.

### Giai đoạn 2: Refactor Components & Tối ưu UI
6. **Task 2.1**: Xây dựng UI component tái sử dụng tại `src/components/ui/`.
7. **Task 2.2**: Tách các Client Component lớn thành các sub-component nhỏ gọn.

### Giai đoạn 3: Hoàn thiện Chức năng Nghiệp vụ
8. **Task 3.1**: Implement tính năng Đánh giá sao & Bình luận (`ratings`).
9. **Task 3.2**: Implement tính năng Báo cáo chuyến đi (`trip_reports`).
10. **Task 3.3**: Hoàn thiện Messenger Bot Integration.
