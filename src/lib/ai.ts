/**
 * Gemini API / AI integration for KTX Carpooling (Section 14 in Project Report)
 * Converts natural language user queries into structured search filter objects.
 * Example input: "Mai mình học tiết 1 ở HCMUS, tìm giúp chuyến đón ở B2 khoảng 6 rưỡi"
 * Output: { date: "2026-09-18", pickup_building: "B2", pickup_time: "06:30", destination_school: "HCMUS" }
 */

export interface ParsedSearchIntent {
  date?: string;
  pickup_building?: string;
  pickup_time?: string;
  destination_school?: string;
  class_period?: number;
  raw_query: string;
}

export async function parseNaturalLanguageQuery(query: string): Promise<ParsedSearchIntent> {
  const trimmed = query.trim();
  if (!trimmed) {
    return { raw_query: query };
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const prompt = `Bạn là trợ lý AI cho ứng dụng KTX Carpooling. Hãy phân tích câu tìm kiếm bằng tiếng Việt sau và trả về DUY NHẤT một chuỗi JSON chuẩn (không dùng markdown codeblock, không thêm văn bản giải thích):
{
  "date": "YYYY-MM-DD (nếu câu đề cập ngày mai/hôm nay/ngày cụ thể, hôm nay là ${todayStr})",
  "pickup_building": "Tên tòa KTX như A1, A2, B2, C1, D2...",
  "pickup_time": "HH:mm (giờ đón 24h, ví dụ 06:30, 07:00)",
  "destination_school": "HCMUS | HCMUT | UIT | USSH | IU | UEL",
  "class_period": số_tiết_học_nếu_có
}

Câu tìm kiếm của sinh viên: "${trimmed}"`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            raw_query: trimmed,
            date: parsed.date || undefined,
            pickup_building: parsed.pickup_building || undefined,
            pickup_time: parsed.pickup_time || undefined,
            destination_school: parsed.destination_school || undefined,
            class_period: typeof parsed.class_period === 'number' ? parsed.class_period : undefined,
          };
        }
      }
    } catch (err) {
      console.warn("Gemini API call error, using regex fallback:", err);
    }
  }

  // Smart Regex Fallback Parser for Vietnamese Student Queries
  const fallbackResult: ParsedSearchIntent = { raw_query: trimmed };
  const lower = trimmed.toLowerCase();

  // Date parsing
  const today = new Date();
  if (lower.includes('ngày mai') || lower.includes('mai')) {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    fallbackResult.date = tomorrow.toISOString().split('T')[0];
  } else if (lower.includes('hôm nay') || lower.includes('nay')) {
    fallbackResult.date = today.toISOString().split('T')[0];
  }

  // School parsing
  const schools = ['HCMUS', 'HCMUT', 'UIT', 'USSH', 'IU', 'UEL'];
  for (const s of schools) {
    if (lower.includes(s.toLowerCase())) {
      fallbackResult.destination_school = s;
      break;
    }
  }

  // Pickup building parsing (e.g. B2, A1, C3, D1)
  const bMatch = trimmed.match(/\b([A-E][1-9]|A1[5-9]|A20)\b/i);
  if (bMatch) {
    fallbackResult.pickup_building = bMatch[1].toUpperCase();
  }

  // Time parsing (e.g. 6h30, 6 rưỡi, 7 giờ, 06:45)
  if (lower.includes('6 rưỡi') || lower.includes('6h30')) {
    fallbackResult.pickup_time = '06:30';
  } else if (lower.includes('7 rưỡi') || lower.includes('7h30')) {
    fallbackResult.pickup_time = '07:30';
  } else {
    const tMatch = trimmed.match(/(\d{1,2})[h:](\d{2})?/i);
    if (tMatch) {
      const h = parseInt(tMatch[1], 10).toString().padStart(2, '0');
      const m = tMatch[2] ? tMatch[2].padStart(2, '0') : '00';
      fallbackResult.pickup_time = `${h}:${m}`;
    }
  }

  return fallbackResult;
}

