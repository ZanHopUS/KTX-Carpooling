# EPIC-05 — Critical Functional Gaps

| Trường | Giá trị |
|---|---|
| **EPIC ID** | EPIC-05 |
| **Tên** | Critical Functional Gaps |
| **Ưu tiên** | 5 (Critical functional gaps) |
| **Mức độ** | 🟠 Cao |
| **Trạng thái** | `PROPOSED` |
| **Phụ thuộc** | EPIC-03 (cần xác minh bảng `ratings`, `messages`) |

---

## 1. Goal

Bù những mảng nghiệp vụ mà tài liệu/UI đã cam kết nhưng **chưa được cài đặt đầy đủ**, để hệ thống không hứa những gì nó không làm được.

---

## 2. Current state (bằng chứng)

| # | Khoảng trống | Bằng chứng |
|---|---|---|
| 1 | **Đánh giá không có tác dụng**: không chống trùng, không kiểm tra chuyến `COMPLETED`, **không cập nhật `profiles.rating`** ⇒ tiêu chí "+10 uy tín" trong matching vô nghĩa | `chat/actions.ts:57-70` |
| 2 | Bảng `ratings` tồn tại nhưng schema/runtime chưa xác minh ⇒ chức năng đánh giá vẫn có thể hỏng âm thầm | `chat/actions.ts:63`, database evidence 2026-09-21 |
| 3 | **Không cưỡng chế xác minh**: người chưa xác minh vẫn đăng chuyến & gửi yêu cầu được | `trips/actions.ts`, `trips/[id]/actions.ts:7` |
| 4 | **Báo cáo vi phạm chưa tồn tại** dù landing cam kết | `types/database.ts:72` (chỉ có type, không dùng) |
| 5 | `completed_trip_count` **không bao giờ được tăng** ⇒ thành tích người dùng luôn = 0 | không nơi nào ghi cột này |
| 6 | `cancelled_trip_count` không bao giờ được tăng | không nơi nào ghi cột này |
| 7 | **Không có cơ chế thông báo** khi có yêu cầu mới / được chấp nhận | không có bảng notifications |
| 8 | **Không có huỷ chuyến phía tài xế** | `trips/[id]/actions.ts` — chỉ có huỷ yêu cầu phía hành khách |
| 9 | Chat không realtime | `ChatClient.tsx` — gửi action rồi cập nhật state cục bộ |
| 10 | Chuyến `REQUESTED` không tự quay lại `OPEN` khi hành khách huỷ — chỉ đúng nếu còn yêu cầu khác | `trips/[id]/actions.ts:136` |

---

## 3. Target state

- [ ] Đánh giá: chỉ sau chuyến `COMPLETED`, mỗi cặp chỉ 1 lần, có cập nhật điểm trung bình về `profiles`.
- [ ] Bảng `ratings`/`messages` được xác minh tồn tại và có DDL trong repo.
- [ ] Cưỡng chế xác minh theo quyết định của PO (Q7).
- [ ] `completed_trip_count` / `cancelled_trip_count` được cập nhật đúng sự kiện.
- [ ] Báo cáo vi phạm: có hoặc **bỏ khỏi UI** để không quảng cáo sai.
- [ ] Trạng thái chuyến luôn phản ánh đúng thực tế sau mọi thao tác huỷ.

---

## 4. Dependencies

| Loại | Nội dung |
|---|---|
| Phụ thuộc | **EPIC-03** — xác minh bảng `ratings`, `messages`, cột `*_trip_count` |
| Cần PO | **Q5** — bảng `ratings`/`messages` có tồn tại? |
| Cần PO | **Q7** — có cưỡng chế "chỉ sinh viên đã xác minh"? |
| Cần PO | **Q8** — báo cáo vi phạm có nằm trong phạm vi phát hành? |
| Cần PO | Có cần thông báo (in-app/email) trong phiên bản này? |

---

## 5. Risk

| Rủi ro | Mức | Giảm thiểu |
|---|---|---|
| Cưỡng chế xác minh đột ngột ⇒ người dùng hiện tại bị chặn | 🟠 Cao | Cần PO chốt lộ trình; cân nhắc giai đoạn chuyển tiếp |
| Cập nhật `profiles.rating` sai công thức ⇒ điểm uy tín lệch | 🟠 Cao | Chốt công thức trung bình trước khi code |
| Chống trùng đánh giá mà không có ràng buộc DB ⇒ vẫn lách được | 🟡 TB | Cần unique constraint ở DB (thuộc EPIC-03) |
| Bỏ tính năng báo cáo khỏi UI ⇒ mất cam kết với người dùng | 🟡 TB | Chỉ bỏ nếu PO đồng ý |

---

## 6. Tasks

| Task | Tên | Trạng thái |
|---|---|---|
| TASK-00x *(đề xuất)* | Hoàn thiện luồng đánh giá (chống trùng, kiểm tra `COMPLETED`, cập nhật điểm) | `PROPOSED` — chờ Q5 |
| TASK-00x *(đề xuất)* | Cập nhật `completed_trip_count` / `cancelled_trip_count` theo sự kiện | `PROPOSED` |
| TASK-00x *(đề xuất)* | Cưỡng chế "chỉ sinh viên đã xác minh" ở server action | `PROPOSED` — chờ Q7 |
| TASK-00x *(đề xuất)* | Sửa trạng thái chuyến khi hành khách huỷ (đưa về `OPEN` nếu không còn yêu cầu) | `PROPOSED` |
| TASK-00x *(đề xuất)* | Thêm huỷ chuyến phía tài xế | `PROPOSED` |
| TASK-00x *(đề xuất)* | Báo cáo vi phạm (bảng + luồng + UI admin) **hoặc** bỏ khỏi landing | `PROPOSED` — chờ Q8 |

---

## 7. Điều kiện hoàn thành EPIC

- [ ] Không còn tính năng nào được landing page quảng cáo mà chưa tồn tại
- [ ] Điểm uy tín (`profiles.rating`) thay đổi thật sau khi có đánh giá
- [ ] Trạng thái chuyến luôn nhất quán sau mọi thao tác huỷ

## 8. Reconciliation với DB live (2026-09-21)

- `ratings` **đã tồn tại** trên DB DEV; schema cột và khả năng chạy runtime vẫn chưa được xác minh. Code dùng `stars`, trong khi mô hình docs dùng `score`.
- `messages` **không tồn tại** trên DB DEV; chat hiện là functional gap thực tế, không chỉ là bảng chưa kiểm tra.
- `notifications` và `trip_reports` mới ở mức `DOCUMENTED`/type; chưa được coi là bảng live.
- `trips` normalized đang chặn toàn bộ luồng tạo trip, nên EPIC-05 chỉ bắt đầu sau khi EPIC-03 chốt baseline và mapping dữ liệu.
