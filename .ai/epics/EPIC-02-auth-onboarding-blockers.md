# EPIC-02 — Auth & Onboarding Blockers

| Trường | Giá trị |
|---|---|
| **EPIC ID** | EPIC-02 |
| **Tên** | Auth & Onboarding Blockers |
| **Ưu tiên** | 2 (Auth blockers) |
| **Mức độ** | 🔴 Chặn |
| **Trạng thái** | `PROPOSED` |
| **Phụ thuộc** | Không |

---

## 1. Goal

Làm cho luồng đăng ký → xác minh email → xác minh thẻ KTX → sử dụng hệ thống chạy **liền mạch trên mọi môi trường**, không phụ thuộc `localhost`, không có đường vào nào trả 404.

---

## 2. Current state (bằng chứng)

| # | Vấn đề | Vị trí |
|---|---|---|
| 1 | `src/app/auth/callback/` **rỗng hoàn toàn** ⇒ link xác minh email trả 404 | xác minh bằng `ls` |
| 2 | `emailRedirectTo` **hardcode** `http://localhost:3000/auth/callback` | `(auth)/actions.ts` |
| 3 | Endpoint `api/verifications` trả **HTTP 500** do dùng bảng `users` không tồn tại | `api/verifications/route.ts:35` |
| 4 | Hai luồng upload thẻ KTX trùng nhau, một luồng hỏng | `api/verifications/route.ts` vs `(main)/profile/actions.ts:52` |
| 5 | Không có đường vào nào trong UI để tới `/admin` | `(main)/layout.tsx` — không có link admin |
| 6 | Tài khoản ADMIN không có cơ chế tạo | không có seed script / UI |

---

## 3. Target state

- [ ] Route `auth/callback` tồn tại và xử lý đúng `code` → session.
- [ ] URL redirect lấy từ biến môi trường / `origin` của request, không hardcode.
- [ ] Luồng upload thẻ KTX duy nhất, chạy đúng, không trả 500.
- [ ] ADMIN có đường vào UI và cơ chế tạo tài khoản được tài liệu hoá.
- [ ] Người dùng đã đăng nhập có thể tìm thấy mọi chức năng thuộc vai trò mình.

---

## 4. Dependencies

| Loại | Nội dung |
|---|---|
| Cần PO quyết | **Q6** — cơ chế tạo ADMIN (seed script / SQL thủ công / mời qua email) |
| Cần PO quyết | Giữ luồng upload nào: qua API route hay qua server action? |
| Cần PO quyết | Domain production để cấu hình redirect URL |

---

## 5. Risk

| Rủi ro | Mức | Giảm thiểu |
|---|---|---|
| Sửa redirect sai ⇒ vòng lặp đăng nhập | 🟠 Cao | Test cả local và preview deploy |
| Xung đột với Supabase Auth cấu hình sẵn (Site URL / Redirect URLs) | 🟠 Cao | Kiểm tra dashboard Supabase trước khi sửa |
| Xoá luồng upload "hỏng" mà lỡ tay xoá luồng đang dùng | 🔴 Chặn | Xác định rõ luồng nào được UI gọi thật trước khi xoá |
| Bucket `dorm-cards` đang **public** ⇒ ảnh thẻ KTX lộ | 🔴 Bảo mật | Thuộc phạm vi EPIC-03 (dữ liệu), cần phối hợp |

---

## 6. Tasks

| Task | Tên | Trạng thái |
|---|---|---|
| TASK-00x *(đề xuất)* | Tạo route `auth/callback` xử lý đổi code lấy session | `PROPOSED` — chờ xác nhận luồng |
| TASK-00x *(đề xuất)* | Bỏ hardcode `emailRedirectTo`, dùng biến môi trường | `PROPOSED` |
| TASK-00x *(đề xuất)* | Sửa/loại bỏ luồng upload thẻ KTX hỏng (`users` → `profiles`) | `PROPOSED` — cần PO chốt luồng chính |
| TASK-00x *(đề xuất)* | Thêm đường vào `/admin` cho ADMIN + cơ chế tạo ADMIN | `PROPOSED` — chờ Q6 |

---

## 7. Điều kiện hoàn thành EPIC

- [ ] Đăng ký → nhận OTP → xác minh → vào hệ thống: chạy được trên local **và** môi trường deploy
- [ ] Không còn route nào trong luồng onboarding trả 404/500
- [ ] Có ít nhất 1 tài khoản ADMIN tạo được theo quy trình đã tài liệu hoá

## 8. Cập nhật trạng thái runtime 2026-09-21

- Supabase DEV đang tắt confirm email: signup cấp session ngay và redirect `/dashboard`; OTP vẫn là flow được code thiết kế nhưng chưa phải ràng buộc thực tế của môi trường này.
- API verification vẫn dùng sai bảng `users`; route này không được coi là hoạt động chỉ vì server action upload profile còn tồn tại.
- Cần phân biệt hai vấn đề: callback email 404 là blocker riêng, còn OTP/signup behavior phụ thuộc cấu hình confirm email của Supabase.
