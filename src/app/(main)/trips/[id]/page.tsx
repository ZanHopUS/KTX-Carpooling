import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { formatVND } from '@/lib/pricing';
import TripRequestForm from './TripRequestForm';
import { Trip, UserProfile, TripRequest } from '@/types/database';

export default async function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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

  const trip = tripData as Trip;
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
    <div className="container mx-auto p-4 sm:p-6 space-y-6 max-w-4xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
        <Link href="/trips" className="hover:text-blue-500 transition">← Danh sách chuyến đi</Link>
        <span>/</span>
        <span>Chi tiết chuyến #{trip.id.slice(0, 8)}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Trip Info (2 cols) */}
        <div className="md:col-span-2 space-y-6">
          <div className="p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-6">
            {/* Status & Badge Header */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-zinc-800">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                {trip.status === 'OPEN' && '🟢 Đang tìm hành khách'}
                {trip.status === 'REQUESTED' && '🟡 Đã có người đăng ký'}
                {trip.status === 'ACCEPTED' && '✅ Đã chốt chuyến'}
                {trip.status === 'COMPLETED' && '🎉 Đã hoàn thành'}
                {trip.status === 'CANCELLED' && '🔴 Đã hủy'}
              </span>

              <span className="text-xs text-slate-400">Ngày đăng: {new Date(trip.created_at).toLocaleDateString('vi-VN')}</span>
            </div>

            {/* Route Details */}
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg border border-blue-200/50">
                  📍
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Điểm đón KTX</span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{trip.pickup_point}</h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">Tòa {trip.pickup_building} • {trip.pickup_area === 'KHU_A' ? 'Ký túc xá Khu A' : 'Ký túc xá Khu B'}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg border border-indigo-200/50">
                  🏫
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Trường đại học đến</span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{trip.destination_university}</h3>
                  {trip.destination_campus && <p className="text-xs text-slate-500 dark:text-zinc-400">{trip.destination_campus}</p>}
                </div>
              </div>
            </div>

            {/* Time & Price Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">🗓️ Ngày đi</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">{trip.date}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">⏰ Giờ đón</span>
                <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">{trip.pickup_time}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">💵 Khoản đóng góp</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">{formatVND(trip.suggested_price)}</span>
              </div>
            </div>

            {trip.notes && (
              <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/40 rounded-xl text-xs text-slate-600 dark:text-zinc-400">
                💬 <strong>Ghi chú từ tài xế:</strong> {trip.notes}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Driver Card & Request Form (1 col) */}
        <div className="space-y-6">
          {/* Driver Card */}
          <div className="p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Thông tin Tài xế KTX</h3>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-lg shadow">
                {driver?.full_name?.slice(0, 1) || 'T'}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">{driver?.full_name}</h4>
                  {driver?.dorm_card_verified === 'VERIFIED' && <span title="Đã xác minh thẻ KTX">✅</span>}
                </div>
                <p className="text-xs text-slate-500 dark:text-zinc-400">{driver?.university}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 text-xs space-y-2 text-slate-600 dark:text-zinc-400">
              <div className="flex justify-between">
                <span>Điểm uy tín:</span>
                <span className="font-bold text-amber-500">⭐ {driver?.rating?.toFixed(1) || '5.0'} / 5.0</span>
              </div>
              <div className="flex justify-between">
                <span>Số chuyến đã hoàn thành:</span>
                <span className="font-bold text-slate-900 dark:text-white">{driver?.completed_trip_count || 0} chuyến</span>
              </div>
              <div className="flex justify-between">
                <span>Trạng thái Thẻ KTX:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {driver?.dorm_card_verified === 'VERIFIED' ? 'Đã xác minh' : 'Chưa xác minh'}
                </span>
              </div>
            </div>
          </div>

          {/* Request Form or Driver Controls */}
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
