'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DORM_AREAS, DORM_BUILDINGS, UNIVERSITIES } from '@/utils/constants';
import { registerAction } from '../actions';

export default function RegisterPage() {
  const [selectedArea, setSelectedArea] = useState<keyof typeof DORM_BUILDINGS>('KHU_B');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      setErrorMsg('Mật khẩu xác nhận không khớp.');
      setLoading(false);
      return;
    }

    const result = await registerAction(formData);
    if (result?.error) {
      setErrorMsg(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-slate-100">
      <div className="w-full max-w-xl p-8 bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 font-bold text-xl mb-1">
            🛵
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Tạo tài khoản KTX Carpooling</h1>
          <p className="text-sm text-slate-400">
            Ứng dụng ghép chuyến xe máy dành riêng cho sinh viên KTX Khu A & Khu B
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm font-medium">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Họ và tên <span className="text-rose-400">*</span>
              </label>
              <input
                name="fullName"
                type="text"
                required
                placeholder="Nguyễn Văn A"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Mã sinh viên
              </label>
              <input
                name="studentId"
                type="text"
                placeholder="21120000"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Email sinh viên <span className="text-rose-400">*</span>
              </label>
              <input
                name="email"
                type="email"
                required
                placeholder="nva@student.hcmus.edu.vn"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Số điện thoại Zalo
              </label>
              <input
                name="phone"
                type="tel"
                placeholder="0901234567"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Trường Đại học <span className="text-rose-400">*</span>
            </label>
            <select
              name="university"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              {UNIVERSITIES.map((uni) => (
                <option key={uni.id} value={uni.id} className="bg-slate-900 text-slate-100">
                  {uni.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Khu KTX đang ở <span className="text-rose-400">*</span>
              </label>
              <select
                name="dormArea"
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value as keyof typeof DORM_BUILDINGS)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              >
                {DORM_AREAS.map((area) => (
                  <option key={area.id} value={area.id} className="bg-slate-900 text-slate-100">
                    {area.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Tòa nhà KTX <span className="text-rose-400">*</span>
              </label>
              <select
                name="dormBuilding"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              >
                {DORM_BUILDINGS[selectedArea]?.map((b) => (
                  <option key={b} value={b} className="bg-slate-900 text-slate-100">
                    Tòa {b}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Vai trò tham gia
            </label>
            <div className="grid grid-cols-3 gap-2">
              <label className="flex items-center justify-center p-2.5 rounded-xl border border-slate-700 bg-slate-800/40 text-xs text-slate-300 cursor-pointer hover:bg-slate-800 transition">
                <input type="radio" name="role" value="DRIVER" className="mr-1.5 accent-blue-500" />
                Tài xế (Có xe)
              </label>
              <label className="flex items-center justify-center p-2.5 rounded-xl border border-slate-700 bg-slate-800/40 text-xs text-slate-300 cursor-pointer hover:bg-slate-800 transition">
                <input type="radio" name="role" value="PASSENGER" className="mr-1.5 accent-blue-500" />
                Hành khách
              </label>
              <label className="flex items-center justify-center p-2.5 rounded-xl border border-slate-700 bg-slate-800/40 text-xs text-slate-300 cursor-pointer hover:bg-slate-800 transition">
                <input type="radio" name="role" value="BOTH" defaultChecked className="mr-1.5 accent-blue-500" />
                Cả hai
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Mật khẩu <span className="text-rose-400">*</span>
              </label>
              <input
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Xác nhận Mật khẩu <span className="text-rose-400">*</span>
              </label>
              <input
                name="confirmPassword"
                type="password"
                required
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition disabled:opacity-50"
          >
            {loading ? 'Đang tạo tài khoản...' : 'Đăng ký Tài khoản KTX Carpooling'}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800/60">
          Đã có tài khoản sinh viên?{' '}
          <Link href="/login" className="font-semibold text-blue-400 hover:underline">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
