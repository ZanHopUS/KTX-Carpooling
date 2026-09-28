import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { parseNaturalLanguageQuery } from '@/lib/ai';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { query } = await request.json();
    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid query' }, { status: 400 });
    }

    const parsedFilter = await parseNaturalLanguageQuery(query);
    return NextResponse.json({ success: true, filter: parsedFilter });
  } catch (error) {
    console.error('Error parsing AI intent:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
