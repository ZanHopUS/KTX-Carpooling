# EPIC-03 PO DECISION PACK

> Mục đích: cung cấp các quyết định còn thiếu cho Product Owner.
> Phạm vi: planning/decision only. Không tạo task, không code, không sửa database, migration hoặc RLS.
> Nguồn ưu tiên: quyết định PO, evidence live đã xác nhận, sau đó mới đến tài liệu và application code.

## 1. Trips Canonical Application Contract

### Current evidence

- Live `trips` là normalized schema 27 cột.
- Các field live đã xác nhận gồm `trip_date`, `vehicle_id`, `route_id`, `pickup_location_id`, snapshot distance/duration/price và lifecycle fields.
- `trips.date` và `trips.available_seats` không tồn tại trong live schema.
- Application hiện vẫn ghi/đọc model flat gồm `date`, `pickup_area`, `pickup_building`, `pickup_point`, `destination_university`, `distance_km`, `suggested_price`, `available_seats` và các field tương tự.

### Current ambiguity

Chưa có application contract được PO chốt cho việc ánh xạ UI hiện tại vào normalized DB.

### Real options and impact

| Option | Impact |
|---|---|
| Dùng normalized fields trực tiếp ở application boundary | Khớp live DB và giảm legacy mapping; tác động lớn đến trip creation, reads, matching, pricing và UI DTO. |
| Giữ DTO/UI flat và thêm mapping tại boundary | Giảm thay đổi UI trước mắt; tăng complexity và nguy cơ drift giữa DTO với DB. |
| Duy trì hai mô hình song song lâu dài | Giảm áp lực ngắn hạn; tăng rủi ro data inconsistency và khó rollback. |

### Architecture trade-off

Normalized-first có tính toàn vẹn dữ liệu tốt hơn nhưng phạm vi code lớn hơn. Boundary mapping giữ UX hiện tại nhưng tạo thêm lớp chuyển đổi cần kiểm thử. Hai mô hình song song chỉ phù hợp như trạng thái chuyển tiếp có thời hạn rõ ràng.

### Exact PO decision

PO chọn application contract nào cho `trips`: normalized-first, boundary DTO mapping, hay một phương án chuyển tiếp có thời hạn?

Blocking: mọi task sửa trip creation/read/matching/pricing và runtime re-verification TASK-001.

## 2. Trip Requests Canonical Schema

### Current evidence

- Application dùng `trip_id`, `passenger_id`, `requested_pickup_time`, `match_score`, `status` và `created_at`.
- Tài liệu mô tả thêm `message`, `responded_at`, `responded_by`, `updated_at`.
- Live `trip_requests` được dùng bởi hệ thống và các FK liên quan đã được PO xác nhận trong evidence TASK-002.
- TASK-002 đã xác nhận `trip_request_status` có giá trị `accepted`.

### Current ambiguity

Chưa có canonical column list đầy đủ được chốt trong repository cho `trip_requests`, đặc biệt với `requested_pickup_time`, `match_score`, response fields, nullable/default và unique constraints.

### Real options and impact

| Option | Impact |
|---|---|
| Canonical theo live columns hiện có | Tránh schema drift; có thể yêu cầu application bỏ hoặc ánh xạ các field không tồn tại. |
| Giữ application request fields làm contract chính | UX/matching dễ giữ nguyên; chỉ hợp lệ nếu live schema thực sự có hoặc có mapping rõ ràng. |
| Tách request intent khỏi persisted request record | Mô hình rõ hơn; tăng thiết kế và migration/DTO complexity. |

### Architecture trade-off

Live-first giảm rủi ro ghi sai DB. Application-first giữ behavior hiện tại nhưng không được dùng nếu chưa có live evidence. Tách intent giúp domain rõ hơn nhưng không cần thiết nếu PO chỉ muốn hoàn thiện MVP hiện tại.

### Exact PO decision

PO xác nhận danh sách cột canonical của `trip_requests`, trạng thái bắt buộc, response representation và constraint chống duplicate nào được áp dụng?

Blocking: request flow, accept/reject runtime và mọi task phụ thuộc request schema.

## 3. Ratings Canonical Schema

### Current evidence

- Bảng `ratings` tồn tại trên live DB.
- Application insert field `stars`.
- Tài liệu mô tả field `score`, cùng `trip_id`, `from_user_id`, `to_user_id`, `comment`, `available_at`, `created_at`.

### Current ambiguity

Chưa có live column evidence xác nhận `stars`, `score`, type, constraints, FK và duplicate rule.

### Real options and impact

| Option | Impact |
|---|---|
| Canonical field `score` | Khớp tài liệu normalized; cần mapping hoặc sửa application rating path. |
| Canonical field `stars` | Khớp application hiện tại; chỉ hợp lệ nếu live DB xác nhận. |
| Một canonical field và derived display label | Giảm ambiguity giữa persistence và UI; cần quy ước domain rõ ràng. |

### Architecture trade-off

Tên domain rõ ràng và constraint `1..5` quan trọng hơn việc giữ tên hiện tại. Không thể chọn giữa `stars` và `score` bằng suy luận.

### Exact PO decision

PO chốt field điểm đánh giá canonical là gì, kiểu dữ liệu/range nào, mỗi user được đánh giá bao nhiêu lần cho một trip, và khi nào rating hợp lệ?

Blocking: rating implementation, reputation score và EPIC-05.

## 4. Profiles: `status` / `account_status`

### Current evidence

- Application type/action dùng `profiles.status` với giá trị `ACTIVE`/`BLOCKED`.
- Tài liệu normalized dùng `account_status`.
- Live `profiles` tồn tại nhưng canonical column chưa được xác nhận trong repository evidence.

### Current ambiguity

Chưa biết live column nào là authoritative và bộ trạng thái nào được lưu thực tế.

### Real options and impact

| Option | Impact |
|---|---|
| `status` là canonical | Ít thay đổi code hiện tại; có thể lệch mô hình tài liệu. |
| `account_status` là canonical | Tên rõ nghĩa hơn ở platform level; cần cập nhật queries/types. |
| Tạm hỗ trợ cả hai | Giảm migration pressure; tạo dual-source ambiguity và nguy cơ lệch trạng thái. |

### Architecture trade-off

Một field canonical dễ kiểm soát authorization hơn. Hỗ trợ song song chỉ nên là transitional mapping có thời hạn.

### Exact PO decision

PO chốt tên field và status set canonical cho account lifecycle là `status`, `account_status`, hay một mapping chuyển tiếp được kiểm soát?

Blocking: account authorization, admin access và profile state logic.

## 5. Role và Driver/Passenger Capability

### Current evidence

- Application dùng `DRIVER`, `PASSENGER`, `BOTH`, `ADMIN`.
- PO đã phê duyệt cho TASK-002 rằng platform role nên là `user`/`admin`; driver/passenger là capability/relationship, không phải giá trị thêm vào `profiles.role`.
- Existing application registration vẫn gửi các capability-like uppercase values.

### Current ambiguity

Chưa có application-level canonical representation cho capability driver/passenger sau quyết định platform role.

### Real options and impact

| Option | Impact |
|---|---|
| Tách `profiles.role` platform khỏi capability/relationship | Mô hình đúng ngữ nghĩa và authorization; cần xác định nơi lưu capability. |
| Giữ capability trong application-derived logic | Không đổi schema; cần nguồn dữ liệu rõ để biết user có thể driver/passenger. |
| Tạo field capability riêng | Rõ ràng hơn; là schema/product decision mới, cần PO phê duyệt riêng. |

### Architecture trade-off

Tách access role và business capability là mô hình sạch hơn. Derived capability giảm schema change nhưng chỉ an toàn khi có invariant rõ ràng.

### Exact PO decision

PO chốt capability driver/passenger được xác định từ đâu và registration payload hiện tại sẽ ánh xạ thế nào vào platform role `user/admin`?

Blocking: authorization, registration và trip/request eligibility.

## 6. Enum Values và Casing

### Current evidence

- Code chủ yếu dùng uppercase literals.
- Tài liệu mô tả nhiều enum lowercase.
- `trip_status`, `trip_request_status`, profile verification/status và role live chưa có đầy đủ enum member evidence trong repo.
- `trip_request_status` có `accepted` đã được PO xác nhận.

### Current ambiguity

Chưa chốt value set và casing canonical cho từng enum; không được áp dụng một quy tắc chung nếu live enums khác nhau.

### Real options and impact

| Option | Impact |
|---|---|
| Giữ casing/value set live | Ít rủi ro dữ liệu; application phải normalize tại boundary nếu cần. |
| Chuẩn hóa application literals theo live enum | Giảm lỗi query/write; ảnh hưởng nhiều module. |
| Migration đổi enum/data values | Có thể tạo contract nhất quán; rủi ro data conversion và rollback cao. |

### Architecture trade-off

Live-first là lựa chọn an toàn dữ liệu. Application normalization là lớp tương thích ít xâm lấn hơn migration enum. Không đổi enum nếu chưa có inventory live đầy đủ.

### Exact PO decision

PO có chấp nhận live enum values làm canonical và yêu cầu application normalize theo từng enum không? Nếu cần đổi values/casing, PO phê duyệt phạm vi data migration nào?

Blocking: trip/request/profile state handling và mọi task có write status.

## 7. Verification Requirements

### Current evidence

- Product context yêu cầu sinh viên KTX và verification trước khi dùng các luồng chính.
- Application hiện chưa cưỡng chế `dorm_card_verified = VERIFIED` trong `createTripAction` và `createTripRequestAction`.
- Verification fields và live profile mapping chưa hoàn toàn canonical.

### Current ambiguity

Chưa chốt hành động nào bắt buộc verification: chỉ đăng trip, chỉ gửi request, cả hai, hay cả chat/rating.

### Real options and impact

| Option | Impact |
|---|---|
| Chỉ verified user được đăng trip | Giảm rủi ro driver giả; có thể giảm activation. |
| Verified user mới được đăng trip và gửi request | Bám sát trust model; tăng dependency vào onboarding. |
| Verification chỉ là badge, không blocking | UX dễ hơn; không đáp ứng claim “chỉ sinh viên đã xác minh”. |

### Architecture trade-off

Blocking enforcement tăng trust nhưng cần auth/profile state ổn định. Badge-only giảm friction nhưng phải sửa product promise nếu đó không phải policy thật.

### Exact PO decision

PO chốt verification là điều kiện bắt buộc cho những hành động nào và trạng thái canonical nào được coi là verified?

Blocking: eligibility implementation và EPIC-04.

## 8. Runtime Contract cho TASK-001

### Current evidence

- TASK-001 đã DONE theo static approval.
- Runtime verification ban đầu bị chặn bởi trip schema mismatch.
- TASK-002 đã xác nhận và apply messages/RLS runtime.

### Current ambiguity

Chưa có runtime pass đầy đủ cho toàn bộ TC-1…TC-11 của TASK-001 trên trip/request data canonical.

### Real options and impact

| Option | Impact |
|---|---|
| Re-verify sau khi trip/request contract được đồng bộ | Evidence mạnh nhất; phụ thuộc implementation trip flow. |
| Giữ static acceptance | Nhanh hơn; còn residual risk ở DB/runtime. |
| Hybrid: runtime chỉ các case không phụ thuộc trip creation | Có thêm evidence; không thay thế full end-to-end verification. |

### Architecture trade-off

Full runtime verification cho phép đóng security claim thực tế. Static acceptance phù hợp cho phần logic nhưng không chứng minh được DB/RLS integration.

### Exact PO decision

PO chấp nhận TASK-001 ở static-only lâu dài, hay yêu cầu re-verify runtime đầy đủ sau khi trip/request contract được xử lý?

Blocking: kết luận hoàn thành EPIC-01 và EPIC-03.

## 9. Dependencies khác có evidence

### Admin access path

- Evidence: admin account tồn tại, nhưng cơ chế tạo/admin lifecycle chưa được tài liệu hóa hoàn chỉnh.
- Ambiguity: seed thủ công, Dashboard hay flow khác; field/role mapping.
- Blocking: admin hardening của EPIC-01 và onboarding EPIC-02.

### Auth callback/onboarding

- Evidence: `auth/callback` rỗng; redirect hardcode localhost; API verification dùng `users`.
- Ambiguity: PO chưa chốt production domain và luồng upload chính thức.
- Blocking: EPIC-02.

### RLS baseline và repository schema baseline

- Evidence: một số RLS đã runtime-verified cho messages; tổng thể RLS/schema baseline chưa hoàn chỉnh.
- Ambiguity: chưa có DDL baseline trong repo và chưa có inventory đầy đủ cho mọi bảng dùng.
- Blocking: EPIC-03 hoàn tất và các task data-dependent.

# PO DECISION SUMMARY

| Decision ID | Chủ đề | Evidence | Cần PO quyết định | Blocking task |
|---|---|---|---|---|
| D-03-01 | Trips application contract | Live `trips` normalized 27 columns; app còn flat | Chọn normalized-first, boundary mapping, hay transitional model | Trip contract / runtime TASK-001 |
| D-03-02 | `trip_requests` schema | App/docs có field khác nhau; live detail chưa canonical trong repo | Chốt canonical columns, status, response và constraints | Request contract |
| D-03-03 | Ratings schema | Table tồn tại; `stars` vs `score` chưa chốt | Chốt field, type, FK và duplicate/completion rules | Rating implementation |
| D-03-04 | Profile account state | Code `status`; docs `account_status` | Chốt field và status set | Profile authorization |
| D-03-05 | Role/capability | PO đã tách platform role khỏi driver/passenger capability | Chốt nguồn capability và mapping registration | Auth/eligibility |
| D-03-06 | Enum values/casing | Code uppercase; docs/live evidence chưa đầy đủ | Chốt live-first normalization và có/không data conversion | Status-dependent tasks |
| D-03-07 | Verification requirements | Code chưa enforce verified user ở trip/request | Chốt action nào bắt buộc verification | Eligibility task |
| D-03-08 | TASK-001 runtime | Static DONE; runtime full chưa pass | Chọn static-only hoặc full runtime re-verify | EPIC-01/EPIC-03 closure |
| D-03-09 | Admin lifecycle | Admin tồn tại; creation path chưa documented | Chốt cơ chế tạo/quản trị ADMIN | Admin hardening |
| D-03-10 | Auth/onboarding | Callback rỗng, redirect localhost, API dùng `users` | Chốt production domain và upload flow | EPIC-02 |
| D-03-11 | Schema/RLS baseline | Live DB là source; repo chưa có full baseline | Chốt mức baseline cần lưu trong repo | EPIC-03 closure |

## PO RESPONSE REQUIRED

PO cần trả lời các Decision ID trên trước khi Orchestrator tạo hoặc đánh dấu READY cho implementation task tiếp theo.

Không có task mới được tạo trong báo cáo này.