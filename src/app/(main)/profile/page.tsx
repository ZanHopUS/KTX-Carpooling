import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { UserProfile } from '@/types/database';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login');
  }

  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const profile = (profileData as UserProfile) || null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
          <span>👤 Hồ sơ sinh viên</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Hồ sơ cá nhân
        </h1>
      </div>

      <div className="p-6 sm:p-8 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-md shadow-blue-500/20 shrink-0">
            {profile?.full_name?.slice(0, 1) || 'S'}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-black text-slate-900">{profile?.full_name}</h2>
              {profile?.dorm_card_verified === 'VERIFIED' && (
                <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  ✓ Đã xác minh
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium">{profile?.email}</p>
            <span className="inline-block mt-1 px-3 py-0.5 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-100">
              {profile?.university || 'ĐHQG-HCM'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 p-5 bg-slate-50/80 rounded-2xl text-center text-xs border border-slate-100">
          <div>
            <span className="text-slate-500 font-medium block mb-1">Điểm uy tín</span>
            <span className="text-base sm:text-lg font-black text-amber-600">⭐ {profile?.rating?.toFixed(1) || '5.0'}</span>
          </div>
          <div>
            <span className="text-slate-500 font-medium block mb-1">Chuyến hoàn thành</span>
            <span className="text-base sm:text-lg font-black text-slate-900">{profile?.completed_trip_count || 0}</span>
          </div>
          <div>
            <span className="text-slate-500 font-medium block mb-1">Chuyến bị hủy</span>
            <span className="text-base sm:text-lg font-black text-slate-400">{profile?.cancelled_trip_count || 0}</span>
          </div>
        </div>

        {/* Verification status item */}
        <div className="border-t border-slate-100 pt-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p className="text-sm font-extrabold text-slate-900">Xác minh thẻ KTX Sinh viên</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Trạng thái:{' '}
              <strong className={
                profile?.dorm_card_verified === 'VERIFIED' ? 'text-emerald-700' :
                profile?.dorm_card_verified === 'PENDING' ? 'text-amber-700' : 'text-red-700'
              }>
                {profile?.dorm_card_verified === 'VERIFIED' ? 'Đã xác minh' :
                 profile?.dorm_card_verified === 'PENDING' ? 'Đang chờ xét duyệt' : 'Chưa xác minh'}
              </strong>
            </p>
          </div>
          <Link
            href="/profile/verify"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition"
          >
            {profile?.dorm_card_verified === 'VERIFIED' ? 'Xem lại thông tin' : 'Tải lên Thẻ KTX'}
          </Link>
        </div>
      </div>
    </div>
  );
}
