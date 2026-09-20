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
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-page)' }}>
      {/* ── Top Navigation ── */}
      <header
        className="sticky top-0 z-50 shadow-sm"
        style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-default)' }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 shrink-0 no-underline mr-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-bold select-none">K</div>
            <div className="hidden sm:block leading-none">
              <p className="text-sm font-bold text-gray-900">KTX Carpooling</p>
              <p className="text-[10px] text-gray-400">ĐHQG-HCM</p>
            </div>
          </Link>

          {/* Nav */}
          <nav className="flex items-center gap-0.5 flex-1 overflow-x-auto scrollbar-none">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors"
                style={{ color: 'var(--text-secondary)' }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* User area */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/profile"
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              title="Hồ sơ của tôi"
            >
              <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold select-none">
                {initials}
              </div>
              {fullName && (
                <span className="hidden sm:block text-xs font-medium text-gray-700 max-w-[110px] truncate">
                  {fullName}
                </span>
              )}
            </Link>

            <form action={signOutAction}>
              <button
                type="submit"
                className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-red-50"
                style={{ color: 'var(--text-muted)' }}
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

      {/* ── Mobile Bottom Nav ── */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 border-t bg-white"
        style={{ borderColor: 'var(--border-default)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
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
              className="flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-blue-600 transition-colors">
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
