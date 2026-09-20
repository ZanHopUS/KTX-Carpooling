import { NextRequest, NextResponse } from 'next/server';
import { parseNaturalLanguageQuery } from '@/lib/ai';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const query = body?.query;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Vui lòng cung cấp nội dung tìm kiếm bằng văn bản.' },
        { status: 400 }
      );
    }

    const parsedIntent = await parseNaturalLanguageQuery(query);
    return NextResponse.json({ success: true, intent: parsedIntent });
  } catch (error) {
    console.error('API /api/ai/search error:', error);
    return NextResponse.json(
      { error: 'Không thể phân tích yêu cầu bằng AI. Vui lòng thử lại.' },
      { status: 500 }
    );
  }
}
