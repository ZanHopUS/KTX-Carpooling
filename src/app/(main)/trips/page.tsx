import { createClient } from '@/utils/supabase/server';
import TripsSearchClient from './TripsSearchClient';
import { Trip, UserProfile } from '@/types/database';

export default async function TripsPage() {
  const supabase = await createClient();

  // Get logged-in user profile
  const { data: { user } } = await supabase.auth.getUser();
  let userProfile: UserProfile | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (profile) {
      userProfile = profile as UserProfile;
    }
  }

  // Fetch active trips with driver profile
  // Note: Using .in() to support both lowercase and uppercase enum values in DB
  // The client-side filterCompatibleTrips() will further filter by OPEN status
  let { data: tripsData, error } = await supabase
    .from('trips')
    .select(`
      *,
      driver:profiles!driver_id (*)
    `)
    .order('created_at', { ascending: false })
    .limit(200);

  // If enum error, try fetching without status filter
  if (error?.code === '22P02') {
    const fallback = await supabase
      .from('trips')
      .select(`*, driver:profiles!driver_id (*)`)
      .order('created_at', { ascending: false })
      .limit(200);
    tripsData = fallback.data;
    error = fallback.error;
  }

  if (error) {
    console.error('Error fetching trips:', error);
  }

  // Normalize: convert all status values to uppercase for consistent matching
  // This handles DB storing lowercase ('open') vs our app using uppercase ('OPEN')
  const initialTrips: Trip[] = (tripsData || []).map((t: any) => ({
    ...t,
    status: t.status?.toUpperCase(),
    driver: t.driver ? { ...t.driver, dorm_card_verified: t.driver.dorm_card_verified?.toUpperCase() } : undefined,
  })) as Trip[];

  // Debug: log distinct status values from DB (remove after confirming)
  const distinctStatuses = [...new Set((tripsData || []).map((t: any) => t.status))];
  if (distinctStatuses.length > 0) {
    console.log('[DEBUG] Trip status values in DB:', distinctStatuses);
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6 max-w-6xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            🛵 Tìm chuyến đi KTX
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400">
            Danh sách chuyến xe máy từ KTX Khu A & Khu B đến trường đại học được ghép bởi thuật toán
          </p>
        </div>
      </div>

      <TripsSearchClient initialTrips={initialTrips} currentUserProfile={userProfile} />
    </div>
  );
}
