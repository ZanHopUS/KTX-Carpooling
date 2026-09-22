# ENVIRONMENT ASSESSMENT — TASK-001

> Historical report: phần repo-only ngày 2026-09-20 và kế hoạch fixture ban đầu đã được supersede bởi bằng chứng DB/runtime ngày 2026-09-21 trong `database-context.md` §§14–16.

> Phạm vi: xác định môi trường Supabase mà project đang sử dụng, TRƯỚC khi chuẩn bị bất kỳ fixture/runtime test nào.
> Ràng buộc bảo mật đã tuân thủ: không hiển thị/ghi lại service role key, API keys, tokens, cookies, passwords; không tạo user; không insert dữ liệu; không sửa database; không sửa source code.

---

## 1. Kết luận

**CẬP NHẬT 2026-09-21 — PO đã xác nhận trên Supabase Dashboard: môi trường là DEV, ĐỦ ĐIỀU KIỆN để chuẩn bị runtime fixture.**

- Đánh giá repo-only (2026-09-20): không thể xác định chắc chắn → giữ BLOCKED, yêu cầu PO xác nhận Dashboard. ✓ Đã tuân thủ đúng quy tắc.
- PO xác nhận (chi tiết mục 7): project tạo để phát triển web, chưa đưa cho người dùng thật; Site URL `http://localhost:3000`, Redirect URLs `http://localhost:3000/**`.
- **TASK-001 vẫn giữ `BLOCKED`** cho tới khi PO phê duyệt thực hiện fixture plan.
- **Phát hiện mới (chặn một phần verification):** bảng `messages` KHÔNG tồn tại → AC-04 không thể runtime-verify cho tới khi có bảng — là thay đổi schema DB, cần PO quyết (ngoài scope TASK-001). Xem mục 7.2.

## 2. Bằng chứng đã thu thập (chỉ từ repo, bảo mật thông tin nhạy cảm)

| # | Bằng chứng | Giá trị (đã che) | Ý nghĩa |
|---|---|---|---|
| E1 | Host của Supabase project | `majl****.supabase.co` | Project **CLOUD thật**, không phải sandbox local (`localhost`/`127.0.0.1`) |
| E2 | Ref trong URL | không chứa từ khoá `dev`/`test`/`stag`/`prod` | Không phân biệt được môi trường từ ref |
| E3 | File env | chỉ `.env.local`, đúng 2 biến: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Không có service role key trong repo. **Lưu ý:** anon key là public theo thiết kế, không coi là bí mật |
| E4 | Cấu hình deploy/CI | không có `vercel.json`, `netlify.toml`, `Dockerfile`, `docker-compose.yml`, `.github/workflows` | App chưa từng được cấu hình deploy production |
| E5 | `src/app/(auth)/actions.ts:69` | `emailRedirectTo: http://localhost:3000/auth/callback` | Xác nhận email chỉ trỏ về local — nếu có traffic production thật thì signup đã hỏng. Indication mạnh nhất cho usage DEV-only |
| E6 | Git | branch `dev`, remote `github.com/ZanHopUS/KTX-Carpooling.git` | Workflow dev |
| E7 | `supabase/` | chỉ `schema.sql` (toàn comment), `migrations/` rỗng | Giai đoạn phát triển sớm, chưa có pipeline schema |
| E8 | Lịch sử commit | MVP (tính khoảng cách, dựng UI cơ bản) | Không có dấu hiệu vận hành production |

## 3. Phân tích

**Mọi bằng chứng repo (E1–E8) đều nhất quán với một project dùng cho phát triển local.** Không có bằng chứng nào chỉ ra production: không deploy config, không CI, auth redirect hardcode localhost, chỉ có anon key.

**Tuy nhiên chưa đủ điều kiện kết luận "chắc chắn"**, vì:

1. Đây là **project cloud dùng chung theo tham chiếu URL** — các thành viên khác trong nhóm có thể đã tạo tài khoản/dữ liệu thật từ máy của họ. Repo không thể cho biết `profiles` hiện có bao nhiêu user và có phải dữ liệu thật (email/SV/ảnh thẻ KTX thật) hay không.
2. Danh tính chính thức của project (tên project, org, mục đích) chỉ hiển thị trong Supabase Dashboard.
3. Bucket `dorm-cards` đang **public** (theo `.ai/database-context.md` §12) — nếu đã có ảnh thẻ KTX thật thì việc tạo dữ liệu test cần thao tác cẩn thận hơn (chỉ tạo bản ghi mới, không đụng dữ liệu cũ).

## 4. Checklist Product Owner cần xác nhận trên Supabase Dashboard (~5 phút)

| # | Vị trí trên Dashboard | Câu hỏi cần trả lời |
|---|---|---|
| C1 | General / Settings | Tên project + org: có phải project dev/test của nhóm không? |
| C2 | Table Editor → `profiles` | Có bao nhiêu user? Toàn bộ là tài khoản test của nhóm hay có email/SV thật? |
| C3 | Authentication → URL Configuration | Site URL / Redirect URLs có phải `http://localhost:3000`? |
| C4 | Storage → `dorm-cards` | Có ảnh thẻ KTX thật đã upload chưa? |
| C5 | Table Editor → `messages`, `ratings` | Hai bảng này có tồn tại không? (câu hỏi D4/D5 trong `.ai/database-context.md`) |

## 5. Nhánh quyết định sau khi PO xác nhận

- **PO xác nhận DEV/TEST + dữ liệu hiện có chỉ là test:** quay lại `.ai/reports/UNBLOCK-PLAN-TASK-001.md`, thực hiện **Option A** — tạo fixture tối thiểu (3 user, 2 trips, 3 requests) và chạy 11 test case TC-1…TC-11 để verify AC-01…AC-06.
- **PO xác nhận có dữ liệu thật / không chắc chắn:** tiếp tục BLOCKED; cân nhắc spin up một Supabase project riêng cho kiểm thử (schema hiện tại `UNKNOWN` — xem `D6`, cần schema dump).
- Mọi trường hợp: TASK-001 không tự chuyển sang DONE; trạng thái hiện tại "chờ môi trường DB kiểm thử được PO phê duyệt" vẫn chính xác.

## 6. Thay đổi đã thực hiện trong bước 1 — repo-only (2026-09-20)

- Chỉ tạo report này (metadata `.ai/`).
- Không sửa source code, không tạo user, không insert dữ liệu, không sửa database, không query DB.

## 7. Phản hồi xác nhận từ Product Owner (2026-09-21)

### 7.1 Trả lời checklist

| # | Câu hỏi | PO trả lời | Kết luận |
|---|---|---|---|
| C1 | Project có phải dev/test? | "Project tạo để phát triển web, chưa đưa cho người dùng thật" | ✅ **DEV** |
| C2 | `profiles` có dữ liệu gì? | 2 user: 1 tài khoản sinh viên của PO (email thật) + 1 admin | ⚠️ Có dữ liệu thật (của PO) — phải bảo vệ, không dùng làm actor test |
| C3 | Auth URL config | Site URL `http://localhost:3000`; Redirect URLs `http://localhost:3000/**` | ✅ Khớp bằng chứng E5 — dev-only |
| C4 | `dorm-cards` có ảnh thật? | Chưa có (PO ghi chú thêm "chưa cài đặt OSR" — danh từ chưa rõ, không ảnh hưởng kết luận môi trường) | ✅ Bucket chưa có dữ liệu nhạy cảm |
| C5 | `messages`, `ratings` có tồn tại? | "Hiện chỉ có bảng ratings" (trong phạm vi câu hỏi) | 🔴 **`messages` KHÔNG tồn tại**; ✅ `ratings` TỒN TẠI |
| + | Bảng khác có dữ liệu thật | `routes`, `locations` chứa dữ liệu thật | ⚠️ Bảng dữ liệu thật — không đụng khi tạo fixture |

### 7.2 Tác động lên verification TASK-001

| AC | Chờ runtime fixture | Tác động của việc thiếu bảng `messages` |
|---|---|---|
| AC-01, AC-02 (reject request) | Có | Không ảnh hưởng — chỉ cần `trips` + `trip_requests` |
| AC-03 (người ngoài không chat được) | Có | Không ảnh hưởng — nhánh deny trả lỗi TRƯỚC khi insert |
| AC-04 (driver + accepted passenger chat được) | Có | 🔴 **KHÔNG THỂ VERIFY** — `sendMessageAction` insert vào `messages` sẽ fail; đồng nghĩa tính năng chat hiện hỏng hoàn toàn trên DB này |
| AC-05, AC-06 (đổi trạng thái chuyến) | Có | Không ảnh hưởng — không truyền `announcementMsg` là không đụng `messages` |
| AC-07…AC-09 (static) | Không | Đã PASS |

Phụ thuộc còn thiếu (cần PO xác nhận thêm): bảng `trips` và `trip_requests` có tồn tại? `trips` dùng cột `date` hay `trip_date` (D1)?

### 7.3 Điều kiện an toàn khi tạo fixture (cập nhật từ C1–C5)

- Chỉ tạo user/trip/request MỚI (email test như `devtest.*@...`); không đụng tài khoản thật của PO và admin.
- Không đụng dữ liệu thật trong `routes`, `locations`.
- Sau verification: dọn dữ liệu test (trừ khi PO muốn giữ lại).

### 7.4 Quyết định PO cần đưa ra

1. Phê duyệt **Option A (sửa đổi)**: tạo 3 user test + 2 trips + 3 requests, chạy 11 test case TC-1…TC-11 để verify 5/6 AC runtime — AC-04 tách riêng, chờ có bảng `messages`.
2. Quyết định tạo bảng `messages` — thay đổi schema DB, ngoài scope TASK-001. Khuyến nghị: **task riêng kèm file migration** (`supabase/migrations/` hiện trống — khắc phục luôn D7), do PO phê duyệt.
3. Xác nhận thêm trên Table Editor: `trips`, `trip_requests` có tồn tại không + tên cột ngày đi trong `trips` (`date` hay `trip_date` — D1 mức 🔴 Chặn).
