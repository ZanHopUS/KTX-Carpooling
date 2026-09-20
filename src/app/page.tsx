'use client';

import { useState } from 'react';
import Link from 'next/link';

/* ═══════════════════════════════════════════════════
   HOMEPAGE — KTX Carpooling
   Design: Human-centered / Student Service Platform
═══════════════════════════════════════════════════ */

// ─── Static Data ──────────────────────────────────────────────────────────────

const UNIVERSITIES = [
  { id: 'HCMUS', short: 'HCMUS', full: 'Trường ĐH Khoa học Tự nhiên', icon: '🔬', campus: 'Linh Trung, Thủ Đức' },
  { id: 'HCMUT', short: 'HCMUT', full: 'Trường ĐH Bách khoa',         icon: '⚙️', campus: 'Linh Trung, Thủ Đức' },
  { id: 'UIT',   short: 'UIT',   full: 'Trường ĐH Công nghệ Thông tin',icon: '💻', campus: 'Linh Trung, Thủ Đức' },
  { id: 'USSH',  short: 'USSH',  full: 'Trường ĐH Khoa học Xã hội & Nhân văn', icon: '📖', campus: 'Linh Trung, Thủ Đức' },
  { id: 'IU',    short: 'IU',    full: 'Trường ĐH Quốc Tế',            icon: '🌐', campus: 'Linh Trung, Thủ Đức' },
  { id: 'UEL',   short: 'UEL',   full: 'Trường ĐH Kinh tế – Luật',     icon: '⚖️', campus: 'Linh Trung, Thủ Đức' },
];

const BENEFITS = [
  {
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    title: 'Kết nối sinh viên cùng tuyến',
    desc: 'Thuật toán tự động ghép những sinh viên ở cùng khu KTX, đi cùng trường và cùng giờ học. Độ lệch giờ đón tối đa 5 phút.',
  },
  {
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <rect x="2" y="4" width="20" height="16" rx="2"/><path d="M7 15h0M2 9.5h20"/>
      </svg>
    ),
    title: 'Xác minh sinh viên KTX',
    desc: 'Chỉ sinh viên đang ở tại KTX Khu A hoặc Khu B có thẻ KTX đã được xác minh mới có thể đăng chuyến hoặc gửi yêu cầu.',
  },
  {
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
    title: 'Chia sẻ chi phí minh bạch',
    desc: 'Chi phí đóng góp được tính tự động theo khoảng cách thực tế (2.000đ/km). Thanh toán trực tiếp giữa hai người.',
  },
  {
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
    title: 'Đánh giá và hồ sơ rõ ràng',
    desc: 'Mỗi tài xế có điểm uy tín, số chuyến hoàn thành và nhận xét từ hành khách. Bạn biết mình đi với ai trước khi xuất phát.',
  },
];

const STEPS = [
  { num: '01', title: 'Đăng ký tài khoản sinh viên', desc: 'Tạo tài khoản bằng email trường và xác minh thẻ KTX để dùng đầy đủ tính năng.', color: '#2563eb' },
  { num: '02', title: 'Tìm hoặc đăng một chuyến đi', desc: 'Tìm chuyến theo ngày, giờ và trường đến — hoặc tự đăng chuyến nếu bạn có xe.', color: '#ea580c' },
  { num: '03', title: 'Gửi yêu cầu ghép chuyến', desc: 'Chọn chuyến phù hợp nhất và gửi yêu cầu. Tài xế sẽ xem xét và phản hồi.', color: '#16a34a' },
  { num: '04', title: 'Xác nhận và lên đường', desc: 'Sau khi tài xế chấp nhận, hai bên nhắn tin trao đổi điểm đón rồi cùng đến trường.', color: '#7c3aed' },
];

// ─── Header ───────────────────────────────────────────────────────────────────

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-default)' }}
      className="sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 no-underline">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-base font-bold select-none">K</div>
          <div className="leading-none">
            <p className="text-sm font-700 text-gray-900 font-bold">KTX Carpooling</p>
            <p className="text-[10px] text-gray-400">ĐHQG-HCM</p>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-0.5 text-sm">
          <Link href="/trips" className="px-3 py-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors font-medium">
            Tìm chuyến đi
          </Link>
          <Link href="/trips/create" className="px-3 py-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors font-medium">
            Đăng chuyến
          </Link>
          <a href="#how-it-works" className="px-3 py-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors font-medium">
            Hướng dẫn
          </a>
        </nav>

        {/* Auth — Desktop */}
        <div className="hidden md:flex items-center gap-2">
          <Link href="/login" className="btn btn-ghost btn-sm">Đăng nhập</Link>
          <Link href="/register" className="btn btn-primary btn-sm">Đăng ký</Link>
        </div>

        {/* Hamburger — Mobile */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Mở menu"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {menuOpen
              ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
              : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
            }
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{ borderTop: '1px solid var(--border-default)', background: 'var(--bg-surface)' }}
          className="md:hidden px-4 py-3 space-y-1">
          <Link href="/trips" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100">Tìm chuyến đi</Link>
          <Link href="/trips/create" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100">Đăng chuyến đi</Link>
          <a href="#how-it-works" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100">Hướng dẫn</a>
          <div className="pt-2 flex gap-2" style={{ borderTop: '1px solid var(--border-default)' }}>
            <Link href="/login" onClick={() => setMenuOpen(false)} className="btn btn-ghost flex-1 text-center">Đăng nhập</Link>
            <Link href="/register" onClick={() => setMenuOpen(false)} className="btn btn-primary flex-1 text-center">Đăng ký</Link>
          </div>
        </div>
      )}
    </header>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section className="bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">

        {/* Text */}
        <div className="space-y-5 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)', border: '1px solid var(--color-primary-border)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block shrink-0"></span>
            Kết nối sinh viên KTX Khu A & Khu B
          </div>

          <h1 className="text-gray-900">
            Đi học cùng tuyến đường,{' '}
            <span style={{ color: 'var(--color-primary)' }}>tiết kiệm hơn</span>{' '}
            mỗi ngày
          </h1>

          <p className="text-gray-500 text-base leading-relaxed">
            Kết nối sinh viên ký túc xá có xe máy với những bạn cùng hướng đến trường.
            Tìm chuyến, đăng chuyến và chia sẻ chi phí một cách thuận tiện, minh bạch và an toàn.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <Link href="/trips" className="btn btn-primary btn-lg">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              Tìm chuyến đi
            </Link>
            <Link href="/trips/create" className="btn btn-ghost btn-lg">
              Đăng chuyến của tôi
            </Link>
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-2 pt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <svg width="13" height="13" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
              Chỉ sinh viên đã xác minh KTX
            </span>
            <span className="flex items-center gap-1.5">
              <svg width="13" height="13" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
              6 trường đại học thành viên
            </span>
            <span className="flex items-center gap-1.5">
              <svg width="13" height="13" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
              2.000đ/km, tối thiểu 5.000đ
            </span>
          </div>
        </div>

        {/* Illustration */}
        <div className="hidden md:block">
          <div className="relative">
            <img
              src="/hero-illustration.jpg"
              alt="Sinh viên đi học cùng xe máy từ KTX"
              className="w-full rounded-2xl object-cover"
              style={{ aspectRatio: '4/3', border: '1px solid var(--border-default)' }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Quick Search Form ────────────────────────────────────────────────────────

function QuickSearchSection() {
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <section className="bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-gray-900 text-lg font-semibold mb-5 text-center">Tìm chuyến đi nhanh</h2>

          <form action="/trips" method="get"
            className="space-y-3 p-5 rounded-2xl border border-gray-200 bg-gray-50">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="form-label" htmlFor="qs-university">Trường đại học đến</label>
                <select id="qs-university" name="university" className="form-select">
                  <option value="">Tất cả các trường</option>
                  {UNIVERSITIES.map(u => (
                    <option key={u.id} value={u.id}>{u.short} – {u.full.replace('Trường ĐH ', '')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label" htmlFor="qs-date">Ngày đi</label>
                <input id="qs-date" name="date" type="date" defaultValue={todayStr} className="form-input" />
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              Tìm chuyến đi
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

// ─── Universities Grid ────────────────────────────────────────────────────────

function UniversitiesSection() {
  return (
    <section style={{ background: 'var(--bg-subtle)' }} className="border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h2 className="text-gray-900">Chuyến đi theo trường đại học</h2>
            <p className="text-gray-500 text-sm mt-1">Chọn trường của bạn để xem các chuyến đang mở</p>
          </div>
          <Link href="/trips" className="text-sm font-semibold text-blue-600 hover:text-blue-700 shrink-0">
            Xem tất cả chuyến →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {UNIVERSITIES.map((u) => (
            <Link
              key={u.id}
              href={`/trips?university=${u.id}`}
              className="card card-hover flex flex-col items-center gap-2 p-4 text-center transition-colors"
            >
              <span className="text-2xl leading-none">{u.icon}</span>
              <span className="text-sm font-bold text-gray-800">{u.short}</span>
              <span className="text-[11px] text-gray-500 leading-tight">{u.full.replace('Trường ĐH ', '').replace('Trường ', '')}</span>
              <span className="text-xs text-blue-600 font-medium mt-1">Xem chuyến →</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Benefits ────────────────────────────────────────────────────────────────

function BenefitsSection() {
  return (
    <section className="bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 space-y-10">
        <div className="text-center max-w-lg mx-auto space-y-2">
          <h2 className="text-gray-900">Vì sao sinh viên tin dùng?</h2>
          <p className="text-gray-500 text-sm">Xây dựng dành riêng cho cộng đồng sinh viên ký túc xá ĐHQG-HCM</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {BENEFITS.map((b, i) => (
            <div key={i} className="p-5 space-y-3 rounded-xl border border-gray-200 bg-gray-50 hover:border-blue-200 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-600 shadow-sm">
                {b.icon}
              </div>
              <h3 className="text-gray-900 text-sm">{b.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────

function HowItWorksSection() {
  return (
    <section id="how-it-works" style={{ background: 'var(--bg-subtle)' }} className="border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 space-y-10">
        <div className="text-center max-w-lg mx-auto space-y-2">
          <h2 className="text-gray-900">Bắt đầu chỉ với 4 bước</h2>
          <p className="text-gray-500 text-sm">Đơn giản, nhanh chóng và miễn phí đăng ký</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* Connector (desktop) */}
          <div className="hidden lg:block absolute top-[22px] left-[calc(12.5%+1rem)] right-[calc(12.5%+1rem)] h-px bg-gray-200 z-0" />

          {STEPS.map((s, i) => (
            <div key={i} className="relative z-10 flex flex-col items-center text-center gap-3">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md shrink-0"
                style={{ background: s.color }}
              >
                {s.num}
              </div>
              <h3 className="text-gray-900 text-sm font-semibold">{s.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link href="/register" className="btn btn-primary">
            Tạo tài khoản — Miễn phí
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Trust Section ────────────────────────────────────────────────────────────

function TrustSection() {
  const TRUST_ITEMS = [
    { icon: '🪪', title: 'Xác minh thông tin sinh viên', desc: 'Mỗi tài khoản phải đính kèm thẻ KTX hợp lệ và được ban quản trị xét duyệt trước khi sử dụng.' },
    { icon: '📋', title: 'Thông tin chuyến đi rõ ràng', desc: 'Điểm đón, điểm đến, giờ xuất phát và mức đóng góp được hiển thị minh bạch trước khi gửi yêu cầu.' },
    { icon: '⭐', title: 'Đánh giá sau mỗi chuyến', desc: 'Hành khách và tài xế đều có thể đánh giá nhau sau khi hoàn thành chuyến, giúp duy trì chất lượng cộng đồng.' },
    { icon: '🚩', title: 'Báo cáo sự cố', desc: 'Nếu có vấn đề phát sinh, bạn có thể báo cáo và ban quản trị sẽ xem xét xử lý theo quy trình.' },
  ];

  return (
    <section className="bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 space-y-10">
        <div className="text-center max-w-lg mx-auto space-y-2">
          <h2 className="text-gray-900">Minh bạch và có trách nhiệm</h2>
          <p className="text-gray-500 text-sm">
            Chúng tôi không đảm bảo tuyệt đối, nhưng cung cấp đầy đủ công cụ để bạn ra quyết định có thông tin.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {TRUST_ITEMS.map((item, i) => (
            <div key={i} className="flex gap-4 p-5 rounded-xl border border-gray-200 bg-gray-50">
              <div className="text-xl shrink-0 mt-0.5">{item.icon}</div>
              <div className="space-y-1">
                <h3 className="text-gray-900 text-sm">{item.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Stats Bar ───────────────────────────────────────────────────────────────

function StatsBar() {
  return (
    <section style={{ background: 'var(--bg-subtle)' }} className="border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { label: 'Khu vực phục vụ',      value: 'KTX A & B' },
            { label: 'Trường đại học',         value: '6 trường' },
            { label: 'Chi phí tham khảo',      value: '2.000đ/km' },
            { label: 'Yêu cầu xác minh',       value: 'Thẻ KTX' },
          ].map((s, i) => (
            <div key={i}>
              <p className="text-xl font-bold text-blue-600">{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Footer ──────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pb-8 border-b border-gray-800">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center text-white text-xs font-bold">K</div>
              <span className="text-white font-semibold text-sm">KTX Carpooling</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Nền tảng ghép xe máy dành riêng cho sinh viên ký túc xá ĐHQG-HCM.<br/>
              Phát triển bởi sinh viên, phục vụ cộng đồng sinh viên.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Dịch vụ</p>
            <ul className="space-y-2 text-xs">
              {[
                ['Tìm chuyến đi', '/trips'],
                ['Đăng chuyến đi', '/trips/create'],
                ['Yêu cầu ghép chuyến', '/requests'],
                ['Xác minh thẻ KTX', '/profile/verify'],
              ].map(([label, href]) => (
                <li key={href}><Link href={href} className="hover:text-white transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Trường phục vụ</p>
            <div className="flex flex-wrap gap-2">
              {UNIVERSITIES.map(u => (
                <span key={u.id} className="px-2.5 py-1 text-xs rounded bg-gray-800 text-gray-400">{u.short}</span>
              ))}
            </div>
            <p className="text-xs text-gray-600 mt-2">KTX Khu A & Khu B – Linh Trung, TP. Thủ Đức</p>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row justify-between gap-2 text-xs text-gray-600">
          <p>© 2026 KTX Carpooling – Dự án sinh viên phi lợi nhuận</p>
          <p>Chỉ dành cho sinh viên KTX ĐHQG-HCM đã xác minh</p>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <QuickSearchSection />
        <UniversitiesSection />
        <BenefitsSection />
        <HowItWorksSection />
        <TrustSection />
        <StatsBar />
      </main>
      <Footer />
    </div>
  );
}
