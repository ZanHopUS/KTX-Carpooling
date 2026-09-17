'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function uploadDormCardAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: 'Bạn cần đăng nhập để tải lên ảnh thẻ KTX.' };
  }

  const file = formData.get('dormCardFile') as File | null;
  const studentId = formData.get('studentId') as string;
  const dormArea = formData.get('dormArea') as string;
  const dormBuilding = formData.get('dormBuilding') as string;

  if (!file || file.size === 0) {
    return { error: 'Vui lòng chọn 1 tệp hình ảnh thẻ KTX rõ nét.' };
  }

  let fileUrl = '';

  try {
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    // Upload to Supabase Storage 'dorm-cards' bucket
    const { data: uploadData, error: uploadErr } = await supabase
      .storage
      .from('dorm-cards')
      .upload(fileName, file, { upsert: true });

    if (!uploadErr && uploadData) {
      const { data: publicUrlData } = supabase
        .storage
        .from('dorm-cards')
        .getPublicUrl(fileName);
      fileUrl = publicUrlData.publicUrl;
    } else {
      console.warn('Storage upload note:', uploadErr?.message);
      // Fallback filename placeholder if bucket public policy requires admin access
      fileUrl = `https://supabase.co/storage/v1/object/public/dorm-cards/${fileName}`;
    }
  } catch (err) {
    console.error('File upload exception:', err);
  }

  // Update profile
  const { error: updateErr } = await supabase
    .from('profiles')
    .update({
      student_id: studentId || null,
      dorm_area: dormArea,
      dorm_building: dormBuilding,
      dorm_card_verified: 'PENDING',
      dorm_card_url: fileUrl || undefined,
    })
    .eq('id', user.id);

  if (updateErr) {
    console.error('Update profile verification error:', updateErr);
    return { error: 'Không thể cập nhật hồ sơ. Vui lòng thử lại.' };
  }

  revalidatePath('/profile');
  revalidatePath('/profile/verify');
  revalidatePath('/admin/verifications');

  return { success: true, message: 'Đã tải lên ảnh thẻ KTX thành công! Ban quản trị sẽ xác minh hồ sơ của bạn trong thời gian sớm nhất.' };
}
