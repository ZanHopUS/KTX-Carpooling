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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
            <span>👋 Bảng điều khiển cá nhân</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Xin chào, {profile?.full_name || 'Sinh viên'}!
          </h1>
          <p className="text-sm text-slate-500 font-medium max-w-xl">
            Quản lý các chuyến xe máy ghép cùng tuyến, theo dõi trạng thái yêu cầu và xác minh thẻ KTX của bạn.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/trips/create"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-500/20 transition flex items-center gap-1.5"
          >
            <span>+</span> Đăng chuyến đi
          </Link>
          <Link
            href="/trips"
            className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm rounded-xl border border-slate-200 shadow-xs transition"
          >
            Tìm chuyến
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Chuyến xe đã đăng</span>
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600 font-bold text-sm">🛵</span>
          </div>
          <p className="text-3xl sm:text-4xl font-black text-slate-900">{completedCount || 0}</p>
          <p className="text-xs text-slate-400 font-medium">Tổng số chuyến bạn tạo vai trò tài xế</p>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Yêu cầu chờ phản hồi</span>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600 font-bold text-sm">📩</span>
          </div>
          <p className="text-3xl sm:text-4xl font-black text-amber-600">{pendingCount || 0}</p>
          <p className="text-xs text-slate-400 font-medium">Lời nhắn ghép xe gửi cho các tài xế khác</p>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Xác minh Sinh viên</span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 font-bold text-sm">🪪</span>
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
              profile?.dorm_card_verified === 'VERIFIED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
              profile?.dorm_card_verified === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200' :
              'bg-red-50 text-red-700 border-red-200'
            }`}>
              {profile?.dorm_card_verified === 'VERIFIED' ? '✓ Đã xác minh' :
               profile?.dorm_card_verified === 'PENDING' ? '⌛ Đang xét duyệt' : '❌ Chưa xác minh'}
            </span>

            <Link href="/profile/verify" className="text-xs font-bold text-blue-600 hover:text-blue-700">
              Chi tiết →
            </Link>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Bắt buộc xác minh thẻ KTX để đi chung</p>
        </div>
      </div>

      {/* Quick Access Grid */}
      <div className="space-y-4">
        <h3 className="text-lg font-black text-slate-900 tracking-tight">Thao tác nhanh</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Link
            href="/trips"
            className="p-6 bg-white rounded-3xl border border-slate-200/80 hover:border-blue-300 shadow-xs hover:shadow-md transition space-y-3 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 font-bold flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
              🔍
            </div>
            <h4 className="font-extrabold text-slate-900 group-hover:text-blue-600 transition">Tìm chuyến đi học →</h4>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Tra cứu danh sách các tài xế cùng đi học từ KTX Khu A/Khu B đến trường của bạn.
            </p>
          </Link>

          <Link
            href="/trips/create"
            className="p-6 bg-white rounded-3xl border border-slate-200/80 hover:border-blue-300 shadow-xs hover:shadow-md transition space-y-3 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
              ➕
            </div>
            <h4 className="font-extrabold text-slate-900 group-hover:text-blue-600 transition">Đăng chuyến đi xe máy →</h4>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Bạn có xe máy và đi học cố định? Đăng chuyến để chở sinh viên cùng tuyến và chia sẻ chi phí.
            </p>
          </Link>

          <Link
            href="/requests"
            className="p-6 bg-white rounded-3xl border border-slate-200/80 hover:border-blue-300 shadow-xs hover:shadow-md transition space-y-3 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 font-bold flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
              📩
            </div>
            <h4 className="font-extrabold text-slate-900 group-hover:text-blue-600 transition">Quản lý Yêu cầu →</h4>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Kiểm tra các yêu cầu ghép xe bạn đã gửi hoặc phản hồi các yêu cầu từ hành khách.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
