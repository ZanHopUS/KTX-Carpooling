import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { UserProfile } from '@/types/database';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login');
  }

  // Fetch profile
  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const profile = (profileData as UserProfile) || null;

  // Count total trips created by driver (avoid enum comparison error)
  const { count: completedCount } = await supabase
    .from('trips')
    .select('*', { count: 'exact', head: true })
    .eq('driver_id', user.id);

  // Count pending requests sent by passenger (avoid enum comparison error)
  const { count: pendingCount } = await supabase
    .from('trip_requests')
    .select('*', { count: 'exact', head: true })
    .eq('passenger_id', user.id);

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            📊 Bảng điều khiển Sinh viên KTX
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400">
            Xin chào, <strong className="text-slate-800 dark:text-zinc-200">{profile?.full_name || 'Sinh viên'}</strong>! Theo dõi lịch trình di chuyển và hoạt động ghép xe của bạn
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/trips/create"
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition hover:scale-105"
          >
            🛵 Đăng chuyến đi mới
          </Link>
          <Link
            href="/trips"
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl border border-slate-700 transition"
          >
            🔍 Tìm chuyến đi
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400">Chuyến đi đã hoàn thành</span>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{completedCount || 0}</p>
        </div>

        <div className="p-5 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400">Yêu cầu đang chờ tài xế duyệt</span>
          <p className="text-3xl font-extrabold text-amber-500">{pendingCount || 0}</p>
        </div>

        <div className="p-5 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-slate-400 block">Xác minh Thẻ KTX</span>
          <div className="flex items-center justify-between">
            <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
              profile?.dorm_card_verified === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
              profile?.dorm_card_verified === 'PENDING' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
              'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
            }`}>
              {profile?.dorm_card_verified === 'VERIFIED' ? '✅ Đã xác minh' :
               profile?.dorm_card_verified === 'PENDING' ? '⌛ Đang chờ duyệt' : '❌ Chưa xác minh'}
            </span>

            <Link href="/profile/verify" className="text-xs font-bold text-blue-600 hover:underline">
              Cập nhật →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
