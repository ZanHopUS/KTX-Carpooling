# EPIC-01 — Security & Authorization Hardening

| Trường | Giá trị |
|---|---|
| **EPIC ID** | EPIC-01 |
| **Tên** | Security & Authorization Hardening |
| **Ưu tiên** | 1 (theo constitution §8 — Security/Authorization) |
| **Mức độ** | 🔴 Chặn — hệ thống không an toàn để dùng thật |
| **Trạng thái** | `PROPOSED` |
| **Phụ thuộc** | Không (có thể bắt đầu ngay). Riêng task về quyền ADMIN cần Q6 (cơ chế tạo ADMIN). |

---

## 1. Goal

Đảm bảo **mọi thao tác ghi dữ liệu đều được kiểm tra uỷ quyền ở tầng server**, không phụ thuộc vào việc UI có ẩn nút hay không. Kết thúc epic, một người dùng đã đăng nhập nhưng không có quyền **không thể** thao tác lên tài nguyên của người khác bằng bất kỳ đường nào.

---

## 2. Current state (bằng chứng)

| # | Lỗ hổng | Vị trí |
|---|---|---|
| 1 | Không có kiểm tra vai trò ADMIN ở bất kỳ đâu — `grep "role === 'ADMIN'"` = **0 kết quả** | `admin/verifications/actions.ts:13,30`; `admin/verifications/page.tsx:16`; `admin/page.tsx` (không kiểm tra gì) |
| 2 | `rejectTripRequestAction` không kiểm tra chủ sở hữu — chỉ `if (!user)` | `trips/[id]/actions.ts:118` (kiểm tra ở :122, update ở :125) |
| 3 | `updateTripStatusAction` không kiểm tra thành viên chuyến — chỉ `if (!user)` | `chat/actions.ts:30` (:34) |
| 4 | `sendMessageAction` không kiểm tra thành viên chuyến — chỉ `if (!user)` | `chat/actions.ts:7` (:11) |
| 5 | `submitRatingAction` thiếu ràng buộc — chỉ `if (!user)` | `chat/actions.ts:57` (:61) |
| 6 | `/admin` không được `proxy.ts` bảo vệ và không tự kiểm tra | `admin/page.tsx` |
| 7 | Webhook Messenger không xác thực chữ ký `X-Hub-Signature-256` | `api/webhooks/messenger/route.ts` |
| 8 | Endpoint AI không xác thực, không rate limit | `api/ai/search/route.ts`, `api/ai/parse-intent/route.ts` |
| 9 | Gemini API key truyền qua query param `?key=` | `lib/ai.ts` |

**Đối chứng tích cực** (đã làm đúng, dùng làm mẫu để noi theo):
- `acceptTripRequestAction` — `trips/[id]/actions.ts:86`: `if (!trip || trip.driver_id !== user.id)`
- `cancelTripRequestAction` — `trips/[id]/actions.ts:154`: `.eq('passenger_id', user.id)`
- `chat/page.tsx:39`: `if (!isDriver && acceptedReq?.passenger_id !== user.id)`

---

## 3. Target state

- [ ] 100% server action ghi dữ liệu đều xác thực: (1) đã đăng nhập, (2) có quyền trên **tài nguyên cụ thể**.
- [ ] Kiểm tra uỷ quyền diễn ra ở **server action / route handler**, không chỉ ở page.
- [ ] `/admin` và mọi route con yêu cầu vai trò `ADMIN`, kiểm tra ở cả 3 lớp: proxy (tuỳ chọn), page, action.
- [ ] Không lộ thông tin nhạy cảm qua tham số URL (API key).
- [ ] Webhook xác thực chữ ký trước khi xử lý payload.
- [ ] Endpoint AI yêu cầu đăng nhập + giới hạn tần suất.

---

## 4. Dependencies

| Loại | Nội dung |
|---|---|
| Cần PO quyết | **Q6** — Cơ chế tạo tài khoản ADMIN (để kiểm thử đúng) |
| Cần PO quyết | Có giữ tầng kiểm tra uỷ quyền ở page + action (phòng thủ nhiều lớp) hay chỉ ở action? |
| Kỹ thuật | Xác nhận RLS thật của DB (nếu RLS đã chặn, mức độ khai thác giảm — nhưng vẫn phải sửa code) |

---

## 5. Risk

| Rủi ro | Mức | Giảm thiểu |
|---|---|---|
| Chặn nhầm người dùng hợp lệ (regression) | 🟠 Cao | Test cả chiều âm và chiều dương cho từng action |
| Sửa ở page mà quên action ⇒ vẫn khai thác được | 🔴 Chặn | Bắt buộc sửa ở action; verification phải gọi action trực tiếp |
| `role` lưu chữ thường trong DB ⇒ so sánh `'ADMIN'` sai | 🔴 Chặn | Phụ thuộc EPIC-03 (Q4); tạm dùng so sánh không phân biệt case |
| Không có tài khoản ADMIN thật để test | 🟠 Cao | Cần Q6 trước khi verify |
| RLS chưa đúng ⇒ lỗ hổng nghiêm trọng hơn dự kiến | 🔴 Chặn | Kiểm tra RLS (thuộc EPIC-03) |

---

## 6. Tasks

| Task | Tên | Trạng thái |
|---|---|---|
| **TASK-001** | Bịt lỗ hổng uỷ quyền trong server action chuyến đi & chat | 🟢 **READY** |
| TASK-00x *(đề xuất)* | Bảo vệ khu vực `/admin` bằng kiểm tra vai trò ADMIN | `PROPOSED` — chờ Q6 |
| TASK-00x *(đề xuất)* | Xác thực chữ ký webhook Messenger | `PROPOSED` |
| TASK-00x *(đề xuất)* | Bảo vệ & giới hạn tần suất endpoint AI; đưa API key ra khỏi URL | `PROPOSED` |
| TASK-00x *(đề xuất)* | Ràng buộc `submitRatingAction` (chống trùng, kiểm tra hoàn thành, cập nhật điểm) | `PROPOSED` — phụ thuộc Q5 |

---

## 7. Điều kiện hoàn thành EPIC

- [ ] Tất cả task ở mục 6 đạt `DONE` và đã verification `PASS`
- [ ] Không còn server action nào chỉ kiểm tra `if (!user)`
- [ ] `/admin` không thể truy cập bởi người không phải ADMIN (đã kiểm thử tiêu cực)
- [ ] `.ai/project-state.md` cập nhật: 0 lỗ hổng uỷ quyền
