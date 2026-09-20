'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DORM_AREAS, DORM_BUILDINGS, UNIVERSITIES } from '@/utils/constants';
import { registerAction, verifyOtpAction, resendOtpAction } from '../actions';

export default function RegisterPage() {
  const [selectedArea, setSelectedArea] = useState<keyof typeof DORM_BUILDINGS>('KHU_B');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // OTP Verification state
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);
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
    setLoading(false);

    if (result?.error) {
      setErrorMsg(result.error);
    } else if (result?.requireOtp && result?.email) {
      setRegisteredEmail(result.email);
      setShowOtpModal(true);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setOtpLoading(true);

    try {
      await verifyOtpAction(registeredEmail, otpToken);
      setOtpLoading(false);
    } catch (err: any) {
      if (err?.digest?.startsWith('NEXT_REDIRECT')) {
        return;
      }
      setOtpLoading(false);
      setErrorMsg('Đã xảy ra lỗi. Vui lòng thử lại.');
    }
  }

  async function handleResendOtp() {
    setErrorMsg(null);
    setInfoMsg(null);
    const result = await resendOtpAction(registeredEmail);
    if (result?.error) {
      setErrorMsg(result.error);
    } else {
      setInfoMsg(result.message || 'Mã OTP mới đã được gửi về mail!');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 text-gray-900 py-10">
      <div className="w-full max-w-xl p-6 sm:p-8 bg-white rounded-2xl border border-gray-200 shadow-sm space-y-6">
        {/* OTP Modal Overlay */}
        {showOtpModal ? (
          <div className="space-y-6 py-2">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 font-bold text-xl mb-1">
                ✉️
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Xác minh Email Sinh viên</h2>
              <p className="text-sm text-gray-600 max-w-md mx-auto">
                Hệ thống đã gửi mã xác minh **OTP** đến hòm thư sinh viên của bạn:
              </p>
              <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 font-mono font-semibold text-sm inline-block">
                {registeredEmail}
              </div>

              {/* Notice Box */}
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-left space-y-1.5 text-xs text-amber-900">
                <div className="font-semibold flex items-center gap-1.5 text-amber-800">
                  <span>💡</span> Lưu ý quan trọng:
                </div>
                <p>
                  Vui lòng kiểm tra kỹ cả thư mục <b>Hộp thư đến (Inbox)</b> và <b>Thư rác (Junk/Spam)</b> trong Webmail/Outlook trường của bạn.
                </p>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium text-center">
                {errorMsg}
              </div>
            )}

            {infoMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium text-center">
                {infoMsg}
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-4 max-w-sm mx-auto">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider text-center mb-2">
                  Nhập mã OTP (6 chữ số)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpToken}
                  onChange={(e) => setOtpToken(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  required
                  className="w-full text-center tracking-[0.5em] text-2xl font-mono py-3 rounded-xl bg-gray-50 border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={otpLoading || otpToken.length !== 6}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-sm transition disabled:opacity-50 text-sm flex items-center justify-center gap-2"
              >
                {otpLoading ? 'Đang xác minh OTP...' : 'Xác minh & Kích hoạt tài khoản'}
              </button>
            </form>

            <div className="flex justify-between items-center text-xs text-gray-500 pt-4 border-t border-gray-100">
              <button
                onClick={handleResendOtp}
                type="button"
                className="text-blue-600 hover:underline font-semibold"
              >
                Gửi lại mã OTP
              </button>
              <button
                onClick={() => setShowOtpModal(false)}
                type="button"
                className="text-gray-500 hover:text-gray-700"
              >
                Quay lại đăng ký
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="text-center space-y-2">
              <Link href="/" className="inline-flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                  K
                </div>
                <div className="text-left">
                  <div className="font-bold text-gray-900 leading-tight">KTX Carpooling</div>
                  <div className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">ĐHQG-HCM</div>
                </div>
              </Link>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Đăng ký tài khoản sinh viên</h1>
              <p className="text-sm text-gray-500">
                Tạo tài khoản để ghép chuyến đi học an toàn và tiết kiệm
              </p>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-center gap-2">
                <svg className="w-5 h-5 flex-shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="fullName"
                    type="text"
                    required
                    placeholder="Nguyễn Văn A"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-300 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Mã sinh viên
                  </label>
                  <input
                    name="studentId"
                    type="text"
                    placeholder="21120000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-300 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Email sinh viên <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="nva@student.hcmus.edu.vn"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-300 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Số điện thoại / Zalo
                  </label>
                  <input
                    name="phone"
                    type="tel"
                    placeholder="0901234567"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-300 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Trường Đại học <span className="text-red-500">*</span>
                </label>
                <select
                  name="university"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-300 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                >
                  {UNIVERSITIES.map((uni) => (
                    <option key={uni.id} value={uni.id}>
                      {uni.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Khu KTX đang ở <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="dormArea"
                    value={selectedArea}
                    onChange={(e) => setSelectedArea(e.target.value as keyof typeof DORM_BUILDINGS)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-300 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                  >
                    {DORM_AREAS.map((area) => (
                      <option key={area.id} value={area.id}>
                        {area.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Tòa nhà KTX <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="dormBuilding"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-300 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                  >
                    {DORM_BUILDINGS[selectedArea]?.map((b) => (
                      <option key={b} value={b}>
                        Tòa {b}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Nhu cầu tham gia
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <label className="flex items-center justify-center p-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs text-gray-800 cursor-pointer hover:bg-gray-100 transition">
                    <input type="radio" name="role" value="DRIVER" className="mr-1.5 accent-blue-600" />
                    Có xe máy (Tài xế)
                  </label>
                  <label className="flex items-center justify-center p-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs text-gray-800 cursor-pointer hover:bg-gray-100 transition">
                    <input type="radio" name="role" value="PASSENGER" className="mr-1.5 accent-blue-600" />
                    Cần đi ké (Hành khách)
                  </label>
                  <label className="flex items-center justify-center p-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs text-gray-800 cursor-pointer hover:bg-gray-100 transition">
                    <input type="radio" name="role" value="BOTH" defaultChecked className="mr-1.5 accent-blue-600" />
                    Cả hai
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Mật khẩu <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="password"
                    type="password"
                    required
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-300 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Xác nhận Mật khẩu <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="confirmPassword"
                    type="password"
                    required
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-300 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-sm transition disabled:opacity-50 text-sm flex items-center justify-center gap-2"
              >
                {loading ? 'Đang tạo tài khoản...' : 'Đăng ký tài khoản'}
              </button>
            </form>

            {/* Footer Link */}
            <div className="text-center text-xs text-gray-500 pt-4 border-t border-gray-100">
              Đã có tài khoản sinh viên?{' '}
              <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
                Đăng nhập ngay
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
