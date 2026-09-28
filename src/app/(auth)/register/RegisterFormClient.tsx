'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { DORM_AREAS, DORM_BUILDINGS, isValidStudentEmailDomain } from '@/utils/constants';
import { registerAction } from '../actions';

interface UniversityOption {
  id: string;
  name: string;
}

interface RegisterFormClientProps {
  universities: UniversityOption[];
}

function removeVietnameseTones(str: string) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

export default function RegisterFormClient({ universities }: RegisterFormClientProps) {
  // Active Step: 1 = Student Info, 2 = Password Creation
  const [step, setStep] = useState<1 | 2>(1);

  // Form State - Step 1
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [university, setUniversity] = useState<string>(universities[0]?.name || universities[0]?.id || '');
  const [selectedArea, setSelectedArea] = useState<keyof typeof DORM_BUILDINGS>('KHU_B');
  const [dormBuilding, setDormBuilding] = useState('B1');

  // Searchable Combobox State for University
  const [uniSearchQuery, setUniSearchQuery] = useState('');
  const [isUniDropdownOpen, setIsUniDropdownOpen] = useState(false);
  const uniContainerRef = useRef<HTMLDivElement>(null);

  // Form State - Step 2 (Password)
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status & Feedback
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Click outside listener to close University dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (uniContainerRef.current && !uniContainerRef.current.contains(event.target as Node)) {
        setIsUniDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered universities based on search query
  const filteredUniversities = universities.filter((uni) => {
    if (!uniSearchQuery.trim()) return true;
    const query = removeVietnameseTones(uniSearchQuery.trim());
    const target = removeVietnameseTones(uni.name);
    return target.includes(query);
  });

  // Step 1: Validate Info & Email Domain
  function handleStep1Next(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    const cleanEmail = email.trim().toLowerCase();

    if (!fullName.trim() || !cleanEmail || !phone.trim() || !university || !selectedArea || !dormBuilding) {
      setErrorMsg('Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return;
    }

    // Check Student Email Domain (@...edu.vn)
    if (!isValidStudentEmailDomain(cleanEmail)) {
      setErrorMsg(
        'Vui lòng sử dụng Email sinh viên do trường cấp (ví dụ: @student.hcmus.edu.vn, @st.hcmut.edu.vn, @uit.edu.vn...).'
      );
      return;
    }

    // Email valid -> Advance directly to Step 2 (Password Creation)
    setStep(2);
  }

  // Step 2: Complete Registration
  async function handleStep2Submit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (password.length < 6) {
      setErrorMsg('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Mật khẩu xác nhận không khớp.');
      return;
    }

    setLoading(true);

    try {
      const result = await registerAction({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        university,
        dormArea: selectedArea,
        dormBuilding,
        password,
      });

      if (result?.error) {
        setLoading(false);
        setErrorMsg(result.error);
      }
    } catch (err: unknown) {
      if ((err as { digest?: string })?.digest?.startsWith('NEXT_REDIRECT')) {
        return;
      }
      setLoading(false);
      setErrorMsg('Đã xảy ra lỗi khi hoàn tất đăng ký.');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50/50 text-slate-800 font-sans selection:bg-blue-100 selection:text-blue-700 py-10">
      <div className="w-full max-w-xl p-6 sm:p-8 bg-white rounded-3xl border border-slate-200/80 shadow-xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-3 mb-1 group">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-blue-50 border border-blue-100 p-0.5 flex items-center justify-center shrink-0">
              <img src="/Logo.png" alt="KTX Carpooling Logo" className="w-full h-full object-contain" />
            </div>
            <div className="text-left">
              <div className="font-black text-slate-900 leading-tight group-hover:text-blue-600 transition">KTX Carpooling</div>
              <div className="text-[10px] font-medium text-slate-500 tracking-normal">ĐHQG-HCM</div>
            </div>
          </Link>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {step === 1 ? 'Đăng ký tài khoản sinh viên' : 'Tạo mật khẩu tài khoản'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {step === 1
              ? 'Nhập thông tin cá nhân và email sinh viên để bắt đầu'
              : `Tạo mật khẩu bảo mật cho tài khoản (${email})`}
          </p>
        </div>

        {/* 2-Step Progress Stepper */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-2xl border border-slate-200/60">
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-all ${
                step >= 1 ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-200 text-slate-500'
              }`}
            >
              1
            </div>
            <span className={`text-xs font-medium ${step >= 1 ? 'text-slate-900 font-semibold' : 'text-slate-400'}`}>
              Thông tin sinh viên
            </span>
          </div>

          <div className={`flex-1 h-0.5 mx-3 rounded ${step === 2 ? 'bg-blue-600' : 'bg-slate-200'}`} />

          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-all ${
                step === 2 ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-200 text-slate-500'
              }`}
            >
              2
            </div>
            <span className={`text-xs font-medium ${step === 2 ? 'text-slate-900 font-semibold' : 'text-slate-400'}`}>
              Tạo mật khẩu
            </span>
          </div>
        </div>

        {/* Feedback Messages */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2 animate-shake">
            <span className="text-base">⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: Personal & KTX Info Form */}
        {step === 1 && (
          <form onSubmit={handleStep1Next} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Số điện thoại / Zalo <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0901234567"
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email sinh viên <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nva@student.hcmus.edu.vn"
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
              />
            </div>

            <div className="relative" ref={uniContainerRef}>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Trường Đại học <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={isUniDropdownOpen ? uniSearchQuery : (university || uniSearchQuery)}
                  onFocus={() => {
                    setIsUniDropdownOpen(true);
                    setUniSearchQuery('');
                  }}
                  onChange={(e) => {
                    setUniSearchQuery(e.target.value);
                    if (!isUniDropdownOpen) setIsUniDropdownOpen(true);
                  }}
                  placeholder="Gõ tên trường để tìm kiếm (VD: Bách Khoa, KHTN...)"
                  className="w-full px-4 py-2.5 pr-10 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                  🔍
                </div>
              </div>

              {/* Dropdown Menu */}
              {isUniDropdownOpen && (
                <div className="absolute z-50 left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-xl py-1 space-y-0.5 animate-fadeIn">
                  {filteredUniversities.length > 0 ? (
                    filteredUniversities.map((uni) => {
                      const isSelected = university === uni.name || university === uni.id;
                      return (
                        <button
                          key={uni.id || uni.name}
                          type="button"
                          onClick={() => {
                            const selectedVal = uni.name || uni.id;
                            setUniversity(selectedVal);
                            setUniSearchQuery(uni.name);
                            setIsUniDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition ${
                            isSelected
                              ? 'bg-blue-50 text-blue-700 font-bold'
                              : 'text-slate-800 hover:bg-slate-100 font-medium'
                          }`}
                        >
                          <span className="line-clamp-1">{uni.name}</span>
                          {isSelected && <span className="text-blue-600 font-bold ml-2">✓</span>}
                        </button>
                      );
                    })
                  ) : (
                    <div className="px-4 py-3 text-xs text-slate-400 text-center font-medium">
                      Không tìm thấy trường khớp với &quot;{uniSearchQuery}&quot;
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Khu KTX đang ở <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedArea}
                  onChange={(e) => {
                    const newArea = e.target.value as keyof typeof DORM_BUILDINGS;
                    setSelectedArea(newArea);
                    const buildings = DORM_BUILDINGS[newArea];
                    if (buildings && buildings.length > 0) {
                      setDormBuilding(buildings[0]);
                    }
                  }}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                >
                  {DORM_AREAS.map((area) => (
                    <option key={area.id} value={area.id}>
                      {area.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tòa nhà KTX <span className="text-red-500">*</span>
                </label>
                <select
                  value={dormBuilding}
                  onChange={(e) => setDormBuilding(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                >
                  {DORM_BUILDINGS[selectedArea]?.map((b) => (
                    <option key={b} value={b}>
                      Tòa {b}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/25 transition text-sm flex items-center justify-center gap-2 mt-4"
            >
              Tiếp tục sang tạo mật khẩu →
            </button>
          </form>
        )}

        {/* STEP 2: Create Password & Complete Registration */}
        {step === 2 && (
          <form onSubmit={handleStep2Submit} className="space-y-4">
            <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-2xl flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="text-slate-500 block">Email sinh viên:</span>
                <span className="font-bold font-mono text-blue-700">{email}</span>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-blue-600 hover:underline font-semibold text-xs"
              >
                Sửa thông tin
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Mật khẩu tài khoản <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 pr-10 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Xác nhận Mật khẩu <span className="text-red-500">*</span>
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
              />
              {confirmPassword && (
                <p
                  className={`text-[11px] font-medium mt-1 ${
                    password === confirmPassword ? 'text-emerald-600' : 'text-red-500'
                  }`}
                >
                  {password === confirmPassword ? '✓ Mật khẩu xác nhận trùng khớp' : '✗ Mật khẩu chưa trùng khớp'}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !password || password !== confirmPassword}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/25 transition disabled:opacity-50 text-sm flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Đang tạo tài khoản...</span>
                </>
              ) : (
                '🎉 Hoàn tất Đăng ký & Vào Ứng dụng'
              )}
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-center text-xs text-slate-500 hover:text-slate-700 font-medium pt-2"
            >
              ← Quay lại bước nhập thông tin
            </button>
          </form>
        )}

        {/* Footer Navigation */}
        <div className="text-center text-xs text-slate-500 pt-4 border-t border-slate-100">
          Đã có tài khoản sinh viên?{' '}
          <Link href="/login" className="font-bold text-blue-600 hover:text-blue-700 hover:underline">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
