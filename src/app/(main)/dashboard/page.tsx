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

  // Count total trips created by driver
  const { count: completedCount } = await supabase
    .from('trips')
    .select('*', { count: 'exact', head: true })
    .eq('driver_id', user.id);

  // Count pending requests sent by passenger
  const { count: pendingCount } = await supabase
    .from('trip_requests')
    .select('*', { count: 'exact', head: true })
    .eq('passenger_id', user.id);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Quản lý chuyến đi
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Xin chào, <strong className="text-gray-900">{profile?.full_name || 'Sinh viên'}</strong>! Quản lý các chuyến xe máy và yêu cầu ghép chuyến của bạn.
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/trips/create"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition"
          >
            + Đăng chuyến đi
          </Link>
          <Link
            href="/trips"
            className="px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-xs rounded-xl border border-gray-300 transition shadow-sm"
          >
            Tìm chuyến
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Chuyến xe đã tạo</span>
          <p className="text-3xl font-bold text-gray-900">{completedCount || 0}</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Yêu cầu chờ duyệt</span>
          <p className="text-3xl font-bold text-amber-600">{pendingCount || 0}</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Xác minh Sinh viên</span>
          <div className="flex items-center justify-between">
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
              profile?.dorm_card_verified === 'VERIFIED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
              profile?.dorm_card_verified === 'PENDING' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
              'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {profile?.dorm_card_verified === 'VERIFIED' ? '✓ Đã xác minh' :
               profile?.dorm_card_verified === 'PENDING' ? '⌛ Đang xét duyệt' : '❌ Chưa xác minh'}
            </span>

            <Link href="/profile/verify" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
              Chi tiết →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
