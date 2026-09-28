'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [imgSrc, setImgSrc] = useState('/Anhbia.png');

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 font-sans selection:bg-blue-100 selection:text-blue-700">
      {/* ─── 1. Header / Navbar ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo & Name */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-blue-50 border border-blue-100 p-0.5 flex items-center justify-center shrink-0">
              <img
                src="/Logo.png"
                alt="KTX Carpooling Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="font-black text-lg tracking-tight text-slate-900 leading-none block group-hover:text-blue-600 transition-colors">
                KTX Carpooling
              </span>
              <span className="text-[11px] font-medium text-slate-500 tracking-normal block mt-0.5">
                Kết nối sinh viên – Cùng đi xa hơn
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <Link href="/" className="text-blue-600 font-bold border-b-2 border-blue-600 pb-0.5">
              Trang chủ
            </Link>
            <Link href="/trips" className="hover:text-blue-600 transition">
              Tìm chuyến đi
            </Link>
            <Link href="/trips/create" className="hover:text-blue-600 transition">
              Đăng chuyến
            </Link>
            <a href="#how-it-works" className="hover:text-blue-600 transition">
              Hướng dẫn
            </a>
            <a href="#why-us" className="hover:text-blue-600 transition">
              Về chúng tôi
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition"
              aria-label="Thông báo"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>

            <Link
              href="/login"
              className="w-10 h-10 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition"
              aria-label="Tài khoản"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
          </div>
        </div>
      </header>

      {/* ─── 2. Hero Section ──────────────────────────────────────────────────── */}
      <section className="py-12 lg:py-16 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-6">
              {/* Tag Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold">
                <svg className="w-4 h-4 text-blue-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>Nền tảng kết nối sinh viên Ký túc xá ĐHQG-HCM</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.2]">
                Đi học cùng tuyến, <br />
                <span className="text-blue-600">tiết kiệm & an toàn</span> mỗi ngày
              </h1>

              {/* Sub-headline */}
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-xl font-normal">
                KTX Carpooling là nền tảng giúp sinh viên tại Ký túc xá Khu A và Khu B ĐHQG-HCM kết nối với nhau,
                chia sẻ chuyến xe đi học hàng ngày, tiết kiệm chi phí và đảm bảo an toàn trên mọi hành trình.
              </p>

              {/* 4 Feature Badges Grid (100% Clean Vector SVG Icons) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
                {/* Feature 1 */}
                <div className="space-y-1.5">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="font-extrabold text-slate-900 text-sm">Tiết kiệm chi phí</div>
                  <div className="text-xs text-slate-500 leading-snug">Chia sẻ chi phí, giảm gánh nặng tài chính</div>
                </div>

                {/* Feature 2 */}
                <div className="space-y-1.5">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div className="font-extrabold text-slate-900 text-sm">An toàn, đáng tin cậy</div>
                  <div className="text-xs text-slate-500 leading-snug">Thông tin minh bạch, có xác thực sinh viên</div>
                </div>

                {/* Feature 3 */}
                <div className="space-y-1.5">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="font-extrabold text-slate-900 text-sm">Kết nối cộng đồng</div>
                  <div className="text-xs text-slate-500 leading-snug">Gặp gỡ, làm quen với nhiều bạn mới</div>
                </div>

                {/* Feature 4 */}
                <div className="space-y-1.5">
                  <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="font-extrabold text-slate-900 text-sm">Linh hoạt, tiện lợi</div>
                  <div className="text-xs text-slate-500 leading-snug">Dễ dàng tìm hoặc đăng chuyến phù hợp</div>
                </div>
              </div>
            </div>

            {/* Right Photo Frame */}
            <div className="lg:col-span-6 relative flex justify-center items-center">
              <img
                src={imgSrc}
                onError={() => {
                  if (imgSrc === '/Anhbia.png') {
                    setImgSrc('/students-hero.jpg');
                  }
                }}
                alt="Sinh viên KTX ĐHQG-HCM"
                className="w-full h-auto max-w-xl object-contain drop-shadow-sm"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3. Why Choose Us Section ─────────────────────────────────────────── */}
      <section id="why-us" className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="p-8 sm:p-12 rounded-3xl bg-blue-50/60 border border-blue-100 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Title & Intro */}
              <div className="lg:col-span-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Tại sao chọn chúng tôi</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                  Giải pháp di chuyển tối ưu cho sinh viên KTX
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Thiết kế dành riêng cho cộng đồng sinh viên ĐHQG-HCM ở Ký túc xá Khu A và Khu B.
                </p>
              </div>

              {/* 3 Value Cards */}
              <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-5">
                {/* Card 1 */}
                <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-3 hover:shadow-md transition">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-base">Tuyến đường tối ưu</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Thuật toán thông minh tự động tìm tuyến đường ngắn nhất giữa các điểm đón trong KTX và các trường đại học.
                  </p>
                </div>

                {/* Card 2 */}
                <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-3 hover:shadow-md transition">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-base">Cộng đồng văn minh</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Tất cả người dùng đều là sinh viên KTX ĐHQG-HCM, lịch sự, đúng giờ và sẵn sàng chia sẻ kinh nghiệm học tập.
                  </p>
                </div>

                {/* Card 3 */}
                <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-3 hover:shadow-md transition">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-base">Hỗ trợ nhanh chóng</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Đội ngũ hỗ trợ sinh viên 24/7, xử lý nhanh mọi sự cố phát sinh trong quá trình đi chung xe.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4. How It Works Section ──────────────────────────────────────────── */}
      <section id="how-it-works" className="py-14 bg-slate-50/70 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
              <span>Quy trình sử dụng</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              3 bước đơn giản để bắt đầu chia sẻ chuyến đi
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm relative space-y-4">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-base">
                1
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg">Đăng ký & Xác thực</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Tạo tài khoản bằng Email sinh viên hoặc Mã số sinh viên để xác thực danh tính KTX Khu A hoặc Khu B.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm relative space-y-4">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-base">
                2
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg">Tìm hoặc Đăng chuyến</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Nhập điểm đi (Khu A/B KTX), điểm đến (Trường đại học) và thời gian xuất phát mong muốn.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm relative space-y-4">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-base">
                3
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg">Đi chung & Chia sẻ</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Gặp nhau tại điểm hẹn ở KTX, di chuyển an toàn đến trường và chia sẻ chi phí trực tiếp.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 5. Footer ───────────────────────────────────────────────────────── */}
      <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-8 border-b border-slate-800">
            {/* Brand Footer */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 p-0.5 flex items-center justify-center shrink-0">
                <img src="/Logo.png" alt="KTX Carpooling" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="font-black text-white text-base tracking-tight block">
                  KTX Carpooling
                </span>
                <span className="text-xs text-slate-400 block">
                  Nền tảng chia sẻ chuyến đi sinh viên KTX ĐHQG-HCM
                </span>
              </div>
            </div>

            {/* Footer Links */}
            <div className="flex flex-wrap gap-6 text-xs font-semibold text-slate-400">
              <Link href="/trips" className="hover:text-white transition">Tìm chuyến</Link>
              <Link href="/trips/create" className="hover:text-white transition">Đăng chuyến</Link>
              <a href="#how-it-works" className="hover:text-white transition">Hướng dẫn</a>
              <a href="#why-us" className="hover:text-white transition">Về chúng tôi</a>
            </div>
          </div>

          <div className="text-center text-xs text-slate-500">
            © {new Date().getFullYear()} KTX Carpooling. Phát triển dành riêng cho sinh viên Ký túc xá ĐHQG-HCM.
          </div>
        </div>
      </footer>
    </div>
  );
}
