import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import AdminVerificationsClient from './AdminVerificationsClient';
import { UserProfile } from '@/types/database';

export default async function AdminVerificationsPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login');
  }

  // Fetch profiles with PENDING dorm_card_verified
  const { data: pendingData } = await supabase
    .from('profiles')
    .select('*')
    .eq('dorm_card_verified', 'PENDING')
    .order('created_at', { ascending: false });

  const pendingUsers = (pendingData as UserProfile[]) || [];

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          🛡️ Admin - Duyệt Hồ sơ Thẻ KTX
        </h1>
        <p className="text-sm text-slate-500 dark:text-zinc-400">
          Danh sách các tài khoản sinh viên đang chờ ban quản trị phê duyệt hình ảnh thẻ KTX
        </p>
      </div>

      <AdminVerificationsClient pendingUsers={pendingUsers} />
    </div>
  );
}
