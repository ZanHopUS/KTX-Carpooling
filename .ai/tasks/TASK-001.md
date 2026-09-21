# TASK-001 — Bịt lỗ hổng uỷ quyền trong Server Action của chuyến đi & chat

- **TRẠNG THÁI:** ✅ `DONE` — **static verification PASS, PO phê duyệt chốt theo static (2026-09-21). Runtime AC-01…AC-06 defer sang EPIC-03** (code ↔ DB lệch toàn bộ thiết kế — fixture không tạo được; AC-04 thêm phụ thuộc TASK-002). Xem `VERIFICATION-REPORT-TASK-001.md` §9 và mục 20 dưới đây. Re-verify runtime là điều kiện hoàn thành của EPIC-03.
- **EPIC:** EPIC-01 — Security & Authorization
- **Mức ưu tiên:** 1 (Bảo mật / Uỷ quyền)
- **Mức rủi ro:** 🔴 Cao nếu không sửa — 🟢 Thấp khi sửa (thay đổi nhỏ, cục bộ)
- **Người tạo:** Qoder (Orchestrator) — ngày 2026-09-20
- **Người thực thi:** Antigravity (Execution Agent)
- **Người verify:** Qoder (theo `verification-protocol.md`)

---

## 1. TASK ID

`TASK-001`

## 2. TITLE

Bịt lỗ hổng uỷ quyền (missing authorization) trong `rejectTripRequestAction`, `sendMessageAction`
và `updateTripStatusAction`.

## 3. OBJECTIVE

Bổ sung kiểm tra quyền sở hữu/quan hệ hợp lệ cho 3 Server Action đang chỉ kiểm tra "đã đăng nhập"
mà không kiểm tra "có quyền thao tác trên tài nguyên này hay không". Sau khi hoàn thành, người dùng
đã đăng nhập nhưng **không liên quan** đến chuyến đi sẽ không thể từ chối yêu cầu ghép, gửi tin nhắn,
hoặc đổi trạng thái chuyến đi của người khác.

## 4. BACKGROUND

Hệ thống hiện xác thực (authentication) ở hầu hết Server Action bằng `supabase.auth.getUser()`, nhưng
nhiều action **thiếu bước uỷ quyền (authorization)** — tức kiểm tra người gọi có thực sự là chủ sở hữu
hoặc thành viên hợp lệ của tài nguyên hay không.

Vì client dùng **anon key** với RLS là lớp phòng thủ **duy nhất** ở tầng DB (xem `database-context.md`),
và RLS hiện ở trạng thái `UNKNOWN` (không thể xác minh), lỗ hổng ở tầng application trở thành rủi ro
trực tiếp: bất kỳ người dùng đã đăng nhập nào cũng có thể thao tác lên dữ liệu của người khác nếu biết
định danh tài nguyên.

Đây là **leo thang đặc quyền ngang** (horizontal privilege escalation) — nhóm rủi ro bảo mật cao nhất
trong dự án, và là lý do TASK-001 nằm ở mức ưu tiên 1.

## 5. SOURCE OF TRUTH

| Nguồn | Vai trò |
|-------|---------|
| `constitution.md` §5 | Thứ tự ưu tiên: Bảo mật/uỷ quyền = mức 1 |
| `EPIC-01-security-authorization.md` | EPIC chứa task này; danh sách 9 lỗ hổng |
| `escalation-protocol.md` H05/H06 | Authorization & user roles thuộc nhóm HIGH RISK |
| Mẫu code đã đúng trong repo | `acceptTripRequestAction:86`, `cancelTripRequestAction:154`, `chat/page.tsx:39` — dùng làm chuẩn nội bộ |
| `verification-protocol.md` | Quy trình verify bắt buộc, gồm negative testing |

**Không dùng làm nguồn sự thật:** `docs/audit/repository-audit.md` — tài liệu này đã có phát hiện lỗi
thời (xem `constitution.md` §2, ví dụ middleware vs proxy).

## 6. CURRENT STATE

### 6.1 `src/app/(main)/trips/[id]/actions.ts`

| Hàm | Dòng | Kiểm tra hiện có | Đánh giá |
|-----|------|------------------|----------|
| `createTripRequestAction` | :7 | (không thuộc phạm vi TASK-001) | — |
| `acceptTripRequestAction` | :78 | `if (!trip \|\| trip.driver_id !== user.id)` tại :86 | ✅ **ĐÚNG** — dùng làm mẫu |
| `rejectTripRequestAction` | :118 | `if (!user) return ...` tại :122; sau đó `update({ status: 'REJECTED' }).eq('id', requestId)` tại :125 | ❌ **THIẾU** — không kiểm tra chủ sở hữu |
| `cancelTripRequestAction` | :144 | `.eq('passenger_id', user.id)` tại :154 | ✅ **ĐÚNG** — dùng làm mẫu |

### 6.2 `src/app/(main)/trips/[id]/chat/actions.ts`

| Hàm | Dòng | Kiểm tra hiện có | Đánh giá |
|-----|------|------------------|----------|
| `sendMessageAction` | :7 | `if (!user \|\| !content.trim())` tại :11 | ❌ **THIẾU** — không xác minh người gửi thuộc chuyến |
| `updateTripStatusAction` | :30 | `if (!user)` tại :34 | ❌ **THIẾU** — không kiểm tra là tài xế của chuyến |
| `submitRatingAction` | :57 | `if (!user)` tại :61; insert vào `ratings` tại :63 | ⚠️ **Thuộc phạm vi EPIC-05**, không xử lý trong TASK-001 (xem §8 DO NOT TOUCH) |

### 6.3 Mẫu kiểm tra đã đúng trong repo (chuẩn nội bộ)

- `src/app/(main)/trips/[id]/actions.ts:86` — xác minh `trip.driver_id === user.id` trước khi cho phép.
- `src/app/(main)/trips/[id]/actions.ts:154` — giới hạn truy vấn bằng `.eq('passenger_id', user.id)`.
- `src/app/(main)/trips/[id]/chat/page.tsx:39` — `if (!isDriver && acceptedReq?.passenger_id !== user.id)`
  (kiểm tra ở tầng đọc dữ liệu).

### 6.4 Hệ quả khai thác (minh hoạ, không phải hướng dẫn tấn công)

Người dùng A đã đăng nhập, biết `requestId` của một yêu cầu ghép thuộc chuyến của người dùng B →
A gọi `rejectTripRequestAction(requestId)` → yêu cầu của hành khách bị từ chối trái phép.
Tương tự với việc gửi tin nhắn vào chuyến của người khác hoặc đổi trạng thái chuyến đi không phải của mình.

## 7. EXPECTED STATE

1. `rejectTripRequestAction` chỉ thực hiện được khi người gọi **là tài xế của chuyến** mà yêu cầu đó
   thuộc về (kiểm tra qua `trip_requests.trip_id` → `trips.driver_id`).
2. `sendMessageAction` chỉ thực hiện được khi người gọi **là tài xế hoặc hành khách đã được chấp nhận**
   của chuyến tương ứng.
3. `updateTripStatusAction` chỉ thực hiện được khi người gọi **là tài xế của chuyến** (trạng thái chuyến
   do tài xế quản lý).
4. Mọi trường hợp không hợp lệ: **từ chối**, **không ghi dữ liệu**, **không rò rỉ thông tin** chi tiết
   (thông báo lỗi chung, không tiết lộ tài nguyên có tồn tại hay không).
5. Hành vi của người dùng hợp lệ **không thay đổi** so với trước.
6. Kiểm tra quyền nằm ở **tầng server** — không dựa vào việc ẩn/hiện nút ở UI.

## 8. SCOPE

**Trong phạm vi (được phép sửa):**

| File | Hàm được sửa |
|------|--------------|
| `src/app/(main)/trips/[id]/actions.ts` | Chỉ `rejectTripRequestAction` |
| `src/app/(main)/trips/[id]/chat/actions.ts` | Chỉ `sendMessageAction`, `updateTripStatusAction` |

**Ngoài phạm vi (ghi nhận, KHÔNG sửa trong TASK-001):**

- `acceptTripRequestAction` — đã đúng.
- `cancelTripRequestAction` — đã đúng.
- `createTripRequestAction` — không thuộc nhóm lỗ hổng uỷ quyền này.
- `submitRatingAction` — thuộc EPIC-05 (rating chưa hiệu lực, chưa có bảng xác minh).
- `src/app/admin/page.tsx` và `src/app/admin/verifications/**` — thiếu kiểm tra ADMIN (tách thành task riêng).
- `src/app/api/verifications/route.ts` — bug bảng `users` thay vì `profiles` (tách thành task riêng, EPIC-02).
- Mọi thay đổi RLS, schema, migration, auth config.

## 9. FILES / MODULES

```
src/app/(main)/trips/[id]/actions.ts          (sửa 1 hàm)
src/app/(main)/trips/[id]/chat/actions.ts     (sửa 2 hàm)
```

**Được phép đọc (không sửa) để hiểu ngữ cảnh:**
`src/app/(main)/trips/[id]/chat/page.tsx`, `src/types/database.ts`, `src/utils/supabase/server.ts`,
`supabase/schema.sql`.

## 10. DO NOT TOUCH

Tuyệt đối không chạm trong phạm vi task này:

- ❌ Database: schema, bảng, cột, index, migration, seed
- ❌ RLS policies và mọi thứ trong `supabase/`
- ❌ Authentication: luồng đăng nhập/đăng ký/OTP, `src/utils/supabase/*`, `src/proxy.ts`
- ❌ Phân quyền ở tầng dữ liệu (roles column, helper `is_admin()`, `is_verified_user()`)
- ❌ Giao diện: `.tsx` trang, CSS, component
- ❌ Cấu trúc thư mục, tên file, refactor ngoài 3 hàm nêu trên
- ❌ `submitRatingAction` và các hàm khác trong cùng file (chỉ sửa 3 hàm được liệt kê)
- ❌ `package.json`, dependencies
- ❌ `.env.local` hoặc bất kỳ file cấu hình môi trường
- ❌ Tài liệu trong `.ai/` (trừ phần cập nhật trạng thái task sau khi hoàn thành)
- ❌ `docs/` — không sửa audit report hay tài liệu khác

## 11. DEPENDENCIES

| Phụ thuộc | Trạng thái | Ảnh hưởng |
|-----------|-----------|-----------|
| Truy cập mã nguồn | ✅ Có | — |
| `supabase.auth.getUser()` hoạt động | ✅ Có (đã dùng ở mọi action) | — |
| Kiến thức về quan hệ bảng | ⚠️ Một phần | Cần biết `trip_requests.trip_id → trips.id`; đã có trong `schema.sql` comment |
| RLS thực tế | ❓ `UNKNOWN` | **Không chặn** — task này bổ sung phòng thủ ở tầng app, độc lập với RLS |
| Cột `status` / `trip_date` vs `date` | ❓ `UNKNOWN` | ⚠️ **RỦI RO** — xem §13 ràng buộc C-03 |

**Task này KHÔNG phụ thuộc vào Q1 (quyền truy cập DB)** — có thể thực thi độc lập.

## 12. CONSTRAINTS

| ID | Ràng buộc |
|----|-----------|
| C-01 | Chỉ sửa 3 hàm được liệt kê. Không đụng các hàm khác trong cùng file. |
| C-02 | Không đổi chữ ký hàm (signature) — UI gọi hiện tại phải còn hoạt động. |
| C-03 | **Không đổi tên cột/bảng trong truy vấn hiện có.** Nếu bắt buộc phải thêm truy vấn mới, dùng đúng tên cột như code hiện tại (`trips.driver_id`, `trip_requests.trip_id`, `trip_requests.passenger_id`, `trip_requests.status`, `messages.trip_id`, `trips.id`) và **không** sửa các cột đang tranh chấp (`date` / `trip_date`). |
| C-04 | Không thêm dependency. Không thêm thư viện validation ở task này. |
| C-05 | Không thêm migration, không thay đổi DB. |
| C-06 | Thông báo lỗi không được tiết lộ sự tồn tại/thuộc tính của tài nguyên. |
| C-07 | Thay đổi phải **nhỏ, cục bộ, dễ revert** — mỗi hàm một diff tối thiểu. |
| C-08 | Không đổi giao diện. Nếu cần UI hiển thị lỗi mới, dùng cơ chế lỗi sẵn có. |
| C-09 | Phải giữ tính nhất quán với mẫu code đúng đã có trong repo (`:86`, `:154`, `chat/page.tsx:39`). |
| C-10 | Nếu phát hiện vấn đề ngoài phạm vi trong lúc làm: **ghi nhận, KHÔNG tự sửa**, báo lại orchestrator. |

## 13. REQUIREMENTS

| ID | Yêu cầu |
|----|---------|
| RQ-01 | `rejectTripRequestAction`: trước khi update, truy vấn yêu cầu + chuyến tương ứng; chỉ cho phép nếu `trip.driver_id === user.id`. |
| RQ-02 | `sendMessageAction`: trước khi insert, xác minh người gọi là tài xế của chuyến **hoặc** là hành khách có yêu cầu đã được chấp nhận trong chuyến đó. |
| RQ-03 | `updateTripStatusAction`: trước khi update, xác minh `trip.driver_id === user.id`. |
| RQ-04 | Trường hợp không hợp lệ: trả về trạng thái lỗi theo cơ chế hiện có của action, **không** thực hiện thao tác ghi. |
| RQ-05 | Không có truy vấn nào chạy khi chưa xác thực (giữ kiểm tra `!user` hiện có và đặt trước mọi truy vấn mới). |
| RQ-06 | Hành vi hợp lệ trước đây phải giữ nguyên — không thêm điều kiện chặt hơn cho người dùng hợp lệ. |
| RQ-07 | Mỗi hàm sửa xong phải kiểm chứng được bằng negative test (gọi với người dùng không liên quan → bị từ chối, không có dữ liệu ghi mới). |

## 14. ACCEPTANCE CRITERIA

| ID | Tiêu chí | Cách kiểm chứng |
|----|----------|-----------------|
| AC-01 | Người dùng C (không liên quan) gọi `rejectTripRequestAction(requestId)` của chuyến do B làm tài xế → **bị từ chối**, `trip_requests.status` **không đổi** | Negative test — kiểm tra DB trước/sau |
| AC-02 | Tài xế B gọi `rejectTripRequestAction(requestId)` trên chuyến của mình → **thành công**, status = `REJECTED` | Positive test |
| AC-03 | Người dùng C gọi `sendMessageAction(tripId, content)` vào chuyến không liên quan → **bị từ chối**, không có bản ghi `messages` mới | Negative test |
| AC-04 | Tài xế và hành khách đã được chấp nhận gửi tin nhắn → **thành công** như trước | Positive test (2 vai trò) |
| AC-05 | Người dùng C gọi `updateTripStatusAction(tripId, status)` trên chuyến không phải của mình → **bị từ chối**, `trips.status` không đổi | Negative test |
| AC-06 | Tài xế đổi trạng thái chuyến của mình → **thành công** như trước | Positive test |
| AC-07 | `npx tsc --noEmit` không phát sinh lỗi mới | Chạy trên diff |
| AC-08 | `git diff --stat` chỉ cho thấy 2 file trong §9, và số dòng thay đổi tương ứng phạm vi 3 hàm | Kiểm tra diff |
| AC-09 | Không có file nào ngoài §9 bị thay đổi | `git status` |

## 15. VERIFICATION

Theo `verification-protocol.md` (7 bước). Bắt buộc:

1. **Scope check** — `git diff --stat` chỉ có 2 file trong §9.
2. **Đọc diff thật** — xác nhận chỉ 3 hàm được sửa, không có thay đổi "kèm theo".
3. **Automated check** — `npx tsc --noEmit`; ghi lại kết quả.
4. **Đối chiếu từng AC** — PASS / FAIL / KHÔNG KIỂM ĐƯỢC cho AC-01…AC-09.
5. **Negative testing** (bắt buộc, không được bỏ qua):
   - Người dùng không liên quan → bị từ chối (3 action).
   - Người dùng **chưa đăng nhập** → bị từ chối (3 action).
   - `requestId` / `tripId` **không tồn tại** → không crash, không rò rỉ thông tin.
   - Hành khách **chưa được chấp nhận** cố gửi tin nhắn → bị từ chối.
6. **Regression** — chạy lại luồng hợp lệ đầu-cuối: tạo chuyến → gửi yêu cầu → chấp nhận → chat →
   đổi trạng thái → từ chối yêu cầu khác.
7. **Kết luận** — PASS / FAIL / PARTIAL / KHÔNG KIỂM ĐƯỢC.

**Dấu hiệu REJECT ngay** (theo `verification-protocol.md`): dựa vào `disabled` ở UI, dùng `@ts-ignore`,
`try/catch` rồi `return true`, thêm dependency, hoặc kiểm tra quyền ở client.

**Lưu ý về giới hạn kiểm chứng:** nếu tại thời điểm verify chưa có quyền truy cập DB thật (Q1 chưa
được trả lời), các AC liên quan đến "kiểm tra DB trước/sau" có thể đánh dấu **KHÔNG KIỂM ĐƯỢC**
và phải ghi rõ lý do — **không được** đánh PASS khi chưa thực chứng.

## 16. EXPECTED OUTPUT

1. Diff sửa 3 hàm trong 2 file, mỗi hàm một khối thay đổi tối thiểu.
2. Kết quả `npx tsc --noEmit` trên nhánh có thay đổi.
3. Báo cáo thực thi theo template trong `execution-protocol.md`.
4. Báo cáo verify theo template trong `verification-protocol.md`, có kết quả negative testing.
5. Cập nhật trạng thái TASK-001 trong file này và trong `EPIC-01-security-authorization.md` sau khi verify.
6. **Một commit duy nhất** cho toàn bộ task, thông điệp mô tả rõ phạm vi (1 task = 1 commit).

## 17. RISK

| ID | Rủi ro | Mức | Giảm thiểu |
|----|--------|-----|-----------|
| RK-01 | Truy vấn thêm để kiểm tra quyền dùng sai tên cột (do `date`/`trip_date` chưa xác minh) ⇒ lỗi runtime | 🔴 Cao | C-03: chỉ dùng tên cột **đã có trong code hiện tại**; không sửa cột tranh chấp |
| RK-02 | Sửa quá rộng, chạm vào các hàm đang đúng ⇒ gây hồi quy | 🟡 TB | C-01 + AC-08/AC-09 kiểm tra diff |
| RK-03 | Thêm ràng buộc quá chặt ⇒ hành khách hợp lệ không chat được, phá vỡ luồng chính | 🟡 TB | RQ-06 + AC-04 positive test với cả 2 vai trò |
| RK-04 | Kiểm tra quyền bị đặt ở client hoặc bị vô hiệu bởi UI | 🔴 Cao | Verify bước 5 negative test gọi thẳng action; dấu hiệu REJECT |
| RK-05 | Không thể verify đầy đủ do chưa có quyền DB (Q1) | 🟡 TB | Cho phép đánh dấu KHÔNG KIỂM ĐƯỢC, **không** đánh PASS khống |
| RK-06 | RLS có thể đã chặn các thao tác này ⇒ lỗ hổng ít nghiêm trọng hơn đánh giá | 🟢 Thấp | RLS là `UNKNOWN`; **không được suy đoán** — vẫn phải sửa (phòng thủ nhiều lớp) |

## 18. ESCALATION

**Kích hoạt escalate ngay và DỪNG thực thi** nếu gặp bất kỳ điều nào sau đây:

| Tình huống | Lý do | Hành động |
|-----------|-------|-----------|
| Phát hiện cần đổi **RLS policy** để sửa đúng | Thuộc nhóm HIGH RISK (H04) | DỪNG → escalate PO |
| Phát hiện cần đổi **schema/cột** để kiểm tra quyền | HIGH RISK (H01, H02) | DỪNG → escalate PO |
| Phát hiện cần đổi **cơ chế auth** | HIGH RISK (H04) | DỪNG → escalate PO |
| Phát hiện lỗ hổng **mới** ngoài 3 hàm | Ngoài phạm vi task | **GHI NHẬN**, không tự sửa → báo orchestrator |
| Có **≥ 2 cách** kiểm tra quyền hợp lý và chọn sai gây hậu quả khác nhau | Cần PO quyết định | DỪNG → hỏi PO |
| Phát hiện lỗ hổng nghiêm trọng hơn dự kiến (ví dụ đang bị khai thác thật) | Sự cố an ninh | DỪNG → escalate khẩn |

Theo `escalation-protocol.md`: escalation phải nêu đủ 4 yếu tố — **bối cảnh, bằng chứng, tác động,
đề xuất**. Trong lúc chờ PO: **không tự quyết định**, **không mở rộng phạm vi**.

---

## 19. KẾT QUẢ RE-VERIFY — BLOCKED (2026-09-20)

**Lỗi đã FAIL trước đó:** Đã được khắc phục qua static verification. Hàm hiện lấy `trip_requests.trip_id`
theo `requestId`, từ chối request không khớp `tripId`, kiểm tra driver sau đó và scope mutation theo cả
`id` lẫn `trip_id`. Kịch bản tài xế chuyến A truyền request của chuyến B không thể đi đến mutation.

**Lý do BLOCKED:** AC-01…AC-06 yêu cầu kiểm DB trước/sau cùng các tài khoản driver, accepted passenger
và user không liên quan. Repository không có fixture/test integration, và chưa có môi trường Supabase
kiểm thử được PO phê duyệt. Theo §15, không được đánh PASS thay cho các kiểm chứng chưa thực hiện.

**Cần Product Owner quyết định:** cung cấp môi trường DB kiểm thử cùng fixture/tài khoản, hoặc chấp thuận
bằng văn bản static verification thay cho bằng chứng runtime. Không yêu cầu Antigravity sửa code thêm và
không mở task mới.

Xem đầy đủ bằng chứng tại `.ai/reports/VERIFICATION-REPORT-TASK-001.md`.

---

## 20. QUYẾT ĐỊNH CHỐT CỦA PO (2026-09-21)

1. Static verification được phê duyệt thay cho bằng chứng runtime (đề xuất mục 2 trong §8 của
   báo cáo verify). TASK-001 chuyển `DONE`.
2. Runtime AC-01…AC-06: **KHÔNG KIỂM ĐƯỢC, defer** — lý do: fixture run bị chặn bởi code ↔ DB
   lệch toàn bộ thiết kế (`trips` thật 27 cột normalized; 14/17 cột code insert không tồn tại —
   `database-context.md` §16). Riêng AC-04 thêm phụ thuộc bảng `messages` (TASK-002).
3. Việc đồng bộ code ↔ DB chuyển sang **EPIC-03** (mở rộng: "Data Integrity & Code ↔ DB
   Alignment", gộp TASK-002). **Re-verify runtime cho 3 action của task này là điều kiện hoàn
   thành của EPIC-03.**
4. Chuỗi bằng chứng: `RUNTIME-LOG-TASK-001.md` §1–§8, `VERIFICATION-REPORT-TASK-001.md` §9.

---

## Ghi chú quan trọng

> **TASK-001 KHÔNG được thực thi trong phiên onboarding.**
> Task này được tạo ở trạng thái `READY` theo yêu cầu của PO, và chỉ chuyển sang `IN_PROGRESS`
> khi PO ra lệnh rõ ràng. Antigravity **không được gọi** cho tới lúc đó.

**Điều kiện để chuyển sang `IN_PROGRESS`:**
1. PO xác nhận thực thi TASK-001.
2. Baseline `git status` sạch hoặc đã commit hết thay đổi hiện có (theo `execution-protocol.md` bước 2).
3. Xác nhận task không phụ thuộc câu trả lời Q1 (đã xác nhận: không phụ thuộc).
