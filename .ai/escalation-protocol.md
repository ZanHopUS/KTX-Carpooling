# ESCALATION PROTOCOL — KTX Carpooling

> Khi nào dừng lại và chuyển quyết định cho Product Owner (con người).
> **Nguyên tắc gốc:** thà dừng và hỏi còn hơn tự quyết rồi phá dự án.

---

## 1. Bắt buộc ESCALATE — không được tự quyết

### 1.1 Nhóm HIGH RISK (theo yêu cầu onboarding)
Bất kỳ thay đổi hoặc quyết định nào liên quan tới:

| # | Lĩnh vực |
|---|---|
| H01 | Database schema |
| H02 | Migration |
| H03 | RLS (Row Level Security) |
| H04 | Authentication |
| H05 | Authorization |
| H06 | Security architecture |
| H07 | Vai trò người dùng (user roles) |
| H08 | Quyền hạn (permissions) |
| H09 | Payment / thanh toán |
| H10 | Thao tác dữ liệu có tính phá huỷ |
| H11 | Triển khai production |
| H12 | Thay đổi API theo hướng breaking |
| H13 | Thay đổi kiến trúc lớn |

### 1.2 Nhóm đặc thù KTX Carpooling
| # | Lĩnh vực |
|---|---|
| K01 | Xác minh sinh viên (student verification) |
| K02 | Xác minh xe / phương tiện |
| K03 | Quyền sở hữu chuyến (trip ownership) |
| K04 | Số ghế trống (seat availability) |
| K05 | Yêu cầu ghép chuyến (join request) |
| K06 | Chấp nhận / từ chối (accept/reject) |
| K07 | Huỷ chuyến (cancellation) |
| K08 | Đánh giá (rating) |
| K09 | Báo cáo vi phạm (reporting) |
| K10 | Thông tin liên hệ (contact info) |
| K11 | Thông tin vị trí (location info) |
| K12 | Tích hợp Messenger |

### 1.3 Nhóm xung đột nguồn sự thật
- Tài liệu nói A, code làm B, schema gợi ý C ⇒ **escalate**, không chọn.
- Audit cáo buộc một điều nhưng nguồn chính thức phủ định ⇒ **escalate** kèm phân tích.
- Ưu tiên nghiệp vụ chưa rõ ⇒ **escalate**.

### 1.4 Nhóm không kiểm chứng được
- Cần quyền truy cập DB/môi trường mà không có.
- Acceptance criteria không kiểm được bằng công cụ hiện có.
- Cần quyết định sản phẩm (giữ hay bỏ một tính năng).

---

## 2. KHÔNG cần escalate — tự xử lý

- Sửa lỗi chính tả trong tài liệu `.ai/`.
- Cập nhật `.ai/project-state.md` khi phát hiện sự kiện mới đã kiểm chứng.
- Đọc thêm file để làm rõ.
- Chạy lệnh chỉ đọc.
- Chia nhỏ task trong `.ai/tasks/` (vẫn ở `PROPOSED`, chưa `READY`).

> Ranh giới: **quan sát & ghi nhận** thì tự làm; **thay đổi hệ thống** thì phải hỏi (trừ khi task đã uỷ quyền rõ).

---

## 3. Mẫu escalation

Ghi vào `.ai/reports/escalation-<số>.md`:

```markdown
# ESCALATION — ESC-<số>

## 1. Loại
Database | Security | Authorization | Requirement conflict | Không kiểm chứng được | Khác

## 2. Mức độ
🔴 CHẶN (không thể tiếp tục) | 🟠 CAO (rủi ro lớn, vẫn tiếp tục được) | 🟡 TRUNG BÌNH

## 3. Tóm tắt một câu
...

## 4. Chi tiết
- Phát hiện gì:
- Ở đâu (file:dòng / bảng / policy):
- Bằng chứng:

## 5. Xung đột nguồn (nếu có)
| Nguồn | Nói gì |
|---|---|
| A | |
| B | |
| Implementation | |

## 6. Ảnh hưởng
- Nếu không xử lý:
- Nếu chọn phương án A:
- Nếu chọn phương án B:

## 7. Phương án đề xuất (kèm khuyến nghị)
| # | Phương án | Ưu | Nhược | Rủi ro |
|---|---|---|---|---|

**Khuyến nghị của Orchestrator:** ...

## 8. Cần PO quyết định
1. ...
2. ...

## 9. Việc bị chặn cho tới khi có quyết định
- Task: ...
- Epic: ...
```

---

## 4. Escalation phải nêu rõ 4 điều

1. **Cái gì** đang chặn/đang mâu thuẫn.
2. **Bằng chứng** ở đâu (file:dòng hoặc lệnh đã chạy).
3. **Vì sao không thể tự quyết** (thuộc nhóm nào ở mục 1).
4. **Đề xuất** phương án + khuyến nghị — trình bày để PO quyết trong 1 phút, không đẩy vấn đề thô cho PO.

> Escalation tốt = PO chỉ cần chọn A/B. Escalation tồi = "có lỗi, làm gì giờ?".

---

## 5. Hành vi khi chờ quyết định

- Chuyển task liên quan sang `ESCALATED` trong `.ai/tasks/`.
- **Không** dừng toàn bộ dự án nếu còn việc độc lập — chuyển sang task không bị chặn.
- Ghi rõ task nào phụ thuộc vào quyết định này.
- Không tự thực hiện phương án "tạm" để rồi tính sau.
- Không hỏi lại cùng một vấn đề nhiều lần — gom vào một escalation.

---

## 6. Ví dụ đã gặp trong dự án này

| Tình huống | Xử lý đúng |
|---|---|
| Audit nói `src/proxy.ts` phải là `middleware.ts`, nhưng Next.js 16 đã đổi tên | **Đã ghi nhận + escalate**: nguồn chính thức (`node_modules/next/dist/docs/`) phủ định audit ⇒ không "sửa" theo audit |
| Code dùng `trips.date`, tài liệu nói `trips.trip_date` | **Escalate** — cần PO xác nhận cột thật, không tự đổi bên nào |
| Enum `role` HOA (code) vs thường (schema comment) | **Escalate** — ảnh hưởng toàn bộ so sánh quyền |
| `admin/verifications/actions.ts` thiếu kiểm tra ADMIN | **Ghi nhận + Escalate** — đây là lỗ hổng uỷ quyền (H05 + K01), không được tự sửa trong onboarding |
| Không truy cập được DB thật ⇒ mọi tên cột là `UNKNOWN` | **Escalate** — đề nghị PO cung cấp schema dump hoặc kết nối read-only |
