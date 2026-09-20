# ARCHITECTURE — KTX Carpooling

> Kiến trúc **như đang được cài đặt** (as-is), không phải kiến trúc mong muốn.
> Bằng chứng: cấu trúc thư mục `src/`, `package.json`, `src/proxy.ts`.

---

## 1. Stack công nghệ (VERIFIED từ `package.json`)

| Lớp | Công nghệ | Phiên bản |
|---|---|---|
| Framework | Next.js (App Router) | **16.3.5** |
| UI | React | 19.2.8 |
| Ngôn ngữ | TypeScript (strict) | 5.x |
| Styling | Tailwind CSS v4 + CSS variables | v4 |
| Backend/Auth/DB | Supabase (`@supabase/ssr`, `@supabase/supabase-js`) | ^0.12.7 / ^2.116.0 |
| AI | Google Gemini 1.5 Flash (REST) | — |
| Bản đồ/định tuyến | OSRM (`router.project-osrm.org`) | — |
| Triển khai dự kiến | Vercel (`public/vercel.svg`) | — |

### ⚠️ Quy ước Next.js 16 bắt buộc
- **`middleware.ts` đã bị thay bằng `proxy.ts`** (Next.js 16). Dự án làm ĐÚNG.
- `params` và `cookies()` là **async** — phải `await`.
- Nguồn chính thức: `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md`.

---

## 2. Sơ đồ tầng

```
┌───────────────────────────────────────────────────────────┐
│  BROWSER                                                  │
│  - Landing page (SSR tĩnh) — src/app/page.tsx             │
│  - Client Components ('use client'): form/chat/search     │
└───────────────┬───────────────────────────────────────────┘
                │ fetch / form submit / Server Action
┌───────────────▼───────────────────────────────────────────┐
│  PROXY (src/proxy.ts)  ← thay cho middleware.ts            │
│  - Refresh session Supabase                               │
│  - Chặn route bảo vệ: /dashboard /trips/create            │
│    /requests /profile                                     │
│  - Bỏ qua POST Server Action (header 'next-action')       │
└───────────────┬───────────────────────────────────────────┘
                │
┌───────────────▼───────────────────────────────────────────┐
│  NEXT.JS APP ROUTER                                       │
│  ├─ (auth)/   login, register       [công khai]           │
│  ├─ (main)/   dashboard, trips, requests, profile         │
│  ├─ admin/    verifications         [⚠️ không chặn]       │
│  └─ api/      ai/*, verifications, webhooks/messenger     │
└───────────────┬───────────────────────────────────────────┘
                │
   ┌────────────┼─────────────────┬──────────────────┐
   ▼            ▼                 ▼                  ▼
┌────────┐ ┌──────────┐  ┌──────────────┐  ┌──────────────┐
│Supabase│ │ Supabase │  │ lib/pricing  │  │  lib/ai.ts   │
│  Auth  │ │ Postgres │  │  OSRM        │  │ Gemini REST  │
│(OTP,   │ │ + Storage│  │  DISTANCE_   │  │ + regex      │
│ SSR)   │ │ + RLS    │  │  MATRIX      │  │ fallback     │
└────────┘ └──────────┘  └──────────────┘  └──────────────┘
```

---

## 3. Cấu trúc route

| Route | Loại | Bảo vệ | Ghi chú |
|---|---|---|---|
| `/` | Server Component | — | Landing page marketing |
| `/login`, `/register` | Client Component | Ngược: đã đăng nhập → `/dashboard` | |
| `/dashboard` | Server Component | Proxy + `getUser()` | Thống kê cá nhân |
| `/trips` | Server + Client | — | Tìm chuyến, xếp hạng client-side |
| `/trips/create` | Server + Client | Proxy | Form đăng chuyến |
| `/trips/[id]` | Server Component | — | Chi tiết + form yêu cầu |
| `/trips/[id]/chat` | Server Component | ✅ Driver hoặc passenger ACCEPTED | Kiểm tra đúng |
| `/requests` | Server + Client | Proxy | Tab nhận/gửi |
| `/profile` | Server Component | Proxy + `getUser()` | |
| `/profile/verify` | Server + Client | Proxy + `getUser()` | Upload thẻ KTX |
| `/admin` | Server Component | ❌ **KHÔNG** | Lỗi #3.2 |
| `/admin/verifications` | Server + Client | ⚠️ Chỉ kiểm tra đăng nhập | Lỗi #3.2 |
| `/api/ai/search` | Route Handler | ❌ Không | Lỗi #3.16 |
| `/api/ai/parse-intent` | Route Handler | ❌ Không | Lỗi #3.16 |
| `/api/verifications` | Route Handler | ✅ Có `getUser()` | Nhưng dùng bảng `users` (lỗi #3.1) |
| `/api/webhooks/messenger` | Route Handler | ⚠️ Chỉ verify token GET | Thiếu chữ ký POST (#3.15) |
| `/auth/callback` | — | — | **THƯ MỤC RỖNG** ⇒ 404 (#3.8) |

---

## 4. Luồng dữ liệu & mutation

### 4.1 Server Actions (đường mutation chính)
| File | Actions | Kiểm tra uỷ quyền |
|---|---|---|
| `(auth)/actions.ts` | `loginAction`, `registerAction`, `verifyOtpAction`, `resendOtpAction`, `signOutAction` | — |
| `(main)/trips/actions.ts` | `createTripAction` | Chỉ đăng nhập |
| `trips/[id]/actions.ts` | `createTripRequestAction` | Chỉ đăng nhập (tự chặn tự-request) |
| | `acceptTripRequestAction` | ✅ `driver_id === user.id` |
| | `rejectTripRequestAction` | ❌ **KHÔNG có** (#3.3) |
| | `cancelTripRequestAction` | ✅ Lọc theo `passenger_id` |
| `trips/[id]/chat/actions.ts` | `sendMessageAction` | ❌ **KHÔNG** (#3.5) |
| | `updateTripStatusAction` | ❌ **KHÔNG** (#3.4) |
| | `submitRatingAction` | ❌ Chỉ đăng nhập (#3.6) |
| `(main)/profile/actions.ts` | `uploadDormCardAction` | Chỉ đăng nhập |
| `admin/verifications/actions.ts` | `approveVerificationAction`, `rejectVerificationAction` | ❌ **KHÔNG có ADMIN** (#3.2) |

### 4.2 Mẫu truy cập dữ liệu
- **Đọc**: Server Component gọi `createClient()` (`src/utils/supabase/server.ts`) với `await cookies()`.
- **Ghi**: Server Action, sau đó `revalidatePath()`.
- **Client**: `src/utils/supabase/client.ts` (chỉ dùng cho auth state).
- **Chat**: không realtime — gửi action rồi cập nhật state cục bộ.
- **RLS**: `createServerClient` dùng **anon key** ⇒ **RLS là tuyến phòng thủ duy nhất ở tầng DB**. Nếu RLS chưa bật/đúng, mọi lỗ hổng mục 3 đều khai thác được.

---

## 5. Module nghiệp vụ

| Module | Vai trò | Test độc lập được? |
|---|---|---|
| `lib/matching.ts` | Lọc + chấm điểm ghép chuyến | ✅ Hàm thuần |
| `lib/pricing.ts` | Toạ độ, ma trận khoảng cách, OSRM, tính giá, format VND | ⚠️ Có gọi mạng (OSRM) |
| `lib/ai.ts` | Parse ngôn ngữ tự nhiên (Gemini + regex fallback) | ⚠️ Có gọi mạng |
| `lib/messenger.ts` | Thông báo Messenger | ❌ Stub |
| `utils/constants.ts` | Hằng số miền: KTX, trường, trạng thái, giá, whitelist email | ✅ Hằng số |

---

## 6. Quy ước code đang dùng

- **Ngôn ngữ**: TypeScript strict; path alias `@/*` → `./src/*`.
- **Component**: Server Component mặc định, `'use client'` khi cần state.
- **Styling**: Tailwind utility + CSS variables trong `globals.css`; class `.btn`, `.form-input`, `.card`, `.badge`.
- **Ngôn ngữ UI**: tiếng Việt. Định danh code: tiếng Anh.
- **Trạng thái**: literal chữ HOA trong code (`'OPEN'`, `'ACCEPTED'`, `'VERIFIED'`).
- **Comment**: tiếng Việt có dấu, phân khối bằng `───`.

---

## 7. Rủi ro kiến trúc đã nhận diện

| # | Rủi ro | Ảnh hưởng |
|---|---|---|
| A1 | **RLS là tuyến phòng thủ duy nhất** ở tầng DB, nhưng trạng thái thật của RLS là `UNKNOWN` | Nếu RLS sai, toàn bộ lỗ hổng mục 3 thành khai thác thật |
| A2 | Uỷ quyền nằm rải rác trong từng server action, không tập trung | Bỏ sót như #3.3–#3.6; khó kiểm toán |
| A3 | Không có tầng service/repository — logic DB gọi trực tiếp trong page/action | Khó test, khó tái sử dụng |
| A4 | Không có migration trong repo ⇒ schema không có nguồn sự thật | Không thể tái lập môi trường, không thể review thay đổi schema |
| A5 | Hai luồng upload thẻ KTX cạnh tranh | Không rõ luồng nào là chính thức; sửa một luồng dễ bỏ sót luồng kia |
| A6 | Không có tầng kiểm thử (0 file test) | Mọi thay đổi đều rủi ro hồi quy |
| A7 | Ghép chuyến chạy hoàn toàn ở client | Không kiểm soát được kết quả; khó mở rộng phân trang/phân quyền |
| A8 | `proxy.ts` không chặn `/admin` | Phụ thuộc hoàn toàn vào kiểm tra trong từng page (đang thiếu) |
