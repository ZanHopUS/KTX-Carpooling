'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function approveVerificationAction(userId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Bạn cần đăng nhập với quyền Admin.' };

  const { error } = await supabase
    .from('profiles')
    .update({ dorm_card_verified: 'VERIFIED', verification_note: null })
    .eq('id', userId);

  if (error) return { error: error.message };

  revalidatePath('/admin/verifications');
  return { success: true };
}

export async function rejectVerificationAction(userId: string, note: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Bạn cần đăng nhập với quyền Admin.' };

  const { error } = await supabase
    .from('profiles')
    .update({ dorm_card_verified: 'REJECTED', verification_note: note || 'Ảnh thẻ không hợp lệ hoặc bị mờ.' })
    .eq('id', userId);

  if (error) return { error: error.message };

  revalidatePath('/admin/verifications');
  return { success: true };
}
