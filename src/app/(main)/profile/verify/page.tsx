import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import VerifyClient from './VerifyClient';
import { UserProfile } from '@/types/database';

export default async function ProfileVerifyPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) {
    redirect('/login');
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          🪪 Xác minh Thẻ KTX Sinh viên
        </h1>
        <p className="text-sm text-slate-500 dark:text-zinc-400">
          Xác minh danh tính cư dân KTX Khu A & Khu B để đảm bảo an toàn tuyệt đối khi ghép chuyến xe máy
        </p>
      </div>

      <VerifyClient userProfile={profile as UserProfile} />
    </div>
  );
}
