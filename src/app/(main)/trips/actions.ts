'use server';

import { createClient } from '@/utils/supabase/server';
import { calculateSuggestedPrice } from '@/lib/pricing';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function createTripAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: 'Bạn cần đăng nhập để thực hiện đăng chuyến đi.' };
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

  // Insert trip into database
  const { error: insertError } = await supabase.from('trips').insert({
    driver_id: user.id,
    date,
    pickup_time: pickupTime,
    pickup_area: pickupArea,
    pickup_building: pickupBuilding,
    pickup_point: pickupPoint,
    destination_university: destinationUniversity,
    destination_campus: destinationCampus,
    destination_building: destinationBuilding,
    distance_km: distanceKm,
    suggested_price: suggestedPrice,
    available_seats: availableSeats,
    payment_method: paymentMethod,
    notes,
    status: 'OPEN',
  });

  if (insertError) {
    console.error('Create trip error:', insertError);
    return { error: insertError.message || 'Không thể tạo chuyến đi. Vui lòng thử lại.' };
  }

  revalidatePath('/trips');
  revalidatePath('/dashboard');
  redirect('/trips');
}
