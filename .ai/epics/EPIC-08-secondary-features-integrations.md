# EPIC-08 — Secondary Features & Integrations

- **EPIC ID:** EPIC-08
- **Tên:** Tính năng phụ & Tích hợp bên ngoài
- **Thứ tự ưu tiên:** 8–10 / 10 (theo `constitution.md` §5)
- **Trạng thái:** `PROPOSED`
- **Phụ thuộc:** EPIC-01, EPIC-03
- **Mức rủi ro tổng thể:** 🟢 Thấp

---

## Mục tiêu

Hoàn thiện các tính năng **chưa hoàn chỉnh** và các **tích hợp bên ngoài** đang ở dạng khung, sau khi
các vấn đề nền tảng (bảo mật, auth, dữ liệu) đã được xử lý. Đây là EPIC cuối trong thứ tự ưu tiên vì
mọi hạng mục ở đây đều **phụ thuộc vào nền tảng ổn định** mới có ý nghĩa.

---

## Trạng thái hiện tại (bằng chứng)

### A8-01 — Tích hợp OSRM: hoạt động nhưng có đường lui "im lặng"

- `src/lib/pricing.ts` gọi `router.project-osrm.org` với profile xe máy để lấy
  khoảng cách đường thực tế; khi lỗi/timeout thì rơi về `DISTANCE_MATRIX` (bảng khoảng cách cứng).
- **Vấn đề:** việc rơi về fallback **không được báo cho người dùng biết**. Người dùng thấy một con số
  khoảng cách/giá mà không biết đó là số liệu thật hay ước lượng cứng.
- OSRM public (`router.project-osrm.org`) là dịch vụ **miễn phí, không SLA, có thể rate-limit** —
  không phù hợp cho môi trường production tải thật (xem R8-02).

### A8-02 — Gemini (parse ngôn ngữ tự nhiên): có fallback regex

- `src/lib/ai.ts` dùng Gemini 1.5 Flash để parse câu mô tả tự nhiên thành dữ liệu chuyến đi,
  kèm fallback regex khi không gọi được API hoặc parse thất bại.
- Cần **API key** trong biến môi trường. Trạng thái key trên môi trường thật: **UNKNOWN**.
- Chất lượng parse của fallback regex thấp hơn đáng kể — chưa có ghi nhận nào về việc người dùng có
  biết mình đang nhận kết quả từ fallback hay không.

### A8-03 — Facebook Messenger webhook: chỉ là placeholder

- Có route webhook nhận sự kiện Messenger nhưng xử lý chỉ ở mức echo/placeholder — **chưa gửi thông
  báo thật** cho người dùng.
- Chưa xác minh: cấu hình `verify token`, app secret, quyền của app, và môi trường (dev/prod).
- Đây là hạng mục **tích hợp bên thứ ba** ⇒ mọi thay đổi liên quan cần PO quyết định (chi phí, tài
  khoản, chính sách) trước khi thực hiện.

### A8-04 — Tính năng "phụ" chưa hoàn thiện trong phạm vi nghiệp vụ

Các mục dưới đây **có mặt trong tài liệu/thiết kế nhưng chưa có triển khai đầy đủ**:

| Tính năng | Trạng thái | Ghi nhận |
|-----------|-----------|----------|
| Thông báo (notification) trong ứng dụng | Không có | Phụ thuộc mục A8-03 nếu muốn đẩy ra Messenger |
| Chat thời gian thực | Không có | Hiện là gửi/nhận thủ công (xem EPIC-05) |
| Lịch sử chuyến đi / trang cá nhân đầy đủ | Một phần | Dashboard chỉ hiển thị 2 con số đếm |
| Đánh giá & uy tín người dùng | Một phần, chưa hiệu lực | Chi tiết ở EPIC-05 (rating chưa cập nhật điểm tổng) |
| Báo cáo vi phạm | Không có | Bảng `trip_reports` chỉ tồn tại dưới dạng type chết (xem EPIC-03) |

### A8-05 — Trang chủ (landing) chứa UI chết

- Landing page có khối "tìm kiếm nhanh" nhưng **không gọi API và không gắn handler** — người dùng
  nhập liệu và bấm không có gì xảy ra.
- Ảnh minh hoạ có sẵn (`public/hero-illustration.jpg`) nhưng chưa có asset nào khác cho các màn hình.

### A8-06 — Dữ liệu địa lý đã có trên DB

- `locations` và `routes` đã được xác nhận tồn tại và có dữ liệu thật trên DB DEV.
- Đây không còn chỉ là dataset dự phòng; tuy nhiên schema chi tiết và mapping sang code vẫn cần EPIC-03.
- Dataset mở rộng hơn 6 trường lõi trong UI, nên không được coi việc có dữ liệu là đã hỗ trợ toàn bộ điểm đến.

---

## Trạng thái đích

1. **OSRM:** khoảng cách/giá hiển thị **minh bạch nguồn gốc** — người dùng biết khi nào số liệu là
   ước lượng. Có xử lý thời gian chờ hợp lý và không làm treo form tạo chuyến khi OSRM chậm.
2. **Gemini:** có cơ chế rõ ràng khi key thiếu/sai (thông báo cho người dùng hoặc tắt tính năng một
   cách êm thay vì im lặng dùng fallback chất lượng thấp).
3. **Messenger:** hoặc được triển khai thật (có xác minh webhook, gửi được tin), hoặc được **đánh
   dấu rõ là chưa hỗ trợ** và ẩn khỏi luồng người dùng. Không để trạng thái nửa vời gây hiểu nhầm.
4. **Landing page:** khối tìm kiếm nhanh hoặc hoạt động thật, hoặc được gỡ bỏ.
5. Các tính năng phụ (thông báo, lịch sử, báo cáo) được **PO quyết định có làm hay không** trước khi
   triển khai — không tự quyết định phạm vi.

---

## Phụ thuộc

| Phụ thuộc | Loại | Lý do |
|-----------|------|-------|
| **EPIC-01** | Bắt buộc | Webhook & API route đang thiếu kiểm tra xác thực ⇒ tích hợp thêm mà không bịt lỗ hổng là mở rộng bề mặt tấn công |
| **EPIC-03** | Bắt buộc | Không thể hoàn thiện "báo cáo vi phạm"/"đánh giá" khi cấu trúc bảng còn `UNKNOWN` |
| **Q5, Q7, Q8** | Quyết định PO | Phạm vi notification / rating / report |
| **Q12 (đề xuất)** | Quyết định PO | Có triển khai Messenger thật trong phiên bản này hay không (chi phí, tài khoản, chính sách) |
| **Q13 (đề xuất)** | Quyết định PO | OSRM public giữ nguyên hay chuyển sang dịch vụ có SLA/self-host |

---

## Rủi ro

| ID | Rủi ro | Mức | Giảm thiểu |
|----|--------|-----|-----------|
| R8-01 | Fallback im lặng làm người dùng tin vào số liệu sai ⇒ tranh chấp giá | 🟡 TB | Hiển thị rõ nguồn số liệu; ghi trong acceptance criteria |
| R8-02 | OSRM public bị rate-limit/chết ⇒ toàn bộ tính giá rơi về bảng cứng | 🟡 TB | Không phụ thuộc cứng vào dịch vụ ngoài; cân nhắc cache kết quả theo cặp điểm |
| R8-03 | Lộ API key Gemini / Messenger secret ra client hoặc repo | 🔴 Cao | **Chỉ dùng ở server**; tuyệt đối không `NEXT_PUBLIC_`; không commit `.env.local` |
| R8-04 | Webhook Messenger không xác minh chữ ký ⇒ kẻ lạ gửi sự kiện giả | 🔴 Cao | **Bắt buộc** xác minh signature/verify token trước khi xử lý (chặn bởi EPIC-01) |
| R8-05 | Triển khai notification sớm khi chưa có mô hình dữ liệu ⇒ phải làm lại | 🟡 TB | Chờ EPIC-03 + PO chốt phạm vi |
| R8-06 | Chi phí dịch vụ bên thứ ba (Gemini/Messenger) phát sinh ngoài dự kiến | 🟡 TB | PO quyết định quota/ngân sách trước khi triển khai |

---

## Danh sách task đề xuất

| Task | Nội dung | Trạng thái | Ghi chú |
|------|----------|-----------|---------|
| T-08-01 | Hiển thị minh bạch nguồn khoảng cách (OSRM thật vs bảng ước lượng) | `PROPOSED` | Không đổi công thức giá |
| T-08-02 | Xử lý trạng thái thiếu/sai API key Gemini một cách rõ ràng | `PROPOSED` | Kiểm tra biến môi trường ở server |
| T-08-03 | Quyết định & thực hiện: gỡ bỏ hoặc hoàn thiện khối tìm kiếm nhanh ở landing page | `PROPOSED` | **Cần PO quyết định** (Q14 đề xuất) |
| T-08-04 | ~~Messenger thật~~ — chỉ thực hiện sau quyết định Q12 + EPIC-01 | `PROPOSED` | Rủi ro cao nếu làm sớm (R8-04) |
| T-08-05 | Cụ thể hoá yêu cầu notification (kênh nào, sự kiện nào) để PO duyệt | `PROPOSED` | **Chờ PO** — không code trước khi chốt |
| T-08-06 | Đánh giá & đề xuất phương án thay thế OSRM public | `PROPOSED` | Chờ Q13 |

---

## Ghi chú phạm vi

EPIC-08 được xếp **cuối** vì:

1. Không hạng mục nào ở đây giải quyết rủi ro bảo mật/toàn vẹn dữ liệu.
2. Tích hợp bên thứ ba **tăng bề mặt tấn công** — làm trước EPIC-01 là đi ngược thứ tự an toàn.
3. Nhiều hạng mục **chưa có quyết định phạm vi của PO** ⇒ thực hiện trước sẽ là tự quyết định thay PO,
   vi phạm `constitution.md` §1.

---

## Liên kết

- `constitution.md` §5 — thứ tự ưu tiên (EPIC-08 ở mức 8–10)
- `EPIC-01-security-authorization.md` — chặn mọi hạng mục webhook/API
- `EPIC-03-data-integrity.md` — chặn hạng mục báo cáo/đánh giá
- `EPIC-05-critical-functional-gaps.md` — notification & rating liên quan trực tiếp
- `escalation-protocol.md` — mọi thay đổi tích hợp bên thứ ba thuộc nhóm cần escalate
