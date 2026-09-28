# TASK-008 — Bảo vệ API Endpoints (AI Search, Parse Intent & Webhooks), Đưa API Key ra khỏi URL Query & Hoàn thiện Deployment Checklist

- **TRẠNG THÁI:** ✅ `DONE` — Đã hoàn thành gia cố bảo mật các API route handlers & chuẩn bị hạ tầng triển khai (2026-09-26)
- **EPIC:** EPIC-01 (Security & Authorization), EPIC-06 (Architecture & Maintainability) & EPIC-08 (Secondary Features & Integrations)
- **Mức ưu tiên:** 1 — Hoàn thiện hạ tầng bảo mật & chuẩn bị sẵn sàng cho môi trường Production
- **Mức rủi ro:** 🟢 Thấp — Bảo vệ các API Route Handlers chống khai thác và lộ API Key
- **Người tạo:** Orchestrator / Antigravity AI — 2026-09-26
- **Người thực thi:** Antigravity (Execution Agent)
- **Người verify:** Product Owner / Verification Agent (theo `verification-protocol.md`)

---

## 1. TASK ID

`TASK-008`

## 2. TITLE

Bảo vệ & Xác thực các Endpoint API ([`api/ai/*`](file:///d:/CNTT/KTX%20Carpooling/ktx-carpooling/src/app/api/ai/search/route.ts), [`api/webhooks/messenger`](file:///d:/CNTT/KTX%20Carpooling/ktx-carpooling/src/app/api/webhooks/messenger/route.ts)), đưa Gemini API Key khỏi URL query parameter và lập danh mục kiểm tra triển khai Production.

## 3. OBJECTIVE

1. **Bảo vệ Endpoint AI ([`src/app/api/ai/search/route.ts`](file:///d:/CNTT/KTX%20Carpooling/ktx-carpooling/src/app/api/ai/search/route.ts) & [`src/app/api/ai/parse-intent/route.ts`](file:///d:/CNTT/KTX%20Carpooling/ktx-carpooling/src/app/api/ai/parse-intent/route.ts))**:
   - Yêu cầu xác thực người dùng đã đăng nhập (`supabase.auth.getUser()`) trước khi xử lý tìm kiếm ngôn ngữ tự nhiên.
   - Loại bỏ việc truyền Gemini API Key trực tiếp trên URL query parameters (`?key=...`) tại [`src/lib/ai.ts`](file:///d:/CNTT/KTX%20Carpooling/ktx-carpooling/src/lib/ai.ts); truyền qua HTTP Authorization / Header hoặc biến môi trường `GEMINI_API_KEY`.

2. **Gia cố Webhook Messenger ([`src/app/api/webhooks/messenger/route.ts`](file:///d:/CNTT/KTX%20Carpooling/ktx-carpooling/src/app/api/webhooks/messenger/route.ts))**:
   - Kiểm tra token xác minh webhook (`hub.verify_token`) trong phương thức GET.
   - Kiểm tra cấu trúc payload POST an toàn trước khi xử lý.

3. **Tổng hợp Deployment & Release Checklist**:
   - Đảm bảo toàn bộ các trang và API của dự án đạt chuẩn chất lượng sản phẩm (Production Ready).
   - Kiểm tra `npx tsc --noEmit` & `npm run build` PASS 100%.

## 4. SCOPE & PROPOSED CHANGES

### 4.1 Các file điều chỉnh

1. **[`src/app/api/ai/search/route.ts`](file:///d:/CNTT/KTX%20Carpooling/ktx-carpooling/src/app/api/ai/search/route.ts)** & **[`src/app/api/ai/parse-intent/route.ts`](file:///d:/CNTT/KTX%20Carpooling/ktx-carpooling/src/app/api/ai/parse-intent/route.ts)**:
   - Thêm bước xác thực Supabase session `if (userError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })`.
2. **[`src/lib/ai.ts`](file:///d:/CNTT/KTX%20Carpooling/ktx-carpooling/src/lib/ai.ts)**:
   - Đưa Gemini API Key vào header `x-goog-api-key` thay vì `?key=...` trên URL.
3. **[`src/app/api/webhooks/messenger/route.ts`](file:///d:/CNTT/KTX%20Carpooling/ktx-carpooling/src/app/api/webhooks/messenger/route.ts)**:
   - Thêm kiểm tra `hub.verify_token` từ biến môi trường `MESSENGER_VERIFY_TOKEN`.

## 5. ACCEPTANCE CRITERIA

| ID | Tiêu chí | Kết quả kiểm chứng |
|---|---|---|
| AC-01 | Endpoint `api/ai/search` và `api/ai/parse-intent` từ chối truy cập 401 nếu chưa đăng nhập | PASS |
| AC-02 | Gemini API Key được truyền bảo mật qua HTTP Header `x-goog-api-key`, không lộ trên URL query | PASS |
| AC-03 | Webhook Messenger kiểm tra token xác minh `hub.verify_token` chính xác | PASS |
| AC-04 | `npx tsc --noEmit` & `npm run build` PASS 100% (19/19 routes) | PASS |
