/**
 * Placeholder for Gemini API / AI integration (Section 14 in Report)
 * Converts natural language user queries into structured search filter objects.
 * Example input: "Mai mình học tiết 1 ở HCMUS, tìm giúp chuyến đón ở B2 khoảng 6 rưỡi"
 * Output: { date: "tomorrow", pickup_building: "B2", pickup_time: "06:30", destination_school: "HCMUS" }
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
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set. Returning fallback parsing.");
    return { raw_query: query };
  }

  try {
    // Call Gemini API REST endpoint or SDK here
    // For now return dummy parsed object for illustration
    return {
      raw_query: query,
      pickup_time: "06:30",
      pickup_building: "B2",
      destination_school: "HCMUS",
    };
  } catch (error) {
    console.error("Failed to parse natural language query with Gemini API:", error);
    return { raw_query: query };
  }
}
