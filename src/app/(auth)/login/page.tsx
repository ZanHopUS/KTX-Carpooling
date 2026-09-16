'use client';

import { useState } from 'react';
import Link from 'next/link';
import { loginAction } from '../actions';

export default function LoginPage() {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await loginAction(formData);

    if (result?.error) {
      setErrorMsg(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-slate-100">
      <div className="w-full max-w-md p-8 bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 font-bold text-2xl mb-1">
            🛵
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Đăng nhập KTX Carpooling</h1>
          <p className="text-sm text-slate-400">
            Ứng dụng ghép chuyến xe máy dành riêng cho sinh viên KTX
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm font-medium">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Email sinh viên
            </label>
            <input
              name="email"
              type="email"
              required
              placeholder="sinhvien@student.hcmus.edu.vn"
              className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Mật khẩu
            </label>
            <input
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition disabled:opacity-50 text-sm"
          >
            {loading ? 'Đang xác thực...' : 'Đăng nhập vào Hệ thống'}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center text-xs text-slate-400 pt-3 border-t border-slate-800/60">
          Chưa có tài khoản?{' '}
          <Link href="/register" className="font-semibold text-blue-400 hover:underline">
            Tạo tài khoản ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
