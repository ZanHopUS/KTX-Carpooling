import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { parseNaturalLanguageQuery } from '@/lib/ai';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Bạn cần đăng nhập để sử dụng tính năng tìm kiếm AI.' }, { status: 401 });
    }
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
