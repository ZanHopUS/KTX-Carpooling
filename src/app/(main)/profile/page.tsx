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
    <div className="container mx-auto p-4 sm:p-6 max-w-2xl space-y-6">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
        👤 Hồ sơ Cá nhân Sinh viên
      </h1>

      <div className="p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-blue-500/25">
            {profile?.full_name?.slice(0, 1) || 'S'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{profile?.full_name}</h2>
              {profile?.dorm_card_verified === 'VERIFIED' && <span title="Đã xác minh thẻ KTX">✅</span>}
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400">{profile?.email}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              {profile?.university || 'ĐHQG-HCM'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl text-center text-xs">
          <div>
            <span className="text-slate-400 block mb-1">Điểm uy tín</span>
            <span className="text-base font-extrabold text-amber-500">⭐ {profile?.rating?.toFixed(1) || '5.0'}</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-1">Chuyến hoàn thành</span>
            <span className="text-base font-extrabold text-slate-900 dark:text-white">{profile?.completed_trip_count || 0}</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-1">Chuyến bị hủy</span>
            <span className="text-base font-extrabold text-slate-500">{profile?.cancelled_trip_count || 0}</span>
          </div>
        </div>

        {/* Verification status item */}
        <div className="border-t border-slate-100 dark:border-zinc-800 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">Xác minh thẻ KTX Sinh viên</p>
            <p className="text-xs text-slate-500">
              Trạng thái:{' '}
              <strong className={
                profile?.dorm_card_verified === 'VERIFIED' ? 'text-emerald-600' :
                profile?.dorm_card_verified === 'PENDING' ? 'text-amber-600' : 'text-red-600'
              }>
                {profile?.dorm_card_verified === 'VERIFIED' ? 'Đã xác minh' :
                 profile?.dorm_card_verified === 'PENDING' ? 'Đang chờ duyệt' : 'Chưa xác minh'}
              </strong>
            </p>
          </div>
          <Link
            href="/profile/verify"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow transition"
          >
            {profile?.dorm_card_verified === 'VERIFIED' ? 'Xem thẻ KTX' : 'Tải lên Thẻ KTX ngay'}
          </Link>
        </div>
      </div>
    </div>
  );
}
