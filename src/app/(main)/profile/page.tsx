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
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
        Hồ sơ cá nhân
      </h1>

      <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-2xl">
            {profile?.full_name?.slice(0, 1) || 'S'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900">{profile?.full_name}</h2>
              {profile?.dorm_card_verified === 'VERIFIED' && (
                <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                  ✓ Đã xác minh
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">{profile?.email}</p>
            <span className="inline-block mt-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-100">
              {profile?.university || 'ĐHQG-HCM'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 p-4 bg-gray-50 rounded-xl text-center text-xs">
          <div>
            <span className="text-gray-500 block mb-1">Điểm uy tín</span>
            <span className="text-base font-bold text-amber-600">⭐ {profile?.rating?.toFixed(1) || '5.0'}</span>
          </div>
          <div>
            <span className="text-gray-500 block mb-1">Chuyến hoàn thành</span>
            <span className="text-base font-bold text-gray-900">{profile?.completed_trip_count || 0}</span>
          </div>
          <div>
            <span className="text-gray-500 block mb-1">Chuyến bị hủy</span>
            <span className="text-base font-bold text-gray-500">{profile?.cancelled_trip_count || 0}</span>
          </div>
        </div>

        {/* Verification status item */}
        <div className="border-t border-gray-100 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <p className="text-sm font-semibold text-gray-900">Xác minh thẻ KTX Sinh viên</p>
            <p className="text-xs text-gray-500 mt-0.5">
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
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
          >
            {profile?.dorm_card_verified === 'VERIFIED' ? 'Xem lại thông tin' : 'Tải lên Thẻ KTX'}
          </Link>
        </div>
      </div>
    </div>
  );
}
