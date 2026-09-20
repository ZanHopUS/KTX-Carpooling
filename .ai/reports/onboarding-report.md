# BÁO CÁO ONBOARDING — KTX Carpooling

- **Ngày thực hiện:** 2026-09-20
- **Người thực hiện:** Qoder (Orchestrator / Navigator / Reviewer)
- **Phạm vi:** Toàn bộ repository `ktx-carpooling` + tài liệu `docs/` + trạng thái DB (gián tiếp)
- **Chế độ:** **READ-ONLY** — không sửa source code, không sửa DB, không chạy migration
- **Kết quả:** Hoàn thành — Knowledge base `.ai/` đã được tạo, TASK-001 ở trạng thái `READY` (chưa thực thi)

---

## 1. TÓM TẮT ĐIỀU HÀNH

KTX Carpooling là ứng dụng web ghép chuyến xe máy cho sinh viên nội trú KTX Khu A & Khu B (ĐHQG TP.HCM),
xây dựng trên Next.js 16 App Router + Supabase (PostgreSQL + Auth + Storage), triển khai theo mô hình
Server Action với xác thực qua Supabase Auth.

**Đánh giá tổng quan:** Dự án có **khung nghiệp vụ đầy đủ và nhận diện thương hiệu rõ ràng** (design
system hoàn chỉnh, luồng chính đã chạy được), nhưng **nền tảng chưa an toàn để vận hành thật** vì ba
nhóm vấn đề chồng lên nhau:

1. **Bảo mật/uỷ quyền** — 5 Server Action thiếu kiểm tra quyền sở hữu; 2 route admin không có kiểm tra
   quyền truy cập; 2 endpoint API không yêu cầu xác thực.
2. **Auth & onboarding bị chặn** — route callback xác minh email **rỗng** (link trong email 404), một
   URL redirect bị hardcode `localhost`, một API gọi sai bảng (`users` thay vì `profiles`) gây lỗi 500,
   và **không có đường tạo tài khoản ADMIN** nào trong hệ thống.
3. **Nền dữ liệu mất kiểm soát** — thư mục `supabase/migrations/` **rỗng**, `schema.sql` chỉ là comment,
   file migration được tham chiếu (`migrations/20260916_align_ktx_schema.sql`) **không tồn tại**; có
   xung đột tên cột giữa code và tài liệu; 13 sự kiện DB ở trạng thái **UNKNOWN**.

**Điểm nghiêm trọng nhất về mặt kỹ thuật:** không thể tái lập cơ sở dữ liệu từ repository. Bất kỳ thay
đổi nào liên quan dữ liệu hiện đều là thao tác mù.

---

## 2. PHẠM VI & PHƯƠNG PHÁP ONBOARDING

| Hoạt động | Đã thực hiện | Ghi chú |
|-----------|--------------|---------|
| Đọc toàn bộ source code | ✅ | `src/**`, cấu hình, `package.json` |
| Đọc tài liệu dự án | ✅ | `docs/**`, `supabase/schema.sql`, `agents.md` |
| Đối chiếu docs ↔ implementation | ✅ | Bảng đối chiếu đầy đủ trong `project-state.md` |
| Đối chiếu implementation ↔ DB | ⚠️ Một phần | DB không truy cập được ⇒ phân loại 4 trạng thái |
| Đọc tài liệu chính thức của framework | ✅ | `node_modules/next/dist/docs/` (bắt buộc theo `agents.md`) |
| Sửa code / DB / chạy migration | ❌ **Không** | Tuân thủ tuyệt đối ràng buộc onboarding |
| Thực thi TASK-001 | ❌ **Không** | Chỉ tạo ở trạng thái `READY` |

**Nguyên tắc áp dụng:** khi nguồn mâu thuẫn, ghi nhận cả hai phía và **không tự phán quyết**. Mọi kết
luận đều kèm bằng chứng dạng `file:line`. Những gì không kiểm chứng được thì đánh dấu **UNKNOWN**,
không suy đoán.

---

## 3. HIỂU BIẾT DỰ ÁN (PROJECT UNDERSTANDING)

**Bài toán:** Sinh viên ở KTX Khu A/Khu B di chuyển đến các trường đại học trong khu vực bằng xe máy,
phần lớn đi một mình. Ứng dụng tạo cơ chế ghép chuyến giữa **tài xế** (người có xe) và **hành khách**
(người cần đi), chia sẻ chi phí, có xác minh thẻ KTX để tăng độ tin cậy.

**Người dùng & vai trò:**

| Vai trò | Mô tả | Có đường đăng ký? |
|---------|-------|-------------------|
| `PASSENGER` | Hành khách — tìm chuyến, gửi yêu cầu ghép | ✅ |
| `DRIVER` | Tài xế — đăng chuyến, duyệt yêu cầu | ✅ |
| `BOTH` | Vừa đi vừa chở (mặc định khi đăng ký) | ✅ (default) |
| `ADMIN` | Quản trị — duyệt xác minh thẻ KTX | ❌ **Không có đường tạo** |

**Địa bàn:** KTX Khu A (toà A1–A5), KTX Khu B (toà B1–B5); 6 trường: HCMUS, HCMUT, UIT, USSH, IU, UEL.

**Luồng nghiệp vụ chính:**

1. Đăng ký → xác minh OTP email → tạo hồ sơ.
2. Xác minh thẻ KTX (tải ảnh) → admin duyệt → nhận huy hiệu đã xác minh.
3. Tài xế đăng chuyến (ngày, giờ, điểm đón, điểm đến, số ghế, giá gợi ý).
4. Hành khách tìm chuyến → hệ thống matching & xếp hạng → gửi yêu cầu ghép.
5. Tài xế chấp nhận/từ chối → hai bên chat → hoàn thành chuyến → đánh giá.

**Quy tắc nghiệp vụ đã cam kết (đã xác minh trong code):**

| Quy tắc | Giá trị | Vị trí |
|---------|---------|--------|
| Giá mỗi km | 2.000 VNĐ | `src/utils/pricing.ts` |
| Giá tối thiểu | 5.000 VNĐ | `src/utils/pricing.ts` |
| Công thức | `max(km × 2000, 5000)` | `src/utils/pricing.ts` |
| Điểm matching: cùng trường | +40 | `src/utils/matching.ts` |
| Cùng cơ sở (campus) | +25 | `src/utils/matching.ts` |
| Chênh giờ ≤ 15 phút | +25 | `src/utils/matching.ts` |
| (mức thấp hơn) | +20 / +10 | `src/utils/matching.ts` |
| Điểm uy tín | +10 | `src/utils/matching.ts` |
| Khoảng cách | OSRM thật, fallback `DISTANCE_MATRIX` | module khoảng cách |

---

## 4. KIẾN TRÚC HỆ THỐNG

```
┌────────────────────────────────────────────────────────────┐
│  Browser (React 19 / Next.js App Router)                   │
│  - Server Components đọc dữ liệu trực tiếp qua Supabase    │
│  - Server Actions xử lý mutation ('use server')            │
└───────────────────────────┬────────────────────────────────┘
                            │  anon key + session cookie
┌───────────────────────────▼────────────────────────────────┐
│  Next.js Server (proxy.ts — Next 16, tên mới của middleware)│
│  - refresh session                                          │
└───────────────────────────┬────────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────────┐
│  Supabase                                                   │
│  - Auth (email/password + OTP 6 số)                         │
│  - PostgreSQL + RLS  ← lớp phòng thủ DUY NHẤT ở tầng DB      │
│  - Storage (bucket thẻ KTX)                                 │
└─────────────────────────────────────────────────────────────┘
        │                          │
        ▼                          ▼
   OSRM (khoảng cách)        Gemini 1.5 Flash (parse NL)
```

**Điểm kiến trúc cần lưu ý:**

- `src/proxy.ts` là **đúng chuẩn Next.js 16** (framework đã đổi tên `middleware.ts` → `proxy.ts`).
  Phát hiện trong audit nói ngược lại là **đã lỗi thời**.
- Client dùng **anon key** ⇒ **RLS là lớp bảo vệ duy nhất ở tầng DB**. Vì trạng thái RLS hiện `UNKNOWN`,
  mọi lỗ hổng uỷ quyền ở tầng application đều trở thành rủi ro trực tiếp.
- Không có tầng service/repository: logic truy vấn nằm rải trong Server Component và Server Action.

---

## 5. TECH STACK

| Thành phần | Phiên bản / Ghi chú |
|-----------|---------------------|
| Next.js | 16.3.5 (App Router) — **`middleware.ts` đã đổi tên thành `proxy.ts`** |
| React | 19.2.8 |
| TypeScript | 5.x, chế độ strict |
| Tailwind CSS | v4 (`@import "tailwindcss"` + `@theme inline`) |
| Supabase | `@supabase/supabase-js` ^2.116.0, `@supabase/ssr` ^0.12.7 |
| Font | Be Vietnam Pro (Google Fonts) |
| Dịch vụ ngoài | OSRM (`router.project-osrm.org`), Gemini 1.5 Flash, webhook Messenger (placeholder) |

---

## 6. BẢN ĐỒ MODULE

| Khu vực | Vai trò |
|---------|---------|
| `src/app/(auth)/` | Đăng nhập, đăng ký + luồng OTP |
| `src/app/(main)/` | Khu vực sau đăng nhập: dashboard, trips, profile, chat |
| `src/app/admin/` | Khu quản trị: duyệt xác minh thẻ KTX |
| `src/app/api/` | Route Handler: verifications, webhook, các API phụ trợ |
| `src/utils/supabase/` | Client Supabase cho server/browser + xử lý session |
| `src/utils/` | `constants.ts` (danh mục), `pricing.ts`, `matching.ts` |
| `src/lib/` | Tích hợp ngoài (`gemini.ts`) |
| `src/types/` | Định nghĩa kiểu dữ liệu (`database.ts`) |
| `src/proxy.ts` | Refresh session (Next 16) |
| `supabase/` | `schema.sql` (chỉ comment) + `migrations/` (**rỗng**) |

---

## 7. CƠ SỞ DỮ LIỆU — PHÂN LOẠI 4 TRẠNG THÁI

| Trạng thái | Nội dung |
|-----------|----------|
| **DOCUMENTED** | `schema.sql` là file comment liệt kê bảng/cột; `docs/` mô tả lược đồ |
| **ACTUAL** | ❓ **Không thể truy cập** — không có kết nối DB, không có `psql`, không có migration |
| **EXPECTED** | `profiles`, `trips`, `trip_requests`, `messages`, `ratings`, `trip_reports` + storage bucket |
| **UNKNOWN** | 13 sự kiện — xem §13 |

**Ba sự thật quyết định:**

1. `supabase/migrations/` **rỗng hoàn toàn** (0 file) ⇒ không thể tái lập DB từ repo.
2. `supabase/schema.sql` **chỉ có 29 dòng comment**, ghi rõ "File này chỉ là tài liệu (không chạy đè
   lên DB đã có bảng)" ⇒ **không có DDL chạy được**.
3. File migration mà chính `schema.sql` tham chiếu — `migrations/20260916_align_ktx_schema.sql` —
   **không tồn tại** trong repository.

**Xung đột lược đồ quan trọng nhất:**

| Khía cạnh | Code đang dùng | `schema.sql` ghi | Tác động |
|-----------|----------------|------------------|----------|
| Ngày chuyến đi | `trips.date` | `trips.trip_date` | 🔴 Cao — sai tên cột ⇒ truy vấn lỗi hoặc ghi sai chỗ |
| Trạng thái tài khoản | `profiles.status` | `profiles.account_status` | 🟡 TB |
| Giá trị enum role | Form gửi **CHỮ HOA** (`DRIVER`/`PASSENGER`/`BOTH`) | ghi **chữ thường** (`driver`/`passenger`/`both`) | 🔴 Cao — so sánh chuỗi sai ⇒ logic phân quyền sai |
| Trạng thái xác minh | `profiles.dorm_card_verified` | có thêm giá trị `NEED_REVIEW` | 🟡 TB |
| Cột lịch sử | — | `profiles.school`, `profiles.verification_status` | 🟢 Thấp — cột cũ, code không dùng |

> ⚠️ Bằng chứng cho thấy nhánh enum-case **đang là vấn đề thật**: `src/utils/matching.ts` phải gọi
> `.toUpperCase()` một cách phòng thủ, trong khi form đăng ký gửi chữ hoa. Một hệ thống phải tự
> "chống đỡ" dữ liệu của chính nó là dấu hiệu của xung đột chưa được giải quyết.

**RLS:** tài liệu ghi có policy và hai hàm helper `is_admin()`, `is_verified_user()` — nhưng **không
nơi nào trong code gọi hai helper này**, và không thể xác minh policy có thực sự tồn tại. Trạng thái:
**DOCUMENTED nhưng CHƯA XÁC MINH**.

**Storage:** có ghi nhận bucket `dorm-cards` ở chế độ **PUBLIC** trong khi có bucket
`verification_docs` — ảnh thẻ KTX là dữ liệu cá nhân, để public là rủi ro riêng tư. Cần xác minh.

---

## 8. TRẠNG THÁI TÍNH NĂNG

Ký hiệu: ✅ Hoàn chỉnh · 🟡 Một phần · 🔴 Chưa có / Hỏng

| Mã | Tính năng | Trạng thái | Ghi nhận |
|----|-----------|-----------|----------|
| F01 | Đăng ký tài khoản + OTP email | 🟡 | Luồng có, nhưng bị chặn bởi callback rỗng |
| F02 | Đăng nhập / đăng xuất | ✅ | Hoạt động |
| F03 | Quản lý hồ sơ cá nhân | 🟡 | Xem/sửa cơ bản |
| F04 | Xác minh thẻ KTX (tải ảnh) | 🟡 | Có form; **2 luồng upload trùng lặp** |
| F05 | Admin duyệt xác minh | 🔴 | Màn hình có, nhưng **không kiểm tra quyền admin** |
| F06 | Tài xế đăng chuyến | ✅ | Có tính giá & khoảng cách tự động |
| F07 | Tìm chuyến + matching | 🟡 | Thuật toán có; `pickup_score` không bao giờ được gán ⇒ điểm tối đa 75/100 |
| F08 | Gửi yêu cầu ghép chuyến | ✅ | Có |
| F09 | Chấp nhận / từ chối yêu cầu | 🟡 | Chấp nhận đúng; **từ chối thiếu kiểm tra quyền** |
| F10 | Chat giữa tài xế & hành khách | 🟡 | Gửi/nhận được; **thiếu kiểm tra quyền**; không realtime |
| F11 | Đổi trạng thái chuyến đi | 🟡 | **Thiếu kiểm tra quyền** |
| F12 | Đánh giá sau chuyến | 🔴 | Có form; không cập nhật điểm tổng, không chống trùng |
| F13 | Báo cáo vi phạm | 🔴 | Chỉ có type chết, không có tính năng |
| F14 | Thông báo | 🔴 | Không có |

---

## 9. AUTHENTICATION & AUTHORIZATION

**Xác thực (authentication):** ✅ Hoạt động — Supabase Auth email/password, session refresh qua
`src/proxy.ts`, kiểm tra `getUser()` ở mọi Server Action.

**Uỷ quyền (authorization):** ❌ **Đây là điểm yếu nghiêm trọng nhất của hệ thống.**

| # | Vị trí | Vấn đề | Mức |
|---|--------|--------|-----|
| 1 | `trips/[id]/actions.ts:118` `rejectTripRequestAction` | Chỉ kiểm tra `!user`; không xác minh người gọi là tài xế của chuyến | 🔴 |
| 2 | `trips/[id]/chat/actions.ts:7` `sendMessageAction` | Chỉ kiểm tra `!user` và nội dung; không xác minh thuộc chuyến | 🔴 |
| 3 | `trips/[id]/chat/actions.ts:30` `updateTripStatusAction` | Chỉ kiểm tra `!user`; không xác minh là tài xế | 🔴 |
| 4 | `src/app/admin/page.tsx` | **Không có bất kỳ kiểm tra đăng nhập/quyền nào** | 🔴 |
| 5 | `src/app/admin/verifications/**` | Không kiểm tra vai trò ADMIN | 🔴 |
| 6 | API route xác minh | Không xác thực người gọi | 🔴 |
| 7 | `src/proxy.ts` (matcher) | Cần xác minh phạm vi route được bảo vệ | 🟡 |
| 8 | `submitRatingAction` | Chỉ kiểm tra `!user`; không xác minh đã tham gia chuyến | 🟡 |

**Bằng chứng tích cực (mẫu code đúng đã có trong repo):**

- `src/app/(main)/trips/[id]/actions.ts:86` — `if (!trip || trip.driver_id !== user.id)` ✅
- `src/app/(main)/trips/[id]/actions.ts:154` — `.eq('passenger_id', user.id)` ✅
- `src/app/(main)/trips/[id]/chat/page.tsx:39` — `if (!isDriver && acceptedReq?.passenger_id !== user.id)` ✅

⇒ Vấn đề **không phải thiếu kiến thức** mà là **thiếu tính nhất quán**. Đây là lý do TASK-001 có thể
được thực thi với rủi ro thấp: chỉ cần áp dụng mẫu đã có.

**Lỗ hổng bổ sung:** không có đường tạo tài khoản `ADMIN` trong hệ thống ⇒ hoặc tài khoản admin được
tạo thủ công trong DB, hoặc tính năng quản trị hoàn toàn không dùng được.

---

## 10. PHÁT HIỆN NGHIÊM TRỌNG (CRITICAL FINDINGS)

| # | Phát hiện | Bằng chứng | Mức | EPIC |
|---|-----------|-----------|-----|------|
| C-01 | 3 Server Action thiếu kiểm tra uỷ quyền | `actions.ts:118`, `chat/actions.ts:7,30` | 🔴 | EPIC-01 |
| C-02 | Trang admin + màn hình duyệt không kiểm tra quyền | `src/app/admin/page.tsx`, `admin/verifications/**` | 🔴 | EPIC-01 |
| C-03 | Route callback xác minh email **rỗng** ⇒ link trong email 404 | `src/app/auth/callback/` (thư mục trống) | 🔴 | EPIC-02 |
| C-04 | `supabase/migrations/` **rỗng hoàn toàn** | 0 file | 🔴 | EPIC-03 |
| C-05 | `schema.sql` chỉ có comment; file migration được tham chiếu **không tồn tại** | `supabase/schema.sql` | 🔴 | EPIC-03 |
| C-06 | Xung đột `trips.date` (code) vs `trips.trip_date` (tài liệu) | code vs `schema.sql` | 🔴 | EPIC-03 |
| C-07 | Xung đột chữ hoa/thường của enum role | form đăng ký vs `schema.sql` | 🔴 | EPIC-03 |
| C-08 | API xác minh gọi bảng `users` (không tồn tại) ⇒ lỗi 500 | `src/app/api/verifications/route.ts:35` | 🔴 | EPIC-02 |
| C-09 | Redirect hardcode `localhost` ⇒ hỏng trên môi trường thật | luồng auth | 🟡 | EPIC-02 |
| C-10 | Bucket thẻ KTX ở chế độ PUBLIC ⇒ rò rỉ dữ liệu cá nhân | ghi nhận trong tài liệu | 🔴 | EPIC-02/03 |
| C-11 | Không thể tái lập cơ sở dữ liệu từ repository | tổng hợp C-04 + C-05 | 🔴 | EPIC-03 |

---

## 11. DANH SÁCH DEFECT

Ngoài các phát hiện nghiêm trọng ở §10, các lỗi chức năng đã ghi nhận:

| # | Lỗi | Vị trí | Mức |
|---|-----|--------|-----|
| D-01 | `pickup_score` khai báo nhưng **không bao giờ được gán** ⇒ điểm matching tối đa thực tế 75/100 | `src/utils/matching.ts` | 🟡 |
| D-02 | Điểm đón (`dormArea`) **không nằm trong tiêu chí** lọc matching | `src/utils/matching.ts` | 🟡 |
| D-03 | `campus` lưu dưới dạng **chỉ số mảng** thay vì giá trị ⇒ dễ sai khi danh mục đổi | luồng tạo chuyến | 🟡 |
| D-04 | Logic matching chạy ở **client** ⇒ có thể bị can thiệp | trang tìm chuyến | 🟡 |
| D-05 | Khối "tìm kiếm nhanh" ở trang chủ **không hoạt động** (không handler, không API) | landing page | 🟢 |
| D-06 | So sánh trạng thái **phân biệt chữ hoa/thường** rải rác | nhiều nơi | 🟡 |
| D-07 | `available_seats` bị **hardcode = 1** ở một số luồng | luồng tạo chuyến | 🟡 |
| D-08 | Sau khi chuyến bị huỷ, trạng thái **không trở về `OPEN`** | luồng huỷ | 🟡 |
| D-09 | Đánh giá **không cập nhật điểm uy tín tổng**, **không chống đánh giá trùng** | `submitRatingAction` | 🟡 |
| D-10 | **Không có thông báo** cho tài xế khi có yêu cầu mới | toàn hệ thống | 🟡 |
| D-11 | Không có chức năng **tài xế huỷ chuyến** | luồng chuyến đi | 🟡 |
| D-12 | Chat **không realtime** — phải tải lại trang | trang chat | 🟢 |
| D-13 | Các bộ đếm `*_trip_count` **không bao giờ được tăng** | hồ sơ người dùng | 🟡 |
| D-14 | **Không thực thi** yêu cầu xác minh thẻ KTX trước khi đăng chuyến/tham gia | toàn hệ thống | 🔴 |
| D-15 | Hai **luồng tải ảnh xác minh trùng lặp** | `profile/verify` + API | 🟡 |
| D-16 | Type `Rating` và `TripReport` **chết** — không nơi nào dùng | `src/types/database.ts:62,72` | 🟢 |
| D-17 | RPC `accept_trip_request(uuid)` và helper `is_admin()`, `is_verified_user()` **được tài liệu hoá nhưng không được gọi** | `schema.sql` | 🟡 |

---

## 12. XUNG ĐỘT TÀI LIỆU ↔ CODE ↔ DATABASE

> Theo `constitution.md` §2, các xung đột dưới đây **không được tự giải quyết**. Mỗi mục nêu rõ:
> Nguồn A, Nguồn B, thực tế triển khai, tác động, và quyết định cần có.

### XĐ-01 — Middleware vs Proxy (⚠️ tài liệu SAI, không phải code sai)

| | |
|---|---|
| **Nguồn A** | `docs/audit/repository-audit.md` §2.1: "phải đổi `src/proxy.ts` thành `src/middleware.ts`" |
| **Nguồn B** | Tài liệu chính thức Next.js 16 trong `node_modules/next/dist/docs/`: **`middleware.ts` đã bị đổi tên thành `proxy.ts`** |
| **Thực tế** | Code dùng `src/proxy.ts` |
| **Kết luận** | ✅ **Code ĐÚNG, audit SAI (lỗi thời)** |
| **Tác động** | Nếu tin theo audit và "sửa" ⇒ **làm hỏng hệ thống auth** |
| **Quyết định** | Không cần PO quyết định — đã xác minh bằng tài liệu framework. **Đề xuất: đánh dấu audit report là đã lỗi thời.** |

### XĐ-02 — `trips.date` vs `trips.trip_date` 🔴

| | |
|---|---|
| **Nguồn A** | Code hiện tại dùng `trips.date` |
| **Nguồn B** | `supabase/schema.sql` ghi `trips.trip_date` |
| **Thực tế DB** | ❓ **UNKNOWN** — không thể xác minh |
| **Tác động** | Nếu DB thật dùng `trip_date` ⇒ truy vấn theo ngày **lỗi runtime** hoặc trả rỗng |
| **Quyết định** | **CẦN PO + quyền truy cập DB.** Không tự đổi tên cột. |

### XĐ-03 — Chữ hoa/thường của enum role 🔴

| | |
|---|---|
| **Nguồn A** | Form đăng ký gửi `value="DRIVER"`, `"PASSENGER"`, `"BOTH"` (chữ HOA) |
| **Nguồn B** | `schema.sql` ghi `role -- passenger \| driver \| both \| admin` (chữ thường) |
| **Thực tế DB** | ❓ **UNKNOWN** |
| **Bằng chứng gián tiếp** | `src/utils/matching.ts` phải gọi `.toUpperCase()` phòng thủ ⇒ dấu hiệu dữ liệu không đồng nhất |
| **Tác động** | So sánh chuỗi sai ⇒ **phân quyền sai** (ví dụ tài xế không được nhận là tài xế) |
| **Quyết định** | **CẦN PO + DB.** Không tự chuẩn hoá. |

### XĐ-04 — Trạng thái tài khoản: `status` vs `account_status`

| | |
|---|---|
| **Nguồn A** | Code dùng `profiles.status` |
| **Nguồn B** | `schema.sql` ghi `account_status` |
| **Thực tế DB** | ❓ **UNKNOWN** |
| **Tác động** | 🟡 TB — ảnh hưởng logic khoá/mở tài khoản |
| **Quyết định** | Cần DB xác minh |

### XĐ-05 — Cột không có trong tài liệu

`profiles.email_verified` và `profiles.cancelled_trip_count` **xuất hiện trong code** nhưng **không
được mô tả** trong `schema.sql`. Trạng thái: **DOCUMENTED thiếu**. Cần bổ sung tài liệu.

### XĐ-06 — Cột lịch sử còn sót

`profiles.school` và `profiles.verification_status` được `schema.sql` ghi rõ là **cột cũ** ("đồng bộ
từ `university`", "không dùng khi code"). ⇒ **Nợ kỹ thuật đã biết**, cần kế hoạch dọn dẹp (không xoá
trong đợt này).

### XĐ-07 — Trạng thái xác minh `NEED_REVIEW`

`schema.sql` liệt kê 4 giá trị: `PENDING | VERIFIED | REJECTED | NEED_REVIEW`. Code chỉ xử lý 3 giá trị
đầu ⇒ giá trị `NEED_REVIEW` **không có đường xử lý** trong giao diện.

### XĐ-08 — RLS & helper functions

Tài liệu ghi có RLS + `is_admin()` + `is_verified_user()`, nhưng **code không bao giờ gọi chúng** và
**không thể xác minh policy tồn tại**. Trạng thái: **DOCUMENTED nhưng CHƯA XÁC MINH** — đây là xung
đột nguy hiểm nhất vì toàn bộ mô hình bảo mật dựa trên giả định này.

---

## 13. NHỮNG ĐIỀU CHƯA XÁC MINH ĐƯỢC (UNKNOWN)

Theo yêu cầu, **không suy đoán**. 13 sự kiện sau cần quyền truy cập DB để xác minh:

| ID | Điều chưa xác minh | Ảnh hưởng nếu sai |
|----|--------------------|-------------------|
| U01 | Cột ngày chuyến đi thật là `date` hay `trip_date` | 🔴 Lỗi truy vấn |
| U02 | Giá trị enum role thật là chữ HOA hay thường | 🔴 Phân quyền sai |
| U03 | Cột trạng thái tài khoản thật là `status` hay `account_status` | 🟡 |
| U04 | RLS có được bật trên tất cả bảng không | 🔴 Toàn bộ mô hình bảo mật |
| U05 | Nội dung các RLS policy thực tế | 🔴 |
| U06 | Hai hàm `is_admin()`, `is_verified_user()` có tồn tại không | 🟡 |
| U07 | Bảng `messages` có tồn tại & đúng lược đồ không | 🔴 Chat lỗi |
| U08 | Bảng `ratings` có tồn tại không | 🟡 |
| U09 | Bảng `trip_reports` có tồn tại không | 🟢 |
| U10 | RPC `accept_trip_request(uuid)` có tồn tại không | 🟡 |
| U11 | Bucket `dorm-cards` có thật sự PUBLIC không | 🔴 Rò rỉ dữ liệu cá nhân |
| U12 | Giá trị `NEED_REVIEW` có được dùng thật không | 🟢 |
| U13 | Có tài khoản ADMIN nào tồn tại không | 🟡 |

**Hệ quả:** mọi thay đổi liên quan dữ liệu **hiện là thao tác mù**. Đây là lý do EPIC-03 phụ thuộc
hoàn toàn vào quyết định Q1 (cấp quyền truy cập DB).

---

## 14. RỦI RO

| ID | Rủi ro | Mức | Tác động | Giảm thiểu |
|----|--------|-----|----------|-----------|
| R-01 | Người dùng đã đăng nhập thao tác được lên dữ liệu của người khác | 🔴 Cao | Mất dữ liệu, phá hoại, mất niềm tin | TASK-001 (ưu tiên 1) |
| R-02 | Bất kỳ ai cũng truy cập được khu quản trị | 🔴 Cao | Duyệt/từ chối xác minh trái phép | Task EPIC-01 |
| R-03 | Ảnh thẻ KTX sinh viên bị công khai | 🔴 Cao | Rò rỉ dữ liệu cá nhân, vi phạm quyền riêng tư | Task EPIC-02 |
| R-04 | Không tái lập được DB ⇒ không thể dựng môi trường mới/staging | 🔴 Cao | Chặn mọi công việc dữ liệu | Q1 + EPIC-03 |
| R-05 | Xung đột tên cột enum/cột ngày chưa giải quyết | 🔴 Cao | Lỗi runtime ngẫu nhiên, khó tái hiện | Q1 + EPIC-03 |
| R-06 | Link xác minh email 404 ⇒ người dùng mới không hoàn tất đăng ký | 🔴 Cao | Chặn tăng trưởng người dùng | EPIC-02 |
| R-07 | Không có đường tạo ADMIN ⇒ tính năng quản trị không dùng được | 🟡 TB | Vận hành thủ công | EPIC-02 |
| R-08 | Không có test/CI ⇒ mọi thay đổi không có lưới an toàn | 🟡 TB | Hồi quy âm thầm | EPIC-06 |
| R-09 | Không thực thi xác minh thẻ ⇒ mục tiêu an toàn của sản phẩm không đạt | 🔴 Cao | Mất lý do tồn tại của tính năng xác minh | EPIC-05 |
| R-10 | Phụ thuộc dịch vụ ngoài không SLA (OSRM public, Gemini free tier) | 🟡 TB | Tính giá sai/ngưng hoạt động | EPIC-08 |
| R-11 | Fallback âm thầm (khoảng cách, parse NL) ⇒ người dùng tin số liệu sai | 🟡 TB | Tranh chấp giá | EPIC-08 |
| R-12 | Tài liệu audit đã lỗi thời nhưng vẫn được tin dùng | 🟡 TB | Ra quyết định sai (suýt "sửa" proxy.ts) | Đánh dấu lỗi thời |

---

## 15. ĐIỂM MẠNH HIỆN CÓ

Ghi nhận công bằng — đây là nền tảng tốt để xây tiếp:

1. **Design system hoàn chỉnh** trong `globals.css`: token màu/chữ/bo góc/shadow đầy đủ, class component
   (`.btn-*`, `.form-*`, `.card`, `.badge-*`, `.alert-*`, `.skeleton`) đã sẵn sàng — chỉ cần dùng nhất quán.
2. **Có mẫu code uỷ quyền đúng** trong repo (`actions.ts:86`, `:154`, `chat/page.tsx:39`) ⇒ việc sửa
   lỗ hổng là **áp dụng mẫu**, không phải thiết kế lại.
3. **Nghiệp vụ đã được đặc tả rõ**: công thức giá, trọng số matching, danh mục trường/ktx đều có hằng số
   tập trung ở `src/utils/`.
4. **Tích hợp ngoài có fallback**: OSRM và Gemini đều có đường lui, không làm sập luồng chính.
5. **User experience tiếng Việt nhất quán**, font Be Vietnam Pro, thiết kế light-only có chủ đích rõ ràng.
6. **Cấu trúc route rõ ràng**: nhóm `(auth)` / `(main)` / `admin` / `api`.
7. **Tài liệu dự án có sẵn** (`docs/`) và `agents.md` cảnh báo đúng về việc Next.js 16 khác biệt.

---

## 16. KHOẢNG TRỐNG KIỂM THỬ & CI

| Hạng mục | Trạng thái |
|----------|-----------|
| Unit test | ❌ Không có file `*.test.*` / `*.spec.*` nào |
| Script `test` trong `package.json` | ❌ Không có |
| CI/CD | ❌ Không có `.github/workflows/` |
| E2E test | ❌ Không có |
| Migration tự động | ❌ Không có (và thư mục migrations rỗng) |
| Kiểm tra kiểu (typecheck) | ✅ TypeScript strict — có thể chạy `npx tsc --noEmit` |
| Lint | ✅ Có script lint |

⇒ Quy trình verify duy nhất hiện khả dụng là **đọc diff + chạy typecheck + kiểm thử âm** (đã codify
trong `.ai/verification-protocol.md`).

---

## 17. ROADMAP THEO EPIC

Thứ tự ưu tiên theo `constitution.md` §5: Bảo mật → Auth → Toàn vẹn dữ liệu → Nghiệp vụ lõi →
Khoảng trống chức năng → Kiến trúc → UI → Tính năng phụ.

| EPIC | Tên | Ưu tiên | Rủi ro | Trạng thái | Phụ thuộc |
|------|-----|---------|--------|-----------|-----------|
| **EPIC-01** | Security & Authorization | 1–2 | 🔴 Cao | `PROPOSED` | — |
| **EPIC-02** | Auth & Onboarding Blockers | 2–3 | 🔴 Cao | `PROPOSED` | Q6 |
| **EPIC-03** | Data Integrity | 3–4 | 🔴 Cao | `PROPOSED` | **Q1** |
| **EPIC-04** | Core Business Logic | 4–5 | 🟡 TB | `PROPOSED` | EPIC-03, Q4, Q7 |
| **EPIC-05** | Critical Functional Gaps | 5 | 🟡 TB | `PROPOSED` | Q5, Q7, Q8 |
| **EPIC-06** | Architecture & Maintainability | 6 | 🟡 TB | `PROPOSED` | EPIC-01 |
| **EPIC-07** | Shared UI & Components | 7 | 🟡 TB | `PROPOSED` | — |
| **EPIC-08** | Secondary Features & Integrations | 8–10 | 🟢 Thấp | `PROPOSED` | EPIC-01, EPIC-03 |

**Trình tự thực thi đề xuất:**

| Giai đoạn | Nội dung |
|-----------|----------|
| 1 | **EPIC-01** (TASK-001 trước tiên) + **EPIC-02** — chặn mọi thứ khác về mặt an toàn |
| 2 | **EPIC-03** — sau khi có Q1, làm rõ toàn bộ nền dữ liệu |
| 3 | **EPIC-04** + **EPIC-05** — hoàn thiện nghiệp vụ lõi trên nền đã vững |
| 4 | **EPIC-06** + **EPIC-07** — củng cố kiến trúc & giao diện |
| 5 | **EPIC-08** — tích hợp & tính năng phụ |

**Chỉ số tiến độ:**

| Chỉ số | Hiện tại | Mục tiêu |
|--------|----------|----------|
| Lỗ hổng uỷ quyền | 5 | 0 |
| Route admin không bảo vệ | 2 | 0 |
| Endpoint API không xác thực | 2 | 0 |
| Sự kiện DB không xác minh | 13 | 0 |
| File migration | 0 | ≥ 1 |
| Test tự động | 0 | > 0 |
| Luồng upload xác minh | 2 | 1 |

---

## 18. QUYẾT ĐỊNH CẦN PO (HUMAN DECISIONS REQUIRED)

| ID | Câu hỏi | Vì sao cần PO | Ảnh hưởng nếu chưa có |
|----|---------|---------------|----------------------|
| **Q1** | Có thể cấp quyền truy cập cơ sở dữ liệu (Supabase project, quyền đọc schema) cho quá trình làm việc không? | Không thể xác minh 13 sự kiện UNKNOWN nếu không có | **Chặn toàn bộ EPIC-03** và mọi việc liên quan dữ liệu |
| **Q2** | Schema thật dùng `trips.date` hay `trips.trip_date`? | Ảnh hưởng trực tiếp tính đúng đắn của truy vấn | Không thể sửa/tối ưu luồng chuyến đi |
| **Q3** | Enum vai trò trong DB là chữ HOA hay chữ thường? | Ảnh hưởng phân quyền | Nguy cơ sửa sai gây hỏng dữ liệu |
| **Q4** | Trọng số matching (`pickup_score`) có được dùng không, hay bỏ hẳn? | Là quyết định nghiệp vụ, không phải kỹ thuật | Không thể hoàn thiện thuật toán |
| **Q5** | Tính năng báo cáo vi phạm có nằm trong phạm vi phiên bản này không? | Quyết định phạm vi sản phẩm | Không thể lên kế hoạch EPIC-05 |
| **Q6** | Ai được cấp quyền ADMIN, và bằng cách nào (thủ công trong DB hay có UI)? | Liên quan bảo mật & vận hành | Khu quản trị không dùng được an toàn |
| **Q7** | Có bắt buộc xác minh thẻ KTX mới được đăng chuyến/tham gia không? | Quyết định nghiệp vụ cốt lõi (mục tiêu an toàn của sản phẩm) | Không thể thực thi D-14 |
| **Q8** | Tính năng đánh giá & uy tín có cần hoạt động thật trong phiên bản này không? | Quyết định phạm vi | Không thể hoàn thiện rating |
| **Q9** | Thứ tự ưu tiên EPIC đã đề xuất có được chấp thuận không? | PO là người quyết định cuối cùng | Không thể bắt đầu thực thi |
| **Q10** | (Mới) Có yêu cầu test tự động không, hay chấp nhận quy trình verify thủ công? | Ảnh hưởng phạm vi EPIC-06 | Không rõ mức đầu tư vào hạ tầng test |
| **Q11** | (Mới) Ngôn ngữ thiết kế hiện tại (light-only, xanh blue-600) có phải là chốt cuối không? | Nếu sắp đổi theme, thứ tự làm UI nên đảo | Rủi ro làm lại EPIC-07 |
| **Q12** | (Mới) Có triển khai tích hợp Messenger thật trong phiên bản này không? | Liên quan chi phí, tài khoản, chính sách bên thứ ba | Không thể lên kế hoạch EPIC-08 |
| **Q13** | (Mới) Giữ OSRM public hay chuyển sang dịch vụ có SLA/self-host? | Liên quan chi phí & độ ổn định | Rủi ro tính giá hỏng khi OSRM rate-limit |
| **Q14** | (Mới) Khối "tìm kiếm nhanh" ở trang chủ: hoàn thiện hay gỡ bỏ? | Quyết định phạm vi UI | Để lại UI chết gây hiểu nhầm |

**Mức độ chặn:**

- 🔴 **Chặn cứng:** Q1 (chặn EPIC-03 và mọi thay đổi dữ liệu), Q9 (chặn khởi động thực thi).
- 🟠 **Chặn một phần:** Q2, Q3, Q6, Q7 (chặn các task cụ thể trong EPIC-02/03/05).
- 🟡 **Không chặn ngay:** Q4, Q5, Q8, Q10–Q14.

---

## 19. KẾT LUẬN & HÀNH ĐỘNG TIẾP THEO

### Kết luận

Dự án có **nền tảng nghiệp vụ và thiết kế tốt**, nhưng **chưa đủ an toàn để vận hành với người dùng
thật**. Ba vấn đề lớn nhất theo thứ tự nghiêm trọng:

1. **Lỗ hổng uỷ quyền** ở tầng application — đặc biệt nghiêm trọng vì RLS (lớp phòng thủ ở tầng DB)
   đang ở trạng thái `UNKNOWN`.
2. **Auth bị chặn**: người dùng mới không hoàn tất được đăng ký (callback rỗng), và không có đường tạo ADMIN.
3. **Nền dữ liệu mù**: không có migration, không có DDL chạy được, có xung đột tên cột chưa giải quyết.

Điểm tích cực: **không cần viết lại từ đầu**. Các mẫu code đúng đã tồn tại trong repo, design system đã
hoàn chỉnh, và mọi vấn đề đều đã được định vị chính xác tới `file:line`.

### Hành động tiếp theo

| Bước | Hành động | Trạng thái |
|------|-----------|-----------|
| 1 | PO trả lời **Q1** và **Q9** (hai câu hỏi chặn cứng) | ⏳ Chờ PO |
| 2 | PO ra lệnh thực thi **TASK-001** ⇒ chuyển từ `READY` → `IN_PROGRESS`, giao cho Antigravity | ⏳ Chờ PO |
| 3 | Sau TASK-001, thực thi EPIC-01 phần còn lại (bảo vệ khu admin + API) | ⏳ Chờ |
| 4 | Song song nếu có Q1: EPIC-03 làm rõ nền dữ liệu | ⏳ Chờ |

> ⚠️ **TASK-001 đang ở trạng thái `READY` nhưng KHÔNG được thực thi.**
> Không có source code, database, auth, security, UI hay business logic nào bị thay đổi trong phiên
> onboarding này. Toàn bộ thay đổi chỉ nằm trong thư mục `.ai/` (tài liệu điều phối).

---

## Phụ lục — Danh mục tài liệu đã tạo

| Đường dẫn | Nội dung |
|-----------|----------|
| `.ai/constitution.md` | Hiến chương: vai trò, thứ tự ưu tiên nguồn, ranh giới, vòng đời task |
| `.ai/project-context.md` | Bối cảnh nghiệp vụ, vai trò, luồng chính, quy tắc đã cam kết |
| `.ai/project-state.md` | Trạng thái hiện tại: tính năng F01–F14, defect, danh sách UNKNOWN |
| `.ai/architecture.md` | Kiến trúc, stack, bảng route, bảo mật, rủi ro A1–A8 |
| `.ai/database-context.md` | Phân loại 4 trạng thái DB, so sánh lược đồ, quyết định D1–D10 |
| `.ai/execution-protocol.md` | Quy trình 8 bước thực thi task + mẫu báo cáo |
| `.ai/verification-protocol.md` | Quy trình 7 bước verify + negative testing + mẫu báo cáo |
| `.ai/escalation-protocol.md` | H01–H13 (rủi ro cao), K01–K12 (đặc thù KTX), mẫu escalate |
| `.ai/epics/ROADMAP.md` | Lộ trình tổng thể, trình tự 5 giai đoạn, chỉ số tiến độ |
| `.ai/epics/EPIC-01…EPIC-08` | 8 đặc tả EPIC đầy đủ |
| `.ai/tasks/TASK-001.md` | Task đầu tiên ở trạng thái `READY` (18 trường bắt buộc) |
| `.ai/reports/onboarding-report.md` | Báo cáo này |
