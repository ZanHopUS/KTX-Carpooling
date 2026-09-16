import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-lg font-bold shadow-lg shadow-blue-500/25 group-hover:scale-105 transition">
              🛵
            </div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-blue-300 bg-clip-text text-transparent">
              KTX Carpooling
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
            <Link href="/trips" className="hover:text-blue-400 transition">Tìm chuyến đi</Link>
            <Link href="/trips/create" className="hover:text-blue-400 transition">Đăng chuyến đi</Link>
            <Link href="/profile/verify" className="hover:text-blue-400 transition">Xác minh thẻ KTX</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition rounded-xl hover:bg-slate-800/60"
            >
              Đăng nhập
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl shadow-lg shadow-blue-600/30 transition hover:scale-105"
            >
              Đăng ký ngay
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 px-4 overflow-hidden">
          {/* Background Ambient Glows */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-600/20 blur-[140px] pointer-events-none rounded-full" />
          <div className="absolute top-1/3 left-1/3 w-[400px] h-[250px] bg-indigo-600/15 blur-[120px] pointer-events-none rounded-full" />

          <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold tracking-wide backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              Nền tảng ghép xe máy sinh viên KTX ĐHQG-HCM
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.15]">
              Ghép chuyến xe máy đi học{' '}
              <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                Tiết kiệm & An toàn
              </span>
            </h1>

            {/* Description */}
            <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
              Giải pháp kết nối sinh viên ở KTX Khu A & Khu B có xe máy và sinh viên có nhu cầu đi học cùng tuyến đường đến các trường đại học thành viên.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                href="/register"
                className="w-full sm:w-auto px-8 py-3.5 text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl shadow-xl shadow-blue-600/30 transition hover:scale-105 flex items-center justify-center gap-2"
              >
                <span>Tạo tài khoản sinh viên</span>
                <span className="text-lg">→</span>
              </Link>
              <Link
                href="/trips"
                className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded-2xl transition flex items-center justify-center gap-2"
              >
                🔍 Tìm chuyến đi ngay
              </Link>
            </div>

            {/* Dorm & University Pills */}
            <div className="pt-8 border-t border-slate-800/80 max-w-3xl mx-auto flex flex-wrap justify-center items-center gap-2 text-xs font-medium text-slate-400">
              <span className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">🏢 KTX Khu A</span>
              <span className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">🏢 KTX Khu B</span>
              <span className="text-slate-600">➔</span>
              <span className="px-3 py-1 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-400">HCMUS</span>
              <span className="px-3 py-1 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-400">HCMUT</span>
              <span className="px-3 py-1 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-400">UIT</span>
              <span className="px-3 py-1 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-400">USSH</span>
              <span className="px-3 py-1 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-400">IU</span>
              <span className="px-3 py-1 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-400">UEL</span>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-slate-900/40 border-y border-slate-800/60 px-4">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center space-y-3">
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Vì sao sinh viên chọn KTX Carpooling?
              </h2>
              <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
                Thiết kế tối ưu cho thói quen di chuyển đi học hàng ngày của cư dân ký túc xá.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 hover:border-blue-500/50 transition group">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center text-xl font-bold group-hover:scale-110 transition">
                  🪪
                </div>
                <h3 className="text-lg font-bold text-white">Xác minh thẻ KTX an toàn</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Chỉ sinh viên thực sự sống tại KTX đã qua xác minh thẻ mới được đăng và nhận chuyến, đảm bảo môi trường tin cậy 100%.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 hover:border-blue-500/50 transition group">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center text-xl font-bold group-hover:scale-110 transition">
                  🎯
                </div>
                <h3 className="text-lg font-bold text-white">Thuật toán Matching chuẩn</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Tự động ghép người cùng trường, cùng cơ sở và trùng giờ đón (độ lệch $\le 5$ phút). Tích hợp tìm kiếm AI ngôn ngữ tự nhiên.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 hover:border-blue-500/50 transition group">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center text-xl font-bold group-hover:scale-110 transition">
                  💵
                </div>
                <h3 className="text-lg font-bold text-white">Chi phí chia sẻ minh bạch</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Giá tham khảo từ 2.000đ/km (tối thiểu 5.000đ). Thanh toán trực tiếp giữa hai bên bằng tiền mặt hoặc chuyển khoản ngân hàng.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-800 text-center text-xs text-slate-500 space-y-2">
        <p className="font-semibold text-slate-400">KTX Carpooling — Ứng dụng ghép chuyến xe máy cho sinh viên KTX</p>
        <p>© 2026 KTX Carpooling. Phát triển dành riêng cho sinh viên KTX ĐHQG-HCM.</p>
      </footer>
    </div>
  );
}
