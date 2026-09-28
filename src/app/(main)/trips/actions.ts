'use server';

import { createClient } from '@/utils/supabase/server';
import { calculateSuggestedPrice } from '@/lib/pricing';
import { ensureDriverDependencies, toDbTripInsertPayload } from '@/lib/mappers/tripMapper';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function createTripAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: 'Bạn cần đăng nhập để thực hiện đăng chuyến đi.' };
  }

  // Verification Enforcement (D-03-07): Driver must be verified before creating trips
  const { data: profile } = await supabase
    .from('profiles')
    .select('dorm_card_verified, verification_status')
    .eq('id', user.id)
    .single();

  const isVerified = profile?.dorm_card_verified === 'VERIFIED' || profile?.verification_status === 'verified';
  if (!isVerified) {
    return { error: 'Bạn cần xác minh Thẻ KTX chính chủ trước khi đăng chuyến đi mới. Vui lòng tải lên thẻ KTX tại trang Cá nhân.' };
  }

  const date = formData.get('date') as string;
  const pickupTime = formData.get('pickupTime') as string;
  const pickupArea = formData.get('pickupArea') as string;
  const pickupBuilding = formData.get('pickupBuilding') as string;
  const pickupPoint = formData.get('pickupPoint') as string;
  const destinationUniversity = formData.get('destinationUniversity') as string;
  const destinationCampus = (formData.get('destinationCampus') as string) || null;
  const destinationBuilding = (formData.get('destinationBuilding') as string) || null;
  const distanceKm = parseFloat((formData.get('distanceKm') as string) || '3');
  const availableSeats = parseInt((formData.get('availableSeats') as string) || '1', 10);
  const paymentMethod = (formData.get('paymentMethod') as string) || 'CASH';
  const notes = (formData.get('notes') as string) || null;

  if (!date || !pickupTime || !pickupArea || !pickupBuilding || !pickupPoint || !destinationUniversity) {
    return { error: 'Vui lòng điền đầy đủ các thông tin chuyến đi bắt buộc.' };
  }

  // Calculate suggested contribution price based on distance
  const suggestedPrice = calculateSuggestedPrice(distanceKm);

  try {
    // 1. Ensure driver vehicle, pickup/destination locations, and route exist
    const deps = await ensureDriverDependencies(
      supabase,
      user.id,
      pickupArea,
      destinationUniversity,
      destinationCampus,
      distanceKm
    );

    // 2. Build complete DB insert payload (populating 26 normalized + 13 flat columns)
    const insertPayload = toDbTripInsertPayload(
      user.id,
      {
        date,
        pickupTime,
        pickupArea,
        pickupBuilding,
        pickupPoint,
        destinationUniversity,
        destinationCampus,
        destinationBuilding,
        distanceKm,
        suggestedPrice,
        availableSeats,
        paymentMethod,
        notes
      },
      deps
    );

    // 3. Insert trip into database
    const { error: insertError } = await supabase.from('trips').insert(insertPayload);

    if (insertError) {
      console.error('Create trip error:', insertError);
      return { error: insertError.message || 'Không thể tạo chuyến đi. Vui lòng thử lại.' };
    }
  } catch (err: unknown) {
    console.error('Create trip dependency error:', err);
    const msg = err instanceof Error ? err.message : 'Lỗi thiết lập thông tin chuyến đi.';
    return { error: msg };
  }

  revalidatePath('/trips');
  revalidatePath('/dashboard');
  redirect('/trips');
}

