import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { signOutAction } from '../(auth)/actions';

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let fullName = '';
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, dorm_card_verified')
      .eq('id', user.id)
      .single();
    fullName = profile?.full_name || '';
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/80 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 group shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-sm font-bold shadow group-hover:scale-105 transition">
              🛵
            </div>
            <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white hidden sm:block">
              KTX Carpooling
            </span>
          </Link>

          {/* Nav Links */}
          <nav className="flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-zinc-400">
            <Link
              href="/dashboard"
              className="px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white transition"
            >
              📊 Tổng quan
            </Link>
            <Link
              href="/trips"
              className="px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white transition"
            >
              🔍 Tìm chuyến
            </Link>
            <Link
              href="/trips/create"
              className="px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white transition"
            >
              ➕ Đăng chuyến
            </Link>
            <Link
              href="/requests"
              className="px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white transition"
            >
              📥 Yêu cầu
            </Link>
          </nav>

          {/* User Area */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/profile"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 transition text-xs font-bold text-slate-700 dark:text-zinc-300"
            >
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-black">
                {fullName?.slice(0, 1) || 'S'}
              </span>
              <span className="max-w-[100px] truncate">{fullName || 'Hồ sơ'}</span>
            </Link>
            <form action={signOutAction}>
              <button
                type="submit"
                className="px-3 py-1.5 text-xs font-bold text-slate-500 dark:text-zinc-400 hover:text-red-500 transition rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                Đăng xuất
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-6">
        {children}
      </main>
    </div>
  );
}
