# EPIC-07 — Shared UI & Components

- **EPIC ID:** EPIC-07
- **Tên:** UI dùng chung & Hệ thống component
- **Thứ tự ưu tiên:** 7 / 10 (theo `constitution.md` §5)
- **Trạng thái:** `PROPOSED`
- **Phụ thuộc:** —
- **Mức rủi ro tổng thể:** 🟡 Trung bình

---

## Mục tiêu

Hợp nhất giao diện về một hệ thống component thống nhất dựa trên design system đã có trong
`src/app/globals.css`, loại bỏ việc mỗi trang tự dựng lại badge/card/button/empty-state bằng
Tailwind class riêng. Kết quả: giao diện **nhất quán**, sửa một chỗ áp dụng mọi nơi, và giảm
khối lượng code lặp.

**Lưu ý quan trọng:** EPIC này **không đổi ngôn ngữ thiết kế** và **không đổi luồng nghiệp vụ**.
Design system hiện tại (light-only, Be Vietnam Pro, palette blue-600) là quyết định đã có hiệu lực —
EPIC-07 chỉ *áp dụng nhất quán* nó, không thiết kế lại.

---

## Trạng thái hiện tại (bằng chứng)

### A7-01 — Design system đã tồn tại nhưng bị dùng không nhất quán

`src/app/globals.css` (225 dòng) đã định nghĩa đầy đủ:

| Nhóm | Class có sẵn |
|------|--------------|
| Button | `.btn`, `.btn-primary`, `.btn-outline`, `.btn-ghost`, `.btn-sm`, `.btn-lg` |
| Form | `.form-label`, `.form-input`, `.form-select`, `.form-textarea` |
| Container | `.card`, `.card-hover` |
| Badge | `.badge-verified`, `.badge-pending`, `.badge-rejected`, `.badge-open`, `.badge-accepted`, `.badge-completed`, `.badge-cancelled`, `.badge-in-progress` |
| Alert | `.alert-error`, `.alert-success`, `.alert-warning`, `.alert-info` |
| Loading | `.skeleton` |
| Khác | `.divider`, typography scale `h1..h4` |

**Nhưng** các trang lại dựng lại style bằng Tailwind utility thay vì dùng class này. Bằng chứng:

- `src/app/(main)/dashboard/page.tsx`: badge xác minh dựng inline bằng ternary
  `profile?.dorm_card_verified === 'VERIFIED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : ...`
  → **trùng lặp logic** với `.badge-verified` / `.badge-pending` / `.badge-rejected` đã có sẵn.
- `src/app/admin/page.tsx`: card dùng `p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800`
  trong khi `.card` đã tồn tại.
- Các trang khác dùng `dark:` variant (`dark:text-white`, `dark:bg-zinc-900`) trong khi `globals.css`
  **chủ động vô hiệu hoá dark mode** bằng khối `@media (prefers-color-scheme: dark)` ghi rõ
  "We use light-only design; dark mode is not supported in this version".
  ⇒ Các class `dark:*` là **code vô nghĩa** gây nhiễu và tạo cảm giác hệ thống hỗ trợ dark mode.

### A7-02 — Không có component dùng chung nào được tách ra

- Không có `src/components/` (chỉ có `src/types/`, `src/utils/`, `src/lib/`, `src/app/`).
- Mỗi trang tự render: header trang, empty state, badge trạng thái, khối alert lỗi.
- Hệ quả trực tiếp: một thay đổi về hiển thị trạng thái (ví dụ thêm trạng thái `CANCELLED`)
  phải sửa ở nhiều file, dễ bỏ sót → trạng thái hiển thị sai/không màu ở vài màn hình.

### A7-03 — Logic hiển thị trạng thái bị phân tán

Trạng thái chuyến (`OPEN`, `REQUESTED`, `ACCEPTED`, `COMPLETED`, …) được map sang nhãn tiếng Việt
và màu ở nhiều nơi khác nhau, không có hàm/hằng số trung tâm. Bằng chứng: dashboard ternary ở
`A7-01`, và các so sánh chuỗi trực tiếp trong trang chi tiết chuyến/chat.

Rủi ro kèm theo: khi enum thật trong DB chưa xác định (xem `database-context.md`, D-state `UNKNOWN`),
việc map nhãn rải rác khiến việc sửa sau này tốn kém gấp nhiều lần.

### A7-04 — Accessibility & UX ở mức cơ bản chưa được chuẩn hoá

- Không có `aria-*` nhất quán trên badge trạng thái / thông báo lỗi.
- Empty state, loading state (`skeleton`) chưa được áp dụng đồng đều giữa các trang.
- Thông báo lỗi hiển thị khác nhau giữa các form (một số dùng banner, một số dùng text đỏ).

*(Ghi nhận, không phán xét: đây là dự án học đường đang phát triển — mục tiêu là nhất quán, không
phải đạt chuẩn WCAG đầy đủ.)*

---

## Trạng thái đích

1. **Tồn tại `src/components/`** với tối thiểu các component dùng chung:
   - `Badge` (map trạng thái → class `.badge-*` có sẵn, một nguồn sự thật cho nhãn tiếng Việt)
   - `Button` (bọc `.btn-*`)
   - `Card`
   - `Alert` (map loại lỗi → `.alert-*`)
   - `EmptyState`, `Skeleton`/loading wrapper
   - `PageHeader` (tiêu đề + mô tả + slot hành động)
2. **Không còn `dark:*` class** trong codebase (vì dark mode không được hỗ trợ).
3. **Không còn khối style trùng lặp** cho cùng một khái niệm (badge/card/button/alert) ở các trang.
4. **Nhãn tiếng Việt của trạng thái** được định nghĩa một lần duy nhất và tái sử dụng.
5. Các trang hiện có **giữ nguyên hành vi và luồng** — chỉ thay cách dựng giao diện.
6. `architecture.md` được cập nhật để phản ánh `src/components/`.

**Ràng buộc:** Mọi component mới phải **dùng lại class trong `globals.css`** — không tạo hệ thống
style song song (không thêm thư viện UI, không thêm Tailwind plugin).

---

## Phụ thuộc

- **Không chặn bởi EPIC nào** — có thể bắt đầu song song vì không đụng logic/dữ liệu.
- **Tuy nhiên không nên** chạm vào các file thuộc EPIC-01/EPIC-02 đang chờ sửa (tránh chồng diff).
  Ưu tiên bắt đầu từ component mới (`src/components/`) + áp dụng vào trang ít rủi ro.
- **Phụ thuộc mềm:** EPIC-03 (enum thật) — component `Badge` map trạng thái nên được thiết kế để dễ
  mở rộng khi enum thật được xác nhận; nhưng không cần chờ để viết component.
- **Q11 (đề xuất):** PO có muốn giữ đúng ngôn ngữ thiết kế hiện tại (light-only, blue-600) hay có
  kế hoạch đổi theme? Nếu có kế hoạch đổi theme, thứ tự công việc nên đảo lại.

---

## Rủi ro

| ID | Rủi ro | Mức | Giảm thiểu |
|----|--------|-----|-----------|
| R7-01 | "Refactor UI" bị hiểu thành "đổi thiết kế" ⇒ trôi phạm vi | 🟡 TB | Acceptance criteria ghi rõ: giao diện **phải trông giống hệt** trước/sau; chỉ đổi cách viết code |
| R7-02 | Vô tình đổi hành vi (ví dụ form mất giá trị mặc định khi bọc vào component) | 🟡 TB | Verify bằng negative testing trên form: submit rỗng, submit thiếu trường |
| R7-03 | Bọc component làm mất `name`/`id` của input ⇒ form không gửi dữ liệu | 🔴 Cao | Negative test bắt buộc cho mọi form đã chạm; kiểm tra `FormData` thực nhận |
| R7-04 | Xoá `dark:*` làm thay đổi giao diện trên máy người dùng đang bật dark mode | 🟢 Thấp | `globals.css` đã ép biến màu sáng trong dark mode ⇒ hiển thị vốn đã là light; cần xác nhận bằng mắt |
| R7-05 | Tạo thêm abstraction không cần thiết (component chỉ dùng 1 lần) | 🟢 Thấp | Chỉ tách component khi có ≥ 2 nơi dùng, hoặc khi chứa logic map phức tạp |

---

## Danh sách task đề xuất

| Task | Nội dung | Trạng thái | Ghi chú |
|------|----------|-----------|---------|
| T-07-01 | Tạo `src/components/` + `Badge` map trạng thái xác minh & trạng thái chuyến (một nguồn nhãn tiếng Việt) | `PROPOSED` | Khởi đầu an toàn, không đụng logic |
| T-07-02 | Áp dụng `Badge` vào dashboard, thay ternary inline | `PROPOSED` | Verify: nhãn/màu giữ nguyên |
| T-07-03 | Tạo `Card`, `Button`, `Alert` bọc class có sẵn trong `globals.css` | `PROPOSED` | Không thêm thư viện |
| T-07-04 | Loại bỏ toàn bộ `dark:*` class không hiệu lực | `PROPOSED` | Thuần dọn dẹp; cần review kỹ diff |
| T-07-05 | Chuẩn hoá `EmptyState` + `Skeleton` cho các danh sách (chuyến, yêu cầu, thông báo) | `PROPOSED` | Cải thiện UX khi không có dữ liệu |
| T-07-06 | Chuẩn hoá hiển thị lỗi form (dùng `.alert-error` thống nhất) + bổ sung `aria-*` cơ bản | `PROPOSED` | **Cần đặc biệt cẩn trọng**: form là nơi dễ gây lỗi gửi dữ liệu (R7-03) |

---

## Liên kết

- `constitution.md` §5 — thứ tự ưu tiên (EPIC-07 ở mức 7)
- `src/app/globals.css` — design system là nguồn sự thật, EPIC-07 chỉ *áp dụng*
- `EPIC-03-data-integrity.md` — enum thật ảnh hưởng thiết kế `Badge`
- `architecture.md` — cập nhật sơ đồ module khi `src/components/` ra đời
