import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('dorm_card') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Upload to Supabase Storage private bucket
    const fileExt = file.name.split('.').pop();
    const filePath = `verifications/${user.id}_${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('verification_docs')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json({ error: 'Failed to upload document' }, { status: 500 });
    }

    // Update user profile status
    await supabase
      .from('users')
      .update({
        dorm_card_url: filePath,
        dorm_card_verified: 'PENDING',
      })
      .eq('id', user.id);

    return NextResponse.json({ success: true, message: 'Dorm card submitted for verification' });
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
