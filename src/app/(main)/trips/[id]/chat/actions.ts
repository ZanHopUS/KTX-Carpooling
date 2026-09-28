'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { TripStatus } from '@/types/database';

export async function sendMessageAction(tripId: string, content: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !content.trim()) {
    return { error: 'Nội dung tin nhắn không được để trống.' };
  }

  // Verify user is driver or accepted passenger of trip
  const { data: trip } = await supabase.from('trips').select('driver_id').eq('id', tripId).single();
  if (!trip) {
    return { error: 'Bạn không có quyền thực hiện thao tác này.' };
  }

  const isDriver = trip.driver_id === user.id;
  const { data: acceptedReq } = await supabase
    .from('trip_requests')
    .select('passenger_id')
    .eq('trip_id', tripId)
    .eq('status', 'ACCEPTED')
    .maybeSingle();

  if (!isDriver && acceptedReq?.passenger_id !== user.id) {
    return { error: 'Bạn không có quyền thực hiện thao tác này.' };
  }

  const { error } = await supabase.from('messages').insert({
    trip_id: tripId,
    sender_id: user.id,
    content: content.trim(),
  });

  if (error) {
    console.error('Send message error:', error);
    return { error: error.message };
  }

  revalidatePath(`/trips/${tripId}/chat`);
  return { success: true };
}

export async function updateTripStatusAction(tripId: string, newStatus: TripStatus, announcementMsg?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Chưa đăng nhập.' };

  // Verify user is driver of trip
  const { data: trip } = await supabase.from('trips').select('driver_id').eq('id', tripId).single();
  if (!trip || trip.driver_id !== user.id) {
    return { error: 'Bạn không có quyền thực hiện thao tác này.' };
  }

  const { error } = await supabase
    .from('trips')
    .update({ status: newStatus })
    .eq('id', tripId);

  if (error) return { error: error.message };

  if (announcementMsg) {
    await supabase.from('messages').insert({
      trip_id: tripId,
      sender_id: user.id,
      content: announcementMsg,
    });
  }

  revalidatePath(`/trips/${tripId}/chat`);
  revalidatePath(`/trips/${tripId}`);
  revalidatePath('/dashboard');
  return { success: true };
}

export async function submitRatingAction(tripId: string, toUserId: string, stars: number, comment?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Chưa đăng nhập.' };

  if (user.id === toUserId) {
    return { error: 'Bạn không thể tự đánh giá chính mình.' };
  }

  const { error } = await supabase.from('ratings').insert({
    trip_id: tripId,
    from_user_id: user.id,
    to_user_id: toUserId,
    score: stars,
    comment: comment?.trim() || null,
  });

  if (error) return { error: error.message };

  // Calculate and update user average rating on profile
  try {
    const { data: ratingsData } = await supabase
      .from('ratings')
      .select('score')
      .eq('to_user_id', toUserId);

    if (ratingsData && ratingsData.length > 0) {
      const avg = ratingsData.reduce((acc, r) => acc + (r.score || 0), 0) / ratingsData.length;
      await supabase
        .from('profiles')
        .update({
          average_rating: Number(avg.toFixed(1)),
          rating_count: ratingsData.length,
        })
        .eq('id', toUserId);
    }
  } catch (e) {
    console.error('Update rating stats error:', e);
  }

  revalidatePath(`/trips/${tripId}/chat`);
  return { success: true };
}
