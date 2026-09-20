'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { calculateMatchScore } from '@/lib/matching';

export async function createTripRequestAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: 'Bạn cần đăng nhập để gửi yêu cầu ghép chuyến.' };
  }

  const tripId = formData.get('tripId') as string;
  const requestedPickupTime = formData.get('requestedPickupTime') as string;
  const message = (formData.get('message') as string) || '';

  if (!tripId || !requestedPickupTime) {
    return { error: 'Vui lòng cung cấp đầy đủ giờ đón mong muốn.' };
  }

  // 1. Fetch trip and passenger profile
  const { data: trip, error: tripError } = await supabase
    .from('trips')
    .select('*')
    .eq('id', tripId)
    .single();

  if (tripError || !trip) {
    return { error: 'Chuyến đi không tồn tại hoặc đã bị xóa.' };
  }

  if (trip.driver_id === user.id) {
    return { error: 'Bạn là tài xế của chuyến đi này, không thể tự gửi yêu cầu ghép chuyến.' };
  }

  if (trip.status !== 'OPEN' && trip.status !== 'REQUESTED') {
    return { error: 'Chuyến đi này hiện không nhận thêm yêu cầu ghép xe.' };
  }

  const { data: passengerProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // 2. Calculate match score
  const matchResult = calculateMatchScore(trip, {
    date: trip.date,
    pickup_time: requestedPickupTime,
    passenger_university: passengerProfile?.university || trip.destination_university,
    passenger_profile: passengerProfile || undefined,
  });

  // 3. Insert into trip_requests
  const { error: insertError } = await supabase.from('trip_requests').insert({
    trip_id: tripId,
    passenger_id: user.id,
    requested_pickup_time: requestedPickupTime,
    match_score: matchResult.match_score,
    status: 'PENDING',
  });

  if (insertError) {
    console.error('Insert trip_request error:', insertError);
    return { error: insertError.message || 'Không thể gửi yêu cầu ghép chuyến. Vui lòng thử lại.' };
  }

  // Update trip status to REQUESTED
  await supabase.from('trips').update({ status: 'REQUESTED' }).eq('id', tripId);

  revalidatePath(`/trips/${tripId}`);
  revalidatePath('/requests');
  return { success: true, message: 'Đã gửi yêu cầu ghép chuyến thành công cho tài xế!' };
}

export async function acceptTripRequestAction(requestId: string, tripId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Bạn chưa đăng nhập.' };

  // Verify user is driver of trip
  const { data: trip } = await supabase.from('trips').select('driver_id').eq('id', tripId).single();
  if (!trip || trip.driver_id !== user.id) {
    return { error: 'Bạn không có quyền thực hiện thao tác này.' };
  }

  // 1. Update target request to ACCEPTED
  const { error: acceptErr } = await supabase
    .from('trip_requests')
    .update({ status: 'ACCEPTED' })
    .eq('id', requestId);

  if (acceptErr) return { error: acceptErr.message };

  // 2. Reject all other pending requests for this trip
  await supabase
    .from('trip_requests')
    .update({ status: 'REJECTED' })
    .eq('trip_id', tripId)
    .neq('id', requestId)
    .eq('status', 'PENDING');

  // 3. Update trip status to ACCEPTED and available_seats = 0
  await supabase
    .from('trips')
    .update({ status: 'ACCEPTED', available_seats: 0 })
    .eq('id', tripId);

  revalidatePath(`/trips/${tripId}`);
  revalidatePath('/requests');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function rejectTripRequestAction(requestId: string, tripId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Bạn chưa đăng nhập.' };

  // Reject request
  await supabase.from('trip_requests').update({ status: 'REJECTED' }).eq('id', requestId);

  // Check remaining PENDING requests for trip
  const { data: remaining } = await supabase
    .from('trip_requests')
    .select('id')
    .eq('trip_id', tripId)
    .eq('status', 'PENDING');

  if (!remaining || remaining.length === 0) {
    // Revert trip status to OPEN
    await supabase.from('trips').update({ status: 'OPEN' }).eq('id', tripId);
  }

  revalidatePath(`/trips/${tripId}`);
  revalidatePath('/requests');
  return { success: true };
}

export async function cancelTripRequestAction(requestId: string, tripId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Bạn chưa đăng nhập.' };

  await supabase
    .from('trip_requests')
    .update({ status: 'CANCELLED' })
    .eq('id', requestId)
    .eq('passenger_id', user.id);

  revalidatePath(`/trips/${tripId}`);
  revalidatePath('/requests');
  return { success: true };
}
