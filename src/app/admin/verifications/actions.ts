'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function approveVerificationAction(userId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Bạn cần đăng nhập với quyền Admin.' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || (profile.role?.toUpperCase() !== 'ADMIN' && profile.role !== 'admin')) {
    return { error: 'Bạn không có quyền thực hiện thao tác này (yêu cầu quyền Admin).' };
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      dorm_card_verified: 'VERIFIED',
      verification_status: 'verified',
      verification_note: null,
    })
    .eq('id', userId);

  if (error) return { error: error.message };

  revalidatePath('/admin/verifications');
  return { success: true };
}

export async function rejectVerificationAction(userId: string, note: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Bạn cần đăng nhập với quyền Admin.' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || (profile.role?.toUpperCase() !== 'ADMIN' && profile.role !== 'admin')) {
    return { error: 'Bạn không có quyền thực hiện thao tác này (yêu cầu quyền Admin).' };
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      dorm_card_verified: 'REJECTED',
      verification_status: 'rejected',
      verification_note: note || 'Ảnh thẻ không hợp lệ hoặc bị mờ.',
    })
    .eq('id', userId);

  if (error) return { error: error.message };

  revalidatePath('/admin/verifications');
  return { success: true };
}
