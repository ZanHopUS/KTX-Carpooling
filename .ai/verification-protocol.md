# VERIFICATION PROTOCOL — KTX Carpooling

> Quy trình kiểm chứng **độc lập**. Người kiểm chứng **không được** là người đã viết code cho task đó.
> Mục tiêu: chứng minh task **thực sự** đạt acceptance criteria — không tin vào báo cáo của Execution Agent.

---

## 1. Nguyên tắc nền

1. **Không tin báo cáo — tin bằng chứng.** Báo cáo của Execution Agent là *tuyên bố*, không phải *sự thật*.
2. **Đọc diff thật**, không đọc mô tả diff.
3. **Tự chạy lại** kiểm tra, không dùng lại kết quả đã dán.
4. **Kiểm cả cái không được sửa** — xác nhận `DO NOT TOUCH` còn nguyên.
5. Nghi ngờ mặc định: nếu không chứng minh được là đúng ⇒ coi là **chưa đạt**.

---

## 2. Quy trình 7 bước

### Bước 1 — Xác minh phạm vi (Scope check)
```bash
git status
git diff --stat <commit-mốc>..HEAD
```
Kiểm tra:
- [ ] Mọi file thay đổi đều nằm trong `SCOPE` của task
- [ ] **Không** file nào trong `DO NOT TOUCH` bị chạm
- [ ] Không có file rác, file tạm, `.env`, ảnh chụp bị commit nhầm
- [ ] Không có thay đổi "tiện tay" (format, đổi tên, xoá comment ngoài scope)

> Phát hiện file ngoài scope ⇒ **REJECT** ngay, không cần xem tiếp logic.

### Bước 2 — Đọc diff thật
Đọc **toàn bộ** `git diff` của task, từng dòng. Không đọc bản tóm tắt.
Câu hỏi cần trả lời:
- Thay đổi có thực sự giải quyết vấn đề, hay chỉ che dấu triệu chứng?
- Có nhánh logic nào bị bỏ sót?
- Có xử lý trường hợp biên: null, rỗng, giá trị lạ, người dùng không tồn tại?
- Có vô tình đổi hành vi ở chỗ khác không?

### Bước 3 — Chạy kiểm tra tự động
```bash
npx tsc --noEmit
npm run lint
npm run build
```
- [ ] Tất cả pass **sạch** (không warning mới)
- [ ] Không có `any` mới được thêm vào
- [ ] Không có `// @ts-ignore` / `eslint-disable` mới
- [ ] Output khớp với báo cáo của Execution Agent

### Bước 4 — Kiểm chứng từng acceptance criteria
Với **mỗi** tiêu chí:
1. Nêu cách kiểm độc lập (khác cách Execution Agent đã dùng, nếu có thể).
2. Thực hiện kiểm.
3. Ghi kết quả nhị phân: **PASS / FAIL / KHÔNG KIỂM ĐƯỢC**.
4. Tiêu chí `KHÔNG KIỂM ĐƯỢC` ⇒ **không được coi là PASS**.

> Task bị coi là **KHÔNG ĐẠT** nếu có bất kỳ tiêu chí FAIL, hoặc nếu chỉ toàn `KHÔNG KIỂM ĐƯỢC`.

### Bước 5 — Kiểm chứng tiêu cực (Negative testing)
Đây là bước quan trọng nhất với các task bảo mật/uỷ quyền. Với mỗi kiểm tra uỷ quyền được thêm vào, phải thử **phá nó**:

| Kịch bản tấn công | Kỳ vọng |
|---|---|
| Người dùng A gọi action nhắm vào tài nguyên của B | Bị từ chối |
| Người chưa đăng nhập gọi action | Bị từ chối |
| Người đã đăng nhập nhưng không phải thành viên chuyến | Bị từ chối |
| Tham số nhận từ client bị sửa (id giả, id của người khác) | Bị từ chối |
| Trạng thái không hợp lệ (ví dụ chuyến đã `COMPLETED` rồi đổi lại `OPEN`) | Bị từ chối |

Với task DB/schema: thử cả trường hợp **giá trị sai case** (HOA/thường) và **cột không tồn tại**.

### Bước 6 — Kiểm chứng hồi quy
- [ ] Luồng chính liên quan vẫn chạy đúng (đăng nhập, xem chuyến, gửi yêu cầu…)
- [ ] Không có lỗi mới ở console/terminal khi chạy app
- [ ] Các chức năng lân cận không bị ảnh hưởng
- [ ] Nếu là task uỷ quyền: **người dùng hợp lệ vẫn làm được** việc của họ (không chặn nhầm)

> Chặn nhầm người hợp lệ là lỗi nghiêm trọng ngang với bỏ lọt kẻ tấn công.

### Bước 7 — Kết luận
Ghi vào `.ai/reports/`:

```markdown
# VERIFICATION REPORT — <TASK-ID>

## 1. Kết luận
PASS | FAIL | PARTIAL | KHÔNG KIỂM ĐƯỢC

## 2. Phạm vi
- Commit kiểm: <hash>
- File thay đổi: <n> — ngoài scope: <0 | danh sách>

## 3. Kiểm tra tự động
| Lệnh | Kết quả |
|---|---|

## 4. Acceptance criteria
| # | Tiêu chí | Cách kiểm độc lập | Kết quả |
|---|---|---|---|

## 5. Kiểm chứng tiêu cực
| Kịch bản | Kỳ vọng | Thực tế |
|---|---|---|

## 6. Hồi quy
...

## 7. Phát hiện ngoài phạm vi (ghi nhận, không sửa)
...

## 8. Đề xuất
Chấp nhận | Yêu cầu sửa lại (kèm danh sách) | Escalate
```

---

## 3. Ma trận kiểm chứng theo loại task

| Loại task | Bắt buộc kiểm thêm |
|---|---|
| **Bảo mật / uỷ quyền** | Kiểm chứng tiêu cực đầy đủ; kiểm tra mọi đường vào (page + server action + API route); xác nhận không chỉ chặn ở UI |
| **Database / schema** | Xác nhận tên cột + giá trị enum thật; kiểm case HOA/thường; kiểm dữ liệu hiện có có bị ảnh hưởng |
| **Nghiệp vụ (matching, pricing)** | Kiểm trường hợp biên: 0 km, khoảng cách rất lớn, giờ lệch đúng 5 phút, không có ghế; kiểm tính tất định của kết quả |
| **UI** | Chạy app thật, thao tác thật; kiểm mobile + desktop; kiểm trạng thái rỗng/lỗi/đang tải |
| **Tích hợp ngoài (OSRM, Gemini, Messenger)** | Kiểm khi dịch vụ lỗi/timeout ⇒ phải có fallback; không để lộ key |

---

## 4. Dấu hiệu cần REJECT ngay

- Có file ngoài `SCOPE` bị sửa
- Bỏ qua kiểm tra uỷ quyền bằng cách dựa vào UI (`disabled`, ẩn nút)
- Bật `// @ts-ignore` hoặc `any` để né lỗi type
- Bắt `try/catch` rồi `return true` để né lỗi
- Sửa triệu chứng thay vì nguyên nhân (ví dụ đổi tên cột trong code để "khớp" thay vì xác minh DB)
- Thêm dependency mà không có trong task
- Đánh dấu `DONE` khi còn tiêu chí chưa pass
- Diff quá lớn so với mô tả task

---

## 5. Bàn giao kết quả

- **PASS** ⇒ Orchestrator chuyển task sang `DONE`, cập nhật `.ai/project-state.md`.
- **FAIL** ⇒ trả về Execution Agent kèm danh sách cụ thể cần sửa; **không** mở task mới.
- **PARTIAL** ⇒ tách phần chưa đạt thành task riêng nếu phù hợp; ghi vào roadmap.
- **KHÔNG KIỂM ĐƯỢC** ⇒ escalate theo `.ai/escalation-protocol.md` (thường do thiếu quyền truy cập DB/môi trường).
