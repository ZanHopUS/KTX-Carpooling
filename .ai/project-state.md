# PROJECT STATE — KTX Carpooling

> Snapshot hiện tại: **2026-09-21**. Các ghi chú onboarding ngày 2026-09-20 bên dưới được giữ lại như lịch sử; trạng thái mới nhất nằm ở mục 1.1.
> Mọi mục đều kèm bằng chứng. Nhãn: `VERIFIED` (đã đọc code/chạy lệnh) · `INFERRED` (suy luận) · `UNKNOWN` (chưa xác minh).

---

## 1. Tổng quan trạng thái

### 1.1 Snapshot mới nhất (2026-09-21)

| Hạng mục | Trạng thái |
|---|---|
| Môi trường | DEV Supabase, site/redirect hiện dùng `http://localhost:3000` |
| Database | `ACTUAL` một phần: `profiles`, `trips`, `locations`, `routes`, `ratings` tồn tại; `messages` không tồn tại |
| `trips` live | Schema normalized 27 cột; có `trip_date`, `vehicle_id`, `route_id`, `pickup_location_id`, snapshot distance/duration/price và lifecycle fields |
| Tương thích code ↔ DB | **BROKEN**: code insert mô hình phẳng (`date`, `available_seats`, `pickup_area`, ...) nhưng các cột này không có trong live `trips` |
| Đăng chuyến | **BROKEN / BLOCKED** với mọi user; cần EPIC-03 quyết định hướng đồng bộ |
| Chat | **BROKEN / BLOCKED** trên DB DEV vì bảng `messages` không tồn tại |
| Signup | Runtime đã cấp session ngay; Supabase DEV đang tắt confirm email, nên OTP là flow code thiết kế chứ chưa phải ràng buộc môi trường |
| TASK-001 | `DONE` theo static approval; runtime verification defer sang EPIC-03 vì không tạo được trip |

> Nguồn: `docs/database/*.md`, `docs/product/*.md`, PO-provided schema evidence và `.ai/reports/RUNTIME-LOG-TASK-001.md`. Dữ liệu docs mô tả target/domain; chỉ các xác nhận live được gắn `ACTUAL`.

| Hạng mục | Trạng thái |
|---|---|
| Giai đoạn | **MVP khung chức năng** — UI đầy đủ, nghiệp vụ chạy được ở mức cơ bản |
| Nhánh git | `dev` |
| Commit gần nhất | `58d57fa Thiết kế giao bố cục giao diện` |
| Thay đổi chưa commit | Chỉ thư mục `docs/` (untracked) |
| Có chạy được không? | Dev server đã được runtime verification; build chưa được xác minh trong snapshot này |
| Migration DB | **KHÔNG CÓ FILE NÀO** — `supabase/migrations/` rỗng (`VERIFIED`) |
| Trạng thái DB thật | `PARTIAL ACTUAL` — xem mục 1.1; schema đầy đủ, enum và RLS vẫn còn `UNKNOWN` |

### 1.2 Cập nhật 2026-09-22 (snapshot mới nhất — ghi đè các dòng stale ở trên khi mâu thuẫn)

- Migration DB: **đã có file đầu tiên** — `supabase/migrations/20260921_create_messages.sql` (TASK-002, PO đã áp dụng lên DB DEV).
- **TASK-002 `DONE`**: bảng `messages` + RLS runtime-verified (driver / accepted passenger / admin pass; unrelated user, anon, forged `sender_id` đều bị chặn). Chat đã thông về mặt DB.
- **PO chốt trọn bộ quyết định EPIC-03 (D-03-01…D-03-11)** — xem `EPIC-03-PO-DECISION-PACK.md` §10. Điểm chốt chính: `trips` dùng **boundary DTO mapping** (UI không phụ thuộc persistence schema); live DB là canonical cho `trip_requests`, `ratings`, profile account state, enum values/casing, RLS; `profiles.role` chỉ là platform role `USER`/`ADMIN`; verification bắt buộc cho core carpool actions; TASK-001 giữ DONE, re-verify runtime sau khi trip/request contract đồng bộ.
- **TASK-003 `DONE`**: PO đã cung cấp 100% bằng chứng SQL dump. Đã thiết lập Live Schema Baseline Contract tại `docs/database/live-schema-baseline.md`. Nâng 100% nhãn schema/enum/RLS từ `UNKNOWN` -> `ACTUAL`.
- **TASK-004 `DONE`**: Đã triển khai Boundary DTO Mapper [`src/lib/mappers/tripMapper.ts`](file:///d:/CNTT/KTX%20Carpooling/ktx-carpooling/src/lib/mappers/tripMapper.ts). Tính năng **Đăng chuyến đi (Create Trip)** đã chính thức ĐƯỢC THÔNG BLOCKER, ghi nhận đủ 39 cột trên DB live và render chuẩn trên các trang `/trips`, `/trips/[id]`. Build verification PASS.
- **TASK-005 `DONE`**: Đã lập file [`.ai/tasks/TASK-005.md`](file:///d:/CNTT/KTX%20Carpooling/ktx-carpooling/.ai/tasks/TASK-005.md) & triển khai toàn bộ yêu cầu D-03-05 (phân tách platform role `USER`/`ADMIN` khỏi capabilities), D-03-07 (cưỡng chế xác minh thẻ KTX cho Core Carpool Actions: `createTripAction` & `createTripRequestAction`), sửa lỗi truy vấn bảng `users` sang `profiles`, bảo vệ phân quyền Admin Route và đồng bộ giao diện ứng dụng. Build verification PASS (19/19 routes).
- **TASK-006 `DONE`**: Đã lập file [`.ai/tasks/TASK-006.md`](file:///d:/CNTT/KTX%20Carpooling/ktx-carpooling/.ai/tasks/TASK-006.md) & hoàn thành gia cố toàn bộ uỷ quyền Server Actions (`rejectTripRequestAction`, `updateTripStatusAction`, `sendMessageAction`), tích hợp URL searchParams tìm kiếm từ Trang chủ sang `/trips`, sửa bộ lọc Khu vực KTX (`dormArea`) và hoàn thiện thuật toán tính điểm `pickup_score` (đạt tới 100/100). Build verification PASS.
- **TASK-007 `DONE`**: Đã lập file [`.ai/tasks/TASK-007.md`](file:///d:/CNTT/KTX%20Carpooling/ktx-carpooling/.ai/tasks/TASK-007.md) & hoàn thiện Bảng quản lý yêu cầu ghép xe `/requests`, đồng bộ thiết kế giao diện thẻ bo góc 3xl, nút bấm 1xl và verified stats trên Profile. Build verification PASS (19/19 routes).
- **TASK-008 `DONE`**: Đã lập file [`.ai/tasks/TASK-008.md`](file:///d:/CNTT/KTX%20Carpooling/ktx-carpooling/.ai/tasks/TASK-008.md) & hoàn thành bảo vệ các API Routes (`api/ai/search`, `api/ai/parse-intent`), đưa Gemini API Key vào header `x-goog-api-key` (không lộ trên URL) và kiểm tra token webhook Messenger. Build verification PASS (19/19 routes).


- Lưới vai trò làm việc: User = **Product Owner** (quyết định cuối); assistant = **Orchestrator / Navigator / Reviewer** (không tự viết code nghiệp vụ — constitution §1).

---

## 2. Thành phần đã có (VERIFIED)

### 2.1 Cấu trúc mã nguồn
43 file trong `src/` (40 `.ts/.tsx` + `globals.css`). Cụ thể:

```
src/
├── proxy.ts                          # Next.js 16 Proxy (thay middleware)
├── types/database.ts
├── lib/{ai,matching,messenger,pricing}.ts
├── utils/{constants.ts, supabase/{client,server}.ts}
└── app/
    ├── layout.tsx, globals.css, page.tsx (landing 482 dòng)
    ├── (auth)/{actions.ts, login/page.tsx, register/page.tsx}
    ├── (main)/layout.tsx, dashboard/, trips/, requests/, profile/
    ├── admin/{page.tsx, verifications/*}
    ├── api/{ai/{search,parse-intent}, verifications, webhooks/messenger}
    └── auth/callback/                # THƯ MỤC RỖNG
```

### 2.2 Chức năng đã cài đặt
| # | Chức năng | Trạng thái | Bằng chứng |
|---|---|---|---|
| F01 | Đăng ký + xác minh OTP email sinh viên | Có | `(auth)/actions.ts`, `(auth)/register/page.tsx` |
| F02 | Đăng nhập / đăng xuất | Có | `(auth)/actions.ts`, `proxy.ts` |
| F03 | Upload thẻ KTX | Có (2 luồng trùng nhau) | `(main)/profile/actions.ts`, `api/verifications/route.ts` |
| F04 | Duyệt/từ chối xác minh | Có | `admin/verifications/actions.ts` |
| F05 | Đăng chuyến + tính giá tự động | Code có nhưng runtime hỏng do schema `trips` normalized | `(main)/trips/actions.ts`, `lib/pricing.ts`, `database-context.md §16` |
| F06 | Tìm & xếp hạng chuyến | Có (client-side) | `(main)/trips/TripsSearchClient.tsx`, `lib/matching.ts` |
| F07 | Gửi yêu cầu ghép chuyến | Có | `trips/[id]/actions.ts:7` |
| F08 | Chấp nhận / từ chối / huỷ yêu cầu | Có | `trips/[id]/actions.ts:78,118,144` |
| F09 | Chat nội bộ theo chuyến | Code có nhưng DB DEV thiếu bảng `messages` | `trips/[id]/chat/*`, `database-context.md §6` |
| F10 | Đánh giá sau chuyến | Bảng tồn tại; schema/runtime và cột `stars` vs `score` chưa chốt | `chat/actions.ts:57`, `database-context.md §7` |
| F11 | Bảo vệ route bằng Proxy | Có | `src/proxy.ts` |
| F12 | Webhook Messenger | Stub | `api/webhooks/messenger/route.ts`, `lib/messenger.ts` |
| F13 | AI tìm kiếm ngôn ngữ tự nhiên | Chưa hoạt động (thiếu key) | `lib/ai.ts`, `api/ai/*` |
| F14 | Báo cáo vi phạm | Chỉ có type | `types/database.ts:72` — không nơi nào dùng |

### 2.3 Bảng được code gọi tới (EXPECTED trong DB)
`profiles` · `trips` · `trip_requests` · `messages` · `ratings` · **`users`** ← tên sai, xem mục 3.1

---

## 3. Khiếm khuyết đã xác minh (VERIFIED — chỉ ghi nhận, không sửa)

### 3.1 ✅ ĐÃ SỬA — Luồng upload thẻ KTX dùng bảng `profiles`
- **Vị trí**: `src/app/api/verifications/route.ts:35`
- **Trạng thái**: **ĐÃ SỬA**. Đã thay thế bảng `users` bằng `profiles` và cập nhật đồng thời `dorm_card_verified: 'PENDING'` và `verification_status: 'pending'`.

### 3.2 ✅ ĐÃ SỬA — Kiểm tra vai trò ADMIN ở route và Server Actions
- **Vị trí**: `src/app/admin/page.tsx`, `src/app/admin/verifications/page.tsx`, `src/app/admin/verifications/actions.ts`
- **Trạng thái**: **ĐÃ SỬA**. Đã cưỡng chế kiểm tra `profile.role === 'admin'` trên cả trang giao diện và server action `approveVerificationAction` / `rejectVerificationAction`.

### 3.3 🔴 LỖ HỔNG UỶ QUYỀN — `rejectTripRequestAction` không kiểm tra chủ sở hữu
- **Vị trí**: `src/app/(main)/trips/[id]/actions.ts:118`
- **Mã**: chỉ có `if (!user) return ...` (dòng 122), sau đó `update({status:'REJECTED'}).eq('id', requestId)` (dòng 125).
- **So sánh**: `acceptTripRequestAction` (:78) **có** kiểm tra `trip.driver_id !== user.id` (:86).
- **Hệ quả**: bất kỳ người dùng đã đăng nhập nào cũng **từ chối được yêu cầu của chuyến người khác** nếu biết `requestId`.

### 3.4 🟠 LỖ HỔNG UỶ QUYỀN — `updateTripStatusAction` không kiểm tra thành viên
- **Vị trí**: `src/app/(main)/trips/[id]/chat/actions.ts:30`
- **Mã**: chỉ `if (!user)` (dòng 34).
- **Hệ quả**: bất kỳ người dùng nào cũng **đổi trạng thái chuyến của người khác** (kể cả ép `COMPLETED`) và **chèn thông báo** vào chuyến đó.

### 3.5 🟠 LỖ HỔNG UỶ QUYỀN — `sendMessageAction` không kiểm tra thành viên
- **Vị trí**: `src/app/(main)/trips/[id]/chat/actions.ts:7`
- **Mã**: chỉ `if (!user || !content.trim())` (dòng 11).
- **Hệ quả**: người ngoài chuyến **gửi được tin nhắn** vào phòng chat của người khác.
- **Ghi chú**: trang `chat/page.tsx:39` **có** kiểm tra đúng (`isDriver || acceptedReq.passenger_id === user.id`) — nhưng server action bị gọi trực tiếp thì bỏ qua.

### 3.6 ✅ ĐÃ SỬA — Ràng buộc đánh giá `submitRatingAction` & cập nhật `profiles.average_rating`
- **Vị trí**: `src/app/(main)/trips/[id]/chat/actions.ts`
- **Trạng thái**: **ĐÃ SỬA**. Đã dùng cột `score` khớp với DB live, chặn tự đánh giá chính mình, và tự động tính toán cập nhật điểm `average_rating` của tài xế.

### 3.7 ✅ ĐÃ SỬA — Ràng buộc "Sinh viên đã xác minh Thẻ KTX" (D-03-07 / TASK-005)
- **Vị trí**: `src/app/(main)/trips/actions.ts` (`createTripAction`) & `src/app/(main)/trips/[id]/actions.ts` (`createTripRequestAction`)
- **Trạng thái**: **ĐÃ SỬA**. Đã cưỡng chế kiểm tra `dorm_card_verified === 'VERIFIED'` trước khi sinh viên tạo chuyến đi hoặc gửi yêu cầu ghép xe.

### 3.8 ✅ ĐÃ SỬA — `auth/callback` xử lý PKCE email confirmation
- **Vị trí**: `src/app/auth/callback/route.ts`
- **Trạng thái**: **ĐÃ SỬA**. Đã tạo route `auth/callback` trao đổi PKCE authorization code lấy session thành công, loại bỏ lỗi 404 khi bấm link xác minh email.

### 3.9 🟡 Data integrity — URL ảnh thẻ KTX giả
- **Vị trí**: `src/app/(main)/profile/actions.ts`
- Khi upload lỗi, code **tự tạo URL giả** dạng `https://supabase.co/storage/v1/object/public/dorm-cards/...`.
- Hồ sơ vẫn chuyển `PENDING` ⇒ ADMIN duyệt một hồ sơ **không có ảnh thật**.

### 3.10 🟡 Hai bucket lưu thẻ KTX khác nhau
- `dorm-cards` — **public** (dùng ở `profile/actions.ts`) ⇒ ảnh thẻ KTX lộ công khai.
- `verification_docs` — dùng ở `api/verifications/route.ts` (route đang hỏng).
- **Rủi ro quyền riêng tư**: ảnh thẻ sinh viên (họ tên + MSSV) nằm ở bucket public.

### 3.11 🟡 Bug logic ghép chuyến theo khu KTX
- `(main)/trips/TripsSearchClient.tsx`: UI có chọn `dormArea` nhưng **không truyền vào `MatchingCriteria`** ⇒ bộ lọc theo khu KTX **không có tác dụng**.

### 3.12 🟡 `pickupScore` trong matching luôn = 0
- `src/lib/matching.ts` — biến `pickup_score` được khai báo nhưng không bao giờ được gán ⇒ điểm khớp tối đa thực tế chỉ đạt 75/100.

### 3.13 🟡 `destinationCampus` lưu chỉ số thay vì tên
- `(main)/trips/create/page.tsx` submit **index** của campus (ví dụ `"1"`) thay vì nhãn campus ⇒ dữ liệu không đọc được, matching campus (+25) không bao giờ khớp đúng.

### 3.14 🟡 Tìm kiếm nhanh ở landing page là tính năng chết
- `src/app/page.tsx` — form `action="/trips" method="get"` gửi `university` + `date`.
- `(main)/trips/page.tsx` **không đọc** các tham số này ⇒ bấm "Tìm chuyến đi" ra kết quả không lọc.

### 3.15 🟡 Webhook Messenger không xác thực chữ ký
- `api/webhooks/messenger/route.ts` — POST **không kiểm tra `X-Hub-Signature-256`** ⇒ ai cũng gửi được payload giả.
- `lib/messenger.ts` — `sendMessengerNotification` là stub, **luôn trả `true`** mà không gọi Graph API.

### 3.16 🟡 Endpoint AI không xác thực & không giới hạn tần suất
- `api/ai/search`, `api/ai/parse-intent` — không kiểm tra đăng nhập, không rate limit.
- `lib/ai.ts` — truyền Gemini API key qua **query param `?key=`** ⇒ key lọt vào log/proxy.

### 3.17 🟡 UI quảng cáo tính năng chưa có
- Landing page `TRUST_ITEMS` cam kết "Đánh giá sau mỗi chuyến" và "Báo cáo sự cố" — luồng báo cáo **chưa tồn tại**, đánh giá mới một phần.

---

## 4. Việc chưa xác minh (UNKNOWN)

| # | Câu hỏi | Vì sao UNKNOWN |
|---|---|---|
| U01 | Schema thật của DB Supabase | Không truy cập được project; không có migration trong repo |
| U02 | Tên cột `trips.date` hay `trips.trip_date` | Đã giải quyết: DB live có `trip_date`, không có `date`; code dùng `date` là sai |
| U03 | Cột `profiles.status` hay `profiles.account_status` | Type dùng `status`, tài liệu dùng `account_status` |
| U04 | Giá trị enum thật (HOA/thường) | Code ghi `'OPEN'`/`'VERIFIED'`, schema comment gợi ý chữ thường |
| U05 | Bảng `ratings` có tồn tại? | Không có trong DDL; type + code có |
| U06 | Bảng `messages` có tồn tại? | Tài liệu nói có; không xác minh được |
| U07 | Bảng `trip_reports` có tồn tại? | Chỉ có interface TS, không nơi nào dùng |
| U08 | File `migrations/20260916_align_ktx_schema.sql` | `schema.sql` tham chiếu nhưng **không có trong repo** |
| U09 | RLS policy thật | Tài liệu mô tả; DB chưa xác minh |
| U10 | Hàm `is_admin()` / `is_verified_user()` / RPC `accept_trip_request()` | Chỉ xuất hiện trong comment của `schema.sql` |
| U11 | Cách tạo tài khoản ADMIN | Không có UI, không có seed script |
| U12 | Biến môi trường production | `.env.local` chỉ có 2 biến Supabase; thiếu GEMINI/MESSENGER |
| U13 | Ứng dụng có build/chạy được không | Chưa chạy `npm run build` |

---

## 5. Tài liệu vs Thực tế (tóm tắt)

| Nguồn | Nói gì | Thực tế | Kết luận |
|---|---|---|---|
| `docs/audit/repository-audit.md` §2.1 | `src/proxy.ts` sai, phải là `src/middleware.ts` | Next.js 16 **đổi tên** `middleware.ts` → `proxy.ts` | ❌ **Audit SAI** — `proxy.ts` là ĐÚNG |
| `docs/audit/repository-audit.md` §2.2 | `api/verifications/route.ts` dùng bảng `users` | Đúng, dòng 35 | ✅ Audit ĐÚNG |
| `docs/audit/repository-audit.md` §2.3 | Admin thiếu kiểm tra vai trò | Đúng, `grep` = 0 kết quả | ✅ Audit ĐÚNG |
| `docs/audit/repository-audit.md` §2.4 | `auth/callback` rỗng | Đúng, thư mục rỗng | ✅ Audit ĐÚNG |
| `docs/audit/repository-audit.md` §2.5 | `supabase/migrations/` rỗng | Đúng, 0 file | ✅ Audit ĐÚNG |
| `docs/product/project-guide.md` | Middleware phải đặt ở `src/middleware.ts` | Next.js 16 dùng `proxy.ts` | ❌ **Guide LỖI THỜI** |
| `docs/database/supabase-structure.md` | `trips.trip_date`, `profiles.account_status` | Code dùng `date`, `status` | ⚠️ Xung đột — cần DB thật |

---

## 6. Điểm mạnh đáng giữ

- Kiến trúc Next.js App Router rõ ràng, tách `(auth)` / `(main)` / `admin`.
- `proxy.ts` cấu hình đúng chuẩn Next.js 16, có xử lý riêng cho Server Action POST.
- Types đầy đủ, TypeScript strict.
- `lib/matching.ts` và `lib/pricing.ts` tách riêng, có thể test độc lập.
- Landing page và design system (`globals.css`) hoàn chỉnh, chuyên nghiệp.
- Có sẵn fallback (ma trận khoảng cách, regex AI) khi mạng/dịch vụ ngoài lỗi.
