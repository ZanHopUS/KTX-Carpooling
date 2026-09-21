# VERIFICATION REPORT — TASK-001

## 1. Kết luận

**PASS (static) — runtime AC-01…AC-06 giữ KHÔNG KIỂM ĐƯỢC theo phê duyệt của PO (2026-09-21)**

Lỗi tampered `requestId` từng làm TASK-001 fail đã được khắc phục qua static verification. `rejectTripRequestAction` hiện đọc `trip_requests.trip_id`, từ chối request không tồn tại hoặc không thuộc `tripId`, sau đó mới xác minh tài xế; mutation cũng bị ràng buộc theo cả `id` và `trip_id` tại `src/app/(main)/trips/[id]/actions.ts:124-146`.

Các AC runtime đòi hỏi fixture + dữ liệu DB trước/sau. Đợt kiểm thử runtime được PO duyệt đã thực hiện thử (2026-09-21) nhưng bị chặn ngay ở bước tạo trip — code và DB thật lệch nhau toàn bộ thiết kế (chi tiết §9). PO chọn ghi nhận static verification; việc đồng bộ code ↔ DB chuyển sang EPIC-03, kèm re-verify runtime sau đó. Không có source code nào được Qoder sửa trong quá trình verify.

## 2. Phạm vi

- Commit mốc: `d83f362138bd7c151d3fed3e4aa7f47014f64581` (`Update`).
- Đối tượng kiểm: working tree chưa commit trên commit mốc.
- Source thay đổi: đúng 2 file trong scope:
  - `src/app/(main)/trips/[id]/actions.ts`
  - `src/app/(main)/trips/[id]/chat/actions.ts`
- Metadata được phép: trạng thái task/epic và hai báo cáo trong `.ai/`, theo Expected Output.
- Không có thay đổi source ngoài scope, UI, database, migration, RLS, authentication hoặc dependency.
- Chưa có commit TASK-001; yêu cầu một commit duy nhất chỉ thực hiện sau khi có kết quả PASS đầy đủ.

## 3. Kiểm tra tự động

| Lệnh | Kết quả |
|---|---|
| `git diff` / `git diff --check` | PASS — đọc toàn bộ diff; không có lỗi whitespace |
| `npx tsc --noEmit` | PASS — exit code 0, không output |
| `npm run build` | PASS — Next.js 16.3.5 production build hoàn tất |
| `npm run lint` | FAIL — 8 errors và 12 warnings ngoài hunk TASK-001; không có `any`, `@ts-ignore` hoặc `eslint-disable` được thêm trong ba action |

## 4. Retest lỗi đã FAIL

| Kịch bản | Kỳ vọng | Bằng chứng độc lập | Kết quả |
|---|---|---|---|
| Driver chuyến A truyền `requestId` thuộc chuyến B cùng `tripId=A` | Bị từ chối, không ghi request B | `request.trip_id !== tripId` trả lỗi chung tại `actions.ts:131-133`, trước truy vấn driver, mutation, kiểm pending hoặc revalidate | PASS (static) |
| `requestId` không tồn tại | Bị từ chối, không ghi dữ liệu | `!request` đi cùng nhánh trả lỗi tại `actions.ts:131-133`, trước mọi thao tác ghi | PASS (static) |
| Driver hợp lệ của chuyến B từ chối request thuộc B | Vẫn được phép | Request khớp `tripId`, driver check pass, mutation được scope theo `id` và `trip_id` tại `actions.ts:141-146` | PASS (static) |

## 5. Acceptance criteria

| # | Tiêu chí | Cách kiểm độc lập | Kết quả |
|---|---|---|---|
| AC-01 | Người không liên quan không thể từ chối request chuyến khác | Static trace từ request ownership tới driver check cho thấy bị từ chối trước mutation; chưa kiểm DB trước/sau | KHÔNG KIỂM ĐƯỢC |
| AC-02 | Tài xế từ chối request chuyến mình | Static trace cho phép nhánh hợp lệ; chưa xác nhận status DB | KHÔNG KIỂM ĐƯỢC |
| AC-03 | Người không liên quan không thể gửi chat | `sendMessageAction` kiểm driver/accepted passenger trước insert; chưa kiểm DB trước/sau | KHÔNG KIỂM ĐƯỢC |
| AC-04 | Driver và accepted passenger vẫn chat được | Hai nhánh cho phép còn nguyên; chưa có hai tài khoản test | KHÔNG KIỂM ĐƯỢC |
| AC-05 | Người không liên quan không thể đổi trạng thái | `updateTripStatusAction` kiểm driver trước update; chưa kiểm DB trước/sau | KHÔNG KIỂM ĐƯỢC |
| AC-06 | Tài xế vẫn đổi trạng thái được | Nhánh driver hợp lệ còn nguyên; chưa xác nhận update DB | KHÔNG KIỂM ĐƯỢC |
| AC-07 | TypeScript không phát sinh lỗi | Chạy `npx tsc --noEmit` độc lập | PASS |
| AC-08 | Diff source chỉ sửa hai file và ba action trong scope | Đọc toàn bộ `git diff` | PASS |
| AC-09 | Không có source ngoài scope thay đổi | Kiểm `git status` và diff; metadata `.ai/` là báo cáo/trạng thái bắt buộc | PASS |

## 6. Kiểm chứng tiêu cực và regression

| Kịch bản | Kết quả |
|---|---|
| Chưa đăng nhập gọi ba action | PASS (static): cả ba return trước truy vấn/ghi |
| Người không liên quan dùng đúng `tripId` chuyến khác | PASS (static): driver/accepted passenger check từ chối trước ghi |
| Passenger PENDING, REJECTED hoặc CANCELLED gửi chat | PASS (static): chỉ `ACCEPTED` được phép |
| `tripId` không tồn tại | PASS (static): các action trả lỗi chung trước ghi |
| Tampered `requestId` thuộc trip khác | PASS (static): ownership check và scoped mutation chặn đường tấn công |
| Luồng driver hợp lệ reject request đúng trip | PASS (static): signature và call site `RequestsClient.tsx:25` không đổi |
| Luồng chat/status hợp lệ và không liên quan | PASS (static): các nhánh authorization trong `chat/actions.ts:7-78` không bị thay đổi bởi lượt sửa này |
| Luồng end-to-end và xác nhận DB trước/sau | KHÔNG KIỂM ĐƯỢC: không có fixture, tài khoản nhiều vai trò hoặc môi trường Supabase kiểm thử được phê duyệt |

## 7. Phát hiện ngoài phạm vi

- `npm run lint` vẫn có 8 errors và 12 warnings tại các file ngoài hunk TASK-001; không sửa trong lượt verify.
- Không phát hiện source change ngoài scope.
- Không có test integration/fixture dự án để chạy các action với dữ liệu DB thật.

## 8. Đề xuất

**Escalate Product Owner để gỡ BLOCKED.** Cần một trong hai quyết định sau:

1. Cung cấp môi trường Supabase không phải production cùng fixture/tài khoản cho driver, accepted passenger và user không liên quan để xác minh AC-01…AC-06 cùng dữ liệu DB trước/sau; hoặc
2. Chấp thuận bằng văn bản việc đánh giá TASK-001 theo static verification, chấp nhận rằng các AC DB sẽ không có bằng chứng runtime.

Không yêu cầu Antigravity sửa thêm: lỗi authorization đã FAIL trước đó đã pass static re-test. Không bắt đầu task mới.

---

## 9. Phê duyệt & chốt của Product Owner (2026-09-21)

### 9.1 Chuỗi sự kiện sau khi báo cáo BLOCKED

1. PO xác nhận môi trường DEV (checklist trong `ENVIRONMENT-ASSESSMENT-TASK-001.md` §7): project
   DEV, 2 user thật (PO + admin), bảng `ratings` tồn tại, bảng `messages` KHÔNG tồn tại,
   `routes`/`locations` có dữ liệu thật.
2. PO duyệt "duyệt toàn bộ" (2026-09-21): fixture 3 user + 2 trips + requests, chạy TC-1…TC-11,
   đồng thời duyệt chủ trương tạo TASK-002 (migration bảng `messages`).
3. Fixture run bắt đầu: đăng ký user test B thành công; tạo trip T1 **thất bại** — `PGRST204`
   (`available_seats` không tồn tại). Log đầy đủ: `RUNTIME-LOG-TASK-001.md`.
4. PO cung cấp CSV cột thật của `trips` (Dashboard → SQL Editor): bảng là **một thiết kế khác
   hoàn toàn** (27 cột, normalized với `vehicle_id`/`route_id`/`pickup_location_id`) — 14/17 cột
   code insert không tồn tại; không dòng code nào dùng thiết kế thật. Chi tiết:
   `database-context.md` §16.
5. PO chọn phương án **A1** (AskUserQuestion, 2026-09-21): ghi nhận TASK-001 = static
   verification PASS; runtime ACs giữ KHÔNG KIỂM ĐƯỢC; mở EPIC đồng bộ code ↔ DB (giao về
   EPIC-03); re-verify runtime authorization sau khi EPIC đó hoàn thành.

### 9.2 Kết quả AC chốt

| Nhóm | AC | Kết quả chốt |
|---|---|---|
| Static | AC-07, AC-08, AC-09 | **PASS** (mục 5) |
| Runtime | AC-01, AC-02, AC-03, AC-05, AC-06 | **KHÔNG KIỂM ĐƯỢC — defer sang EPIC-03** (lý do: code ↔ DB lệch toàn bộ thiết kế; fixture không tạo được qua UI) |
| Runtime (chat) | AC-04 | **KHÔNG KIỂM ĐƯỢC — phụ thuộc TASK-002** (bảng `messages` không tồn tại trên DB) |

### 9.3 Di sản cần theo dõi

- **Re-verify runtime** cho 3 action của TASK-001 là điều kiện hoàn thành của EPIC-03 (task riêng).
- User test `devtest.b@devtest.edu.vn` (id `4617a9f6-4631-405a-ace5-7efd79348adc`) còn trong
  `auth.users` + `profiles` của project DEV: PO có thể giữ cho đợt re-verify sau EPIC-03, hoặc
  tự xoá bằng Dashboard → Authentication → Users.
- Lỗi sản phẩm "Đăng chuyến hỏng với mọi user" là nguyên nhân gốc của việc defer — chuyển sang
  EPIC-03 xử lý.
