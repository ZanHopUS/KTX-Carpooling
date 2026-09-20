import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import RequestsClient from './RequestsClient';
import { TripRequest } from '@/types/database';

export default async function RequestsPage() {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect('/login');
  }

  // 1. Fetch requests sent by current user (Passenger view)
  const { data: sentData } = await supabase
    .from('trip_requests')
    .select(`
      *,
      trip:trips!trip_id (
        *,
        driver:profiles!driver_id (*)
      )
    `)
    .eq('passenger_id', user.id)
    .order('created_at', { ascending: false });

  // 2. Fetch requests received for trips created by current user (Driver view)
  const { data: myTrips } = await supabase
    .from('trips')
    .select('id')
    .eq('driver_id', user.id);

  let receivedData: any[] = [];
  if (myTrips && myTrips.length > 0) {
    const tripIds = myTrips.map((t) => t.id);
    const { data: recData } = await supabase
      .from('trip_requests')
      .select(`
        *,
        passenger:profiles!passenger_id (*),
        trip:trips!trip_id (*)
      `)
      .in('trip_id', tripIds)
      .order('created_at', { ascending: false });

    if (recData) receivedData = recData;
  }

  const sentRequests = (sentData as TripRequest[]) || [];
  const receivedRequests = (receivedData as TripRequest[]) || [];

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          📥 Quản lý Yêu cầu Ghép xe
        </h1>
        <p className="text-sm text-slate-500 dark:text-zinc-400">
          Theo dõi các yêu cầu ghép chuyến xe máy bạn đã gửi hoặc các sinh viên muốn đi chung chuyến của bạn
        </p>
      </div>

      <RequestsClient sentRequests={sentRequests} receivedRequests={receivedRequests} />
    </div>
  );
}
