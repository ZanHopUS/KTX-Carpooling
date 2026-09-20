# EXECUTION PROTOCOL — KTX Carpooling

> Quy trình bắt buộc cho **Execution Agent (Antigravity)** khi nhận và thực thi một task.
> Mọi vi phạm phải được ghi vào `.ai/reports/`.

---

## 1. Điều kiện được phép bắt đầu

Execution Agent **CHỈ** được bắt đầu khi **tất cả** điều kiện sau đúng:

- [ ] Task tồn tại trong `.ai/tasks/` dưới dạng file `.md`
- [ ] Trạng thái task = **`READY`** (không phải `PROPOSED`, `BLOCKED`, `ESCALATED`)
- [ ] Task có **đủ 18 trường** theo mẫu (xem `.ai/tasks/TASK-001.md`)
- [ ] `DEPENDENCIES` đã thoả (không còn task phụ thuộc ở trạng thái chưa xong)
- [ ] `SCOPE` liệt kê rõ file được phép sửa
- [ ] `DO NOT TOUCH` liệt kê rõ file bị cấm
- [ ] `ACCEPTANCE CRITERIA` kiểm chứng được (không mơ hồ)
- [ ] PO đã phê duyệt mở task (hoặc Orchestrator đã chuyển sang `READY` theo uỷ quyền)

> ❌ Nếu bất kỳ điều kiện nào không đạt ⇒ **DỪNG**, báo Orchestrator. Không tự suy diễn.

---

## 2. Quy trình 8 bước

### Bước 1 — Đọc và xác nhận
1. Đọc **toàn bộ** file task, không chỉ tiêu đề.
2. Đọc `.ai/constitution.md` và các file `.ai/` liên quan trong `SOURCE OF TRUTH`.
3. Đọc các file trong `FILES/MODULES` **trước khi sửa** — không sửa mù.
4. Viết lại ngắn gọn vào báo cáo: *hiểu gì, sẽ làm gì, không làm gì*. Nếu hiểu sai ⇒ Orchestrator sửa lại task trước khi code.

### Bước 2 — Kiểm tra trạng thái nền
1. `git status` — xác nhận cây làm việc sạch, ghi lại hash commit hiện tại.
2. Nếu có thay đổi chưa commit **không phải của mình** ⇒ **DỪNG**, báo Orchestrator (không xoá, không stash).
3. Ghi lại commit hash làm mốc rollback.

### Bước 3 — Thu thập bằng chứng "trước"
- Với mỗi lỗi cần sửa: chụp lại/log lại hành vi hiện tại **trước khi sửa**.
- Lưu vào `.ai/reports/` hoặc phần `EVIDENCE` của báo cáo.
- Mục đích: chứng minh vấn đề có thật và chứng minh đã sửa được.

### Bước 4 — Thực thi trong phạm vi
- **Chỉ sửa file trong `SCOPE`.**
- **Không sửa** bất kỳ file trong `DO NOT TOUCH`.
- Không "tiện tay" refactor, format lại, đổi tên, xoá comment, sắp xếp import ở file ngoài scope.
- Không thêm dependency mới.
- Không thay đổi schema DB / migration / RLS / auth **trừ khi task ghi rõ và PO đã duyệt**.
- Thay đổi **nhỏ nhất** đủ để đạt acceptance criteria.
- Giữ nguyên ngôn ngữ comment và style hiện có của file.

### Bước 5 — Tự kiểm tra
Chạy tối thiểu:
```bash
npx tsc --noEmit      # hoặc npm run build
npm run lint         # nếu có
```
- Ghi lại **nguyên văn** kết quả (pass/fail), không tóm tắt qua loa.
- Nếu lỗi phát sinh **ngoài phạm vi task** ⇒ ghi nhận, không sửa, báo Orchestrator.

### Bước 6 — Kiểm chứng acceptance criteria
- Đi qua **từng** tiêu chí trong `ACCEPTANCE CRITERIA`.
- Mỗi tiêu chí: nêu rõ **cách đã kiểm** và **kết quả**.
- Tiêu chí không kiểm được ⇒ ghi `KHÔNG KIỂM ĐƯỢC` + lý do. Không đánh dấu pass.

### Bước 7 — Báo cáo
Ghi báo cáo vào `.ai/reports/` (hoặc theo `EXPECTED OUTPUT` của task), gồm:

```markdown
# EXECUTION REPORT — <TASK-ID>

## 1. Trạng thái
DONE | PARTIAL | BLOCKED | ESCALATED

## 2. Commit mốc
<trước> → <sau>

## 3. File đã thay đổi
| File | Loại | Mô tả |
|---|---|---|

## 4. Bằng chứng TRƯỚC khi sửa
...

## 5. Bằng chứng SAU khi sửa
...

## 6. Kết quả kiểm tra tự động
- tsc/build: <nguyên văn kết quả>
- lint: <nguyên văn kết quả>

## 7. Acceptance criteria
| # | Tiêu chí | Kiểm bằng cách nào | Kết quả |
|---|---|---|---|

## 8. Ngoài phạm vi / phát hiện thêm
(ghi nhận, KHÔNG sửa)

## 9. Rủi ro còn lại
...

## 10. Đề xuất bước tiếp theo
...
```

### Bước 8 — Bàn giao
- Chuyển task sang `IN_REVIEW`.
- **Không** tự đánh dấu `DONE`.
- **Không** tự mở task mới.
- **Không** tự commit/push nếu chưa được yêu cầu.

---

## 3. Quy tắc commit

- Chỉ commit khi PO hoặc Orchestrator yêu cầu.
- **1 task = 1 commit** (trừ khi task ghi khác).
- Thông điệp commit: tiếng Việt, mô tả **vì sao**, không mô tả chung chung.
- Không commit: `.env.local`, credentials, `node_modules`, file build.
- Không `git commit --amend` lên commit đã push.
- Không `git push --force` lên `main`.

---

## 4. Cấm tuyệt đối trong execution

| Cấm | Lý do |
|---|---|
| Sửa file ngoài `SCOPE` | Phá vỡ kiểm soát thay đổi |
| Chạy migration / DDL / DML lên DB thật | Không thể hoàn tác |
| Đổi auth / authorization / RLS ngoài task | Rủi ro bảo mật |
| Xoá file | Mất dữ liệu |
| Thêm dependency | Tăng bề mặt tấn công, cần PO duyệt |
| Sửa bug "tiện tay" phát hiện dọc đường | Ngoài scope — chỉ ghi nhận |
| `git reset --hard` / `clean -f` / `push --force` | Mất việc của người khác |
| Bỏ qua hook (`--no-verify`) | Che giấu lỗi |
| Đánh dấu `DONE` khi tiêu chí chưa pass | Sai lệch trạng thái dự án |

---

## 5. Khi bị chặn giữa chừng

1. **DỪNG NGAY** — không cố lách.
2. Ghi rõ: đang làm gì, chặn ở đâu, đã thử gì, cần gì.
3. Chuyển task sang `BLOCKED` (thiếu thông tin/kỹ thuật) hoặc `ESCALATED` (cần PO quyết).
4. Theo `.ai/escalation-protocol.md`.
5. **Không tự ý mở rộng phạm vi** để tự gỡ chặn.

---

## 6. Nguyên tắc "một thay đổi, một lý do"

- Mỗi thay đổi phải trả lời được: *nó phục vụ acceptance criteria nào?*
- Không trả lời được ⇒ không nằm trong task ⇒ bỏ ra.
- Thay đổi nhỏ, dễ review, dễ rollback luôn thắng thay đổi lớn "cho gọn".
