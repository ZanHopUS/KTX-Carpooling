import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { formatVND } from '@/lib/pricing';
import TripRequestForm from './TripRequestForm';
import { Trip, UserProfile, TripRequest } from '@/types/database';
import { toAppTripDTO } from '@/lib/mappers/tripMapper';

export default async function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Validate UUID format to prevent DB syntax error on routes like /trips/create fallback
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  if (!isUuid) {
    notFound();
  }

  const supabase = await createClient();

  // Fetch current user
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch trip details with driver profile
  const { data: tripData, error } = await supabase
    .from('trips')
    .select(`
      *,
      driver:profiles!driver_id (*)
    `)
    .eq('id', id)
    .single();

  if (error || !tripData) {
    notFound();
  }

  const trip = toAppTripDTO(tripData);
  const driver = trip.driver as UserProfile | undefined;

  const isDriver = user?.id === trip.driver_id;

  // Check if passenger already sent request
  let userAlreadyRequested = false;
  if (user && !isDriver) {
    const { data: existingReq } = await supabase
      .from('trip_requests')
      .select('id')
      .eq('trip_id', trip.id)
      .eq('passenger_id', user.id)
      .not('status', 'eq', 'CANCELLED')
      .maybeSingle();

    if (existingReq) {
      userAlreadyRequested = true;
    }
  }

  // Fetch all requests if driver viewing
  let requestsList: TripRequest[] = [];
  if (isDriver) {
    const { data: reqs } = await supabase
      .from('trip_requests')
      .select(`
        *,
        passenger:profiles!passenger_id (*)
      `)
      .eq('trip_id', trip.id)
      .order('created_at', { ascending: false });

    if (reqs) requestsList = reqs as TripRequest[];
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <Link href="/trips" className="hover:text-blue-600 transition">← Danh sách chuyến đi</Link>
        <span>/</span>
        <span className="font-bold text-slate-900">Chi tiết chuyến #{trip.id.slice(0, 8)}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Trip Info */}
        <div className="md:col-span-2 space-y-6">
          <div className="p-6 sm:p-8 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
            {/* Status Header */}
            <div className="flex flex-wrap justify-between items-center gap-2 pb-5 border-b border-slate-100">
              <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                {trip.status === 'OPEN' && '🟢 Đang tìm hành khách'}
                {trip.status === 'REQUESTED' && '🟡 Đã có người gửi yêu cầu'}
                {trip.status === 'ACCEPTED' && '✅ Đã chốt người đi cùng'}
                {trip.status === 'COMPLETED' && '🎉 Đã hoàn thành'}
                {trip.status === 'CANCELLED' && '🔴 Đã hủy'}
              </span>

              <span className="text-xs text-slate-400 font-medium">
                Ngày tạo: {new Date(trip.created_at).toLocaleDateString('vi-VN')}
              </span>
            </div>

            {/* Route Details */}
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg shrink-0">
                  📍
                </div>
                <div className="space-y-0.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Điểm xuất phát</span>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">{trip.pickup_point}</h3>
                  <p className="text-xs text-slate-500 font-medium">Tòa {trip.pickup_building} • {trip.pickup_area === 'KHU_A' ? 'Ký túc xá Khu A' : 'Ký túc xá Khu B'}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg shrink-0">
                  🏫
                </div>
                <div className="space-y-0.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Điểm đến (Trường đại học)</span>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">{trip.destination_university}</h3>
                  {trip.destination_campus && <p className="text-xs text-slate-500 font-medium">{trip.destination_campus}</p>}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-5 bg-slate-50/80 rounded-2xl text-xs border border-slate-100">
              <div>
                <span className="text-slate-500 font-medium block mb-1">🗓️ Ngày đi</span>
                <span className="font-extrabold text-slate-900 text-sm">{trip.date}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block mb-1">⏰ Giờ đón</span>
                <span className="font-extrabold text-blue-600 text-sm">{trip.pickup_time}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block mb-1">💵 Chi phí đóng góp</span>
                <span className="font-extrabold text-emerald-600 text-sm">{formatVND(trip.suggested_price)}</span>
              </div>
            </div>

            {trip.notes && (
              <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl text-xs text-slate-700 font-medium leading-relaxed">
                💬 <strong>Ghi chú từ tài xế:</strong> {trip.notes}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Driver Card & Request Form */}
        <div className="space-y-6">
          <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Thông tin Tài xế</h3>

            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-xs">
                {driver?.full_name?.slice(0, 1) || 'S'}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="font-extrabold text-slate-900 text-sm">{driver?.full_name}</h4>
                  {driver?.dorm_card_verified === 'VERIFIED' && (
                    <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                      ✓ Đã xác minh
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 font-medium">{driver?.university}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 text-xs space-y-2.5 text-slate-600 font-medium">
              <div className="flex justify-between items-center">
                <span>Điểm uy tín:</span>
                <span className="font-extrabold text-amber-600">⭐ {driver?.rating?.toFixed(1) || '5.0'} / 5.0</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Số chuyến hoàn thành:</span>
                <span className="font-extrabold text-slate-900">{driver?.completed_trip_count || 0} chuyến</span>
              </div>
            </div>
          </div>

          {/* Request Form or Driver Info */}
          <TripRequestForm
            tripId={trip.id}
            defaultPickupTime={trip.pickup_time}
            isDriver={isDriver}
            userAlreadyRequested={userAlreadyRequested}
            tripStatus={trip.status}
          />
        </div>
      </div>
    </div>
  );
}
