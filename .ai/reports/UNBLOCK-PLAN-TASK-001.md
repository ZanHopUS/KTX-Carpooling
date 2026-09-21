# UNBLOCK PLAN — TASK-001 (Báo cáo Product Owner)

> Người soạn: Qoder (Orchestrator) — 2026-09-21
> Bối cảnh: TASK-001 đang `BLOCKED` sau re-verification. Báo cáo đầy đủ: `VERIFICATION-REPORT-TASK-001.md`.
> Mục đích: xác định chính xác phần đã chứng minh, phần còn thiếu, và phương án tối thiểu để PO ra quyết định unblock.

---

## 1. AC đã được chứng minh bằng static evidence

| AC | Nội dung | Bằng chứng | Kết luận |
|---|---|---|---|
| AC-07 | TypeScript không lỗi mới | `npx tsc --noEmit` exit 0 | **PASS đầy đủ** |
| AC-08 | Diff chỉ sửa 2 file / 3 action trong scope | Đọc toàn bộ `git diff` | **PASS đầy đủ** |
| AC-09 | Không file ngoài scope bị thay đổi | `git status` + diff | **PASS đầy đủ** |
| AC-01, AC-03, AC-05 (phần "bị từ chối") | Người không liên quan bị chặn | Static trace: guard clause đứng **trước** mọi thao tác ghi; nhánh từ chối không chứa `update`/`insert` nào nên write là **không thể đạt được** (unreachable) | **Chỉ chứng minh được đường logic, chưa chứng minh runtime** |

Giới hạn của static evidence (áp dụng cho cả 3 dòng trên):
- Không chứng minh được tên cột khớp DB thật (`trip_requests.trip_id`, `trips.driver_id` chỉ khớp với code hiện có; schema thật là `UNKNOWN` — U01/U02).
- Không loại trừ được RLS can thiệp kết quả truy vấn (U09): nếu RLS chặn `select`, nhánh `!trip`/`!request` vẫn từ chối (an toàn phía chặn), nhưng các positive case sẽ hỏng.
- AC-01/03/05 yêu cầu "DB trước/sau không đổi" — cần quan sát runtime, static không thay thế được.

## 2. AC bắt buộc phải có runtime/database fixture

| AC | Lý do bắt buộc runtime |
|---|---|
| AC-01, AC-03, AC-05 | Cần đọc DB trước/sau để chứng minh **không có dòng nào bị ghi** khi bị từ chối (yêu cầu nguyên văn của AC là negative test với DB check) |
| AC-02 | Positive test: cần chứng minh `update` thực sự đổi `trip_requests.status` thành `REJECTED` trên DB thật |
| AC-04 | Positive test 2 vai trò: driver **và** accepted passenger đều insert được vào `messages`; kèm sub-case passenger PENDING bị từ chối |
| AC-06 | Positive test: driver update `trips.status` thành công |
| Retest lỗi round-1 (tampered `requestId`) | Cần DB để chứng minh request của chuyến khác **không đổi** sau khi driver hợp lệ gọi với ID bị tráo |

Tóm lại: **AC-01 → AC-06 (toàn bộ 6 tiêu chí nghiệp vụ) đều cần runtime**; khác biệt chỉ là AC-01/03/05 đã có static logic vững còn AC-02/04/06 hoàn toàn dựa vào write thật.

## 3. Chi tiết fixture cần cho từng AC chưa verify

### 3.1 Fixture tối thiểu (dùng chung)

| Thành phần | Số lượng | Chi tiết |
|---|---|---|
| Tài khoản | **3** | **B** (tài xế chuyến chính), **P** (hành khách), **C** (người không liên quan — đồng thời là tài xế chuyến thứ hai để tạo kịch bản tampered) |
| Chuyến đi | **2** | **T1**: driver B, status `REQUESTED` (có request pending). **T2**: driver C, status `REQUESTED` |
| Yêu cầu ghép | **3** | **R1**: P → T1, `PENDING` (để test reject). **R2**: P → T2, `PENDING` (để test tampered ID). **R3**: P → T1, tạo sau khi R1 bị reject, sẽ được B chấp nhận thành `ACCEPTED` (mở chat) |
| Bảng bắt buộc tồn tại | — | `trips`, `trip_requests`, `messages` (bảng `messages` hiện là UNKNOWN — U06, cần xác nhận trong lúc dựng fixture) |

### 3.2 Test case theo từng AC (thứ tự thực hiện để không phá dữ liệu nhau)

| # | AC | Thao tác (vai trò) | Kỳ vọng + assertion DB |
|---|---|---|---|
| TC-1 | AC-01 | **C** gọi `rejectTripRequestAction(R1, T1)` | Trả lỗi; `R1.status` vẫn `PENDING` |
| TC-2 | Retest round-1 | **B** gọi `rejectTripRequestAction(R2, T1)` (R2 thuộc T2) | Trả lỗi; `R2.status` vẫn `PENDING` — đây chính là kịch bản FAIL cũ |
| TC-3 | AC-02 | **B** gọi `rejectTripRequestAction(R1, T1)` | Thành công; `R1.status` = `REJECTED` |
| TC-4 | Chuẩn bị AC-04 | **P** gửi request mới R3 lên T1; **B** chấp nhận | `R3` = `ACCEPTED`, T1 = `ACCEPTED` |
| TC-5 | AC-03 | **C** gọi `sendMessageAction(T1, ...)` | Trả lỗi; số dòng `messages` của T1 không tăng |
| TC-6 | AC-04a | **B** gửi tin vào T1 | Thành công; `messages` +1 dòng |
| TC-7 | AC-04b | **P** (accepted) gửi tin vào T1 | Thành công; `messages` +1 dòng |
| TC-8 | AC-04 sub | Passenger chỉ có request `PENDING` (dùng P với request trên T2) gửi tin vào T2 | Trả lỗi; không insert |
| TC-9 | AC-05 | **C** gọi `updateTripStatusAction(T1, 'COMPLETED')` | Trả lỗi; `T1.status` không đổi |
| TC-10 | AC-06 | **B** gọi `updateTripStatusAction(T1, <status hợp lệ>)` | Thành công; `T1.status` đổi đúng |
| TC-11 | Regression | Luồng UI đầu-cuối bằng trình duyệt: tạo chuyến → request → accept → chat → đổi trạng thái → reject request khác | Không có bước nào hỏng so với trước |

### 3.3 Cách gọi action tại runtime mà không sửa code

- **Positive flow (TC-4, TC-6, TC-7, TC-10, TC-11)**: qua UI của app đang chạy (`npm run dev`), mỗi user một phiên trình duyệt riêng.
- **Negative/tampered flow (TC-1, TC-2, TC-5, TC-8, TC-9)**: UI không bao giờ gửi ID lệch, nên phải gọi server action trực tiếp bằng một trong hai cách, cả hai **không đổi source**:
  1. POST tới route hiện có kèm header `Next-Action: <action-id>` với body JSON args, dùng cookie phiên của user tương ứng (action-id lấy từ client bundle của dev server);
  2. Interceptor trong devtools/trình duyệt sửa payload mà UI sắp gửi.
- **Assertion DB trước/sau**: đọc trực tiếp bảng `trip_requests`/`messages`/`trips` qua Supabase Dashboard (read-only) hoặc script read-only do PO cấp quyền.

## 4. Có thể tạo fixture an toàn mà không đụng production database không?

**Ngày hôm nay: chưa.** Hai rào cản cụ thể:

1. **Không thể dựng DB test từ repo**: `supabase/migrations/` rỗng, `schema.sql` chỉ chứa comment (VERIFIED trong onboarding). Schema thật chỉ tồn tại trong project Supabase hiện có. Muốn DB test riêng (local Docker hoặc project Supabase thứ hai) phải có **schema SQL dump từ PO**.
2. **Vai trò project trong `.env.local` là UNKNOWN**: nếu đó là môi trường production/chung, việc signup 3 tài khoản test + insert 2 chuyến + 3 request là thay đổi dữ liệu dùng chung; signup còn có thể gửi email thật. Chỉ làm khi PO xác nhận đây là môi trường dev và phê duyệt kèm kế hoạch dọn dẹp (xoá trips/requests/messages test; lưu ý auth users khó xoá sạch nếu không có service role key).

Không cần migration, không cần đổi RLS, không cần đổi auth config để dựng fixture — chỉ cần INSERT dữ liệu + tài khoản. Rào cản là **quyền truy cập và xác nhận môi trường**, không phải thay đổi schema.

## 5. Có thể hoàn thành verification mà không đổi scope TASK-001 không?

**Có.** Cụ thể:

- Code của TASK-001 (2 file, 3 action) đã xong phần sửa; verification không đòi hỏi thêm thay đổi nào trong các file này.
- Fixture và cách gọi action (mục 3) nằm **ngoài** 2 file scope; chạy dạng script/bản tạm **không commit** thì không vi phạm AC-08/AC-09 và C-04 (không thêm dependency — tận dụng dev server, trình duyệt, và script Node dùng dependency sẵn có).
- Nếu PO muốn lưu harness/test vào repo vĩnh viễn thì phải mở **task riêng** (không gộp vào TASK-001); không bắt đầu task đó cho tới khi PO ra lệnh.

## 6. Kết luận và các phương án cho PO

**TASK-001 giữ nguyên `BLOCKED` cho tới khi PO chọn một phương án dưới đây.** Qoder không tự chuyển DONE.

| Phương án | Những gì PO cần cung cấp | Kết quả đạt được | Chi phí/rủi ro |
|---|---|---|---|
| **A — Runtime verify đầy đủ (khuyến nghị)** | (1) Môi trường Supabase **không phải production**: xác nhận project hiện tại là dev, HOẶC tạo project test + cung cấp schema dump; (2) 3 tài khoản test khả dụng (xác nhận email đã tắt hoặc đã xác minh sẵn) | Chứng minh thật AC-01…AC-06 + retest tampered + regression; task có cơ sở PASS đúng chuẩn | Một buổi verify sau khi có môi trường; cần dọn dẹp dữ liệu test |
| **B — Chấp nhận static** | Văn bản phê duyệt của PO: chấp nhận static evidence cho AC-01…06 và rủi ro còn lại (schema U01/U02, RLS U09 chưa xác minh; positive path chưa chạy thật) | TASK-001 chuyển DONE theo lệnh của PO, ghi rõ "static acceptance" | Rủi ro lệch schema/RLS phát hiện muộn ở production; mâu thuẫn với tinh thần §15 nếu không có phê duyệt rõ ràng |
| **C — Hybrid** | Xác nhận project `.env.local` là dev; chỉ chạy luồng positive qua UI | AC-02/04/06 có bằng chứng runtime; AC-01/03/05 vẫn static | Yếu hơn A ở phần negative — mà negative chính là trọng tâm bảo mật của task |

**Khuyến nghị tối thiểu để unblock:** Phương án A với fixture 3 user / 2 trips / 3 requests như mục 3.1 — đây là tập hợp nhỏ nhất đủ phủ toàn bộ AC-01…AC-06 và cả kịch bản tampered ID từng FAIL. Bắt đầu bằng việc PO trả lời đúng một câu hỏi: *project Supabase hiện tại trong `.env.local` có phải môi trường dev an toàn để tạo dữ liệu test không?* — nếu có, phương án A thực hiện được ngay mà không cần dựng gì thêm.

---

## Ghi chú

- Không source code nào bị thay đổi khi soạn báo cáo này.
- Không migration/RLS/auth change nào được thực hiện.
- TASK-001, EPIC-01 giữ nguyên trạng thái `BLOCKED` như trong `TASK-001.md` và `EPIC-01-security-authorization.md`.
