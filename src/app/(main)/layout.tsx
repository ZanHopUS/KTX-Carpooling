import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { signOutAction } from '../(auth)/actions';

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let fullName = '';
  let initials = 'SV';
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();
    fullName = profile?.full_name || '';
    initials = fullName
      ? fullName.trim().split(' ').slice(-2).map((w: string) => w[0]?.toUpperCase()).join('')
      : 'SV';
  }

  const navLinks = [
    { href: '/dashboard', label: 'Tổng quan' },
    { href: '/trips',     label: 'Tìm chuyến' },
    { href: '/trips/create', label: 'Đăng chuyến' },
    { href: '/requests',  label: 'Yêu cầu' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 text-slate-800 font-sans selection:bg-blue-100 selection:text-blue-700">
      {/* ── Top Navigation (Glassmorphism matching Homepage) ── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo & Name */}
          <Link href="/dashboard" className="flex items-center gap-3 shrink-0 group no-underline">
            <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-blue-50 border border-blue-100 p-0.5 flex items-center justify-center shrink-0">
              <img
                src="/Logo.png"
                alt="KTX Carpooling Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="hidden sm:block leading-none">
              <span className="font-black text-base tracking-tight text-slate-900 leading-none block group-hover:text-blue-600 transition-colors">
                KTX Carpooling
              </span>
              <span className="text-[10px] font-medium text-slate-500 tracking-normal block mt-0.5">
                ĐHQG-HCM
              </span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50/80 transition"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* User Area */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/profile"
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 transition"
              title="Hồ sơ cá nhân"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-xs">
                {initials}
              </div>
              {fullName && (
                <span className="hidden sm:block text-xs font-bold text-slate-800 max-w-[110px] truncate">
                  {fullName}
                </span>
              )}
            </Link>

            <form action={signOutAction}>
              <button
                type="submit"
                className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 transition"
              >
                Đăng xuất
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* ── Page Content ── */}
      <main className="flex-1 py-6">
        {children}
      </main>

      {/* ── Footer matching Homepage ── */}
      <footer className="bg-slate-900 text-slate-300 py-8 border-t border-slate-800 mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 p-0.5 flex items-center justify-center shrink-0">
                <img src="/Logo.png" alt="KTX Carpooling" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="font-black text-white text-sm tracking-tight block">
                  KTX Carpooling
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Nền tảng chia sẻ chuyến đi sinh viên KTX ĐHQG-HCM
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-5 text-xs font-semibold text-slate-400">
              <Link href="/dashboard" className="hover:text-white transition">Tổng quan</Link>
              <Link href="/trips" className="hover:text-white transition">Tìm chuyến</Link>
              <Link href="/trips/create" className="hover:text-white transition">Đăng chuyến</Link>
              <Link href="/requests" className="hover:text-white transition">Yêu cầu</Link>
              <Link href="/profile" className="hover:text-white transition">Hồ sơ</Link>
            </div>
          </div>

          <div className="text-center text-[11px] text-slate-500">
            © {new Date().getFullYear()} KTX Carpooling. Phát triển dành riêng cho sinh viên Ký túc xá Khu A & Khu B ĐHQG-HCM.
          </div>
        </div>
      </footer>

      {/* ── Mobile Bottom Nav ── */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 border-t bg-white/95 backdrop-blur-md border-slate-200"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="grid grid-cols-4 h-14">
          {[
            { href: '/dashboard', icon: (
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
                </svg>), label: 'Tổng quan' },
            { href: '/trips',   icon: (
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>), label: 'Tìm chuyến' },
            { href: '/requests', icon: (
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>), label: 'Yêu cầu' },
            { href: '/profile', icon: (
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>), label: 'Hồ sơ' },
          ].map((item) => (
            <Link key={item.href} href={item.href}
              className="flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-blue-600 transition-colors">
              {item.icon}
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Bottom padding for mobile nav */}
      <div className="sm:hidden h-14" />
    </div>
  );
}
