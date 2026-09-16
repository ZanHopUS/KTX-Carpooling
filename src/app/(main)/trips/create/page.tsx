'use me';
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DORM_AREAS, DORM_BUILDINGS, UNIVERSITIES } from '@/utils/constants';
import { calculateSuggestedPrice, formatVND, fetchLiveMotorcycleDistance } from '@/lib/pricing';
import { createTripAction } from '../actions';

export default function CreateTripPage() {
  const [selectedArea, setSelectedArea] = useState<keyof typeof DORM_BUILDINGS>('KHU_B');
  const [selectedUniId, setSelectedUniId] = useState<string>('HCMUS');
  const [selectedCampusIndex, setSelectedCampusIndex] = useState<number>(1); // Default to CS2 Linh Trung
  const [distanceKm, setDistanceKm] = useState<number>(3.8);
  const [fetchingDistance, setFetchingDistance] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const selectedUni = UNIVERSITIES.find((u) => u.id === selectedUniId) || UNIVERSITIES[0];
  const calculatedPrice = calculateSuggestedPrice(distanceKm);

  // Auto update exact distance from live OpenStreetMap Routing API
  useEffect(() => {
    let isMounted = true;
    async function updateDistance() {
      setFetchingDistance(true);
      const exactDist = await fetchLiveMotorcycleDistance(selectedArea, selectedUniId, selectedCampusIndex);
      if (isMounted) {
        setDistanceKm(exactDist);
        setFetchingDistance(false);
      }
    }
    updateDistance();
    return () => {
      isMounted = false;
    };
  }, [selectedArea, selectedUniId, selectedCampusIndex]);

  // Set default date to today YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set('distanceKm', distanceKm.toString());

    const result = await createTripAction(formData);
    if (result?.error) {
      setErrorMsg(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="text-xs font-semibold text-slate-400 hover:text-white transition flex items-center gap-1.5"
          >
            ← Quay lại Bảng điều khiển
          </Link>
          <span className="text-xs px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
            Tài xế xe máy
          </span>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Đăng chuyến đi mới 🛵</h1>
          <p className="text-sm text-slate-400">
            Đăng lịch trình đi học từ KTX để ghép chở thêm bạn sinh viên cùng tuyến
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm font-medium">
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-xl">
          {/* Section 1: Thời gian & Điểm đón KTX */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>📍</span> 1. Thời gian & Điểm đón tại KTX
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Ngày đi <span className="text-rose-400">*</span>
                </label>
                <input
                  name="date"
                  type="date"
                  defaultValue={todayStr}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Giờ đón <span className="text-rose-400">*</span>
                </label>
                <input
                  name="pickupTime"
                  type="time"
                  defaultValue="06:30"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Khu KTX đón <span className="text-rose-400">*</span>
                </label>
                <select
                  name="pickupArea"
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value as keyof typeof DORM_BUILDINGS)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {DORM_AREAS.map((area) => (
                    <option key={area.id} value={area.id} className="bg-slate-900">
                      {area.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tòa nhà KTX <span className="text-rose-400">*</span>
                </label>
                <select
                  name="pickupBuilding"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {DORM_BUILDINGS[selectedArea]?.map((b) => (
                    <option key={b} value={b} className="bg-slate-900">
                      Tòa {b}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Điểm đón cụ thể <span className="text-rose-400">*</span>
              </label>
              <input
                name="pickupPoint"
                type="text"
                required
                placeholder="Ví dụ: Trước sảnh tòa B2, Cổng phụ KTX Khu B"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <hr className="border-slate-800" />

          {/* Section 2: Trường Đại học đến */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>🎓</span> 2. Trường Đại học đến & Cơ sở
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Trường Đại học đến <span className="text-rose-400">*</span>
                </label>
                <select
                  name="destinationUniversity"
                  value={selectedUniId}
                  onChange={(e) => {
                    setSelectedUniId(e.target.value);
                    setSelectedCampusIndex(0);
                  }}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {UNIVERSITIES.map((uni) => (
                    <option key={uni.id} value={uni.id} className="bg-slate-900">
                      {uni.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Cơ sở trường
                </label>
                <select
                  name="destinationCampus"
                  value={selectedCampusIndex}
                  onChange={(e) => setSelectedCampusIndex(parseInt(e.target.value, 10))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {selectedUni.campuses.map((campus, idx) => (
                    <option key={campus} value={idx} className="bg-slate-900">
                      {campus}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tòa nhà học / Giảng đường (Tùy chọn)
              </label>
              <input
                name="destinationBuilding"
                type="text"
                placeholder="Ví dụ: Tòa E, Tòa C, Giảng đường 1"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <hr className="border-slate-800" />

          {/* Section 3: Giá gợi ý & Thiết lập chuyến */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>💰</span> 3. Khoảng cách API & Giá đóng góp tham khảo
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Khoảng cách thực tế (Tra tự động API)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0.5"
                    max="30"
                    step="0.1"
                    value={distanceKm}
                    onChange={(e) => setDistanceKm(parseFloat(e.target.value) || 1)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-blue-300"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400">km</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                  {fetchingDistance ? (
                    <span className="text-amber-400 animate-pulse">⏳ Đang gọi Maps Routing API...</span>
                  ) : (
                    <span>🗺️ Tra tuyến đường thực tế qua OpenStreetMap API</span>
                  )}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Số chỗ trống cần ghép
                </label>
                <input
                  name="availableSeats"
                  type="number"
                  defaultValue={1}
                  min={1}
                  max={1}
                  readOnly
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/60 text-slate-400 text-sm cursor-not-allowed"
                />
                <p className="text-[11px] text-slate-500 mt-1">* Phiên bản MVP hỗ trợ ghép 1 xe 1 hành khách</p>
              </div>
            </div>

            {/* Price Preview Card */}
            <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-800/50 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-blue-300">Giá đóng góp tham khảo (2.000đ/km, min 5k):</p>
                <p className="text-xs text-slate-400">Thanh toán trực tiếp giữa Tài xế & Hành khách</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-blue-400">{formatVND(calculatedPrice)}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Phương thức nhận tiền
                </label>
                <select
                  name="paymentMethod"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="CASH" className="bg-slate-900">💵 Tiền mặt</option>
                  <option value="BANK_TRANSFER" className="bg-slate-900">💳 Chuyển khoản Ngân hàng</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Ghi chú cho hành khách (Tùy chọn)
                </label>
                <input
                  name="notes"
                  type="text"
                  placeholder="Ví dụ: Xe Wave xanh biển 59X1-12345, mang mũ bảo hiểm phụ"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition disabled:opacity-50 text-base"
          >
            {loading ? 'Đang đăng chuyến đi...' : 'Đăng chuyến đi ngay'}
          </button>
        </form>
      </div>
    </div>
  );
}
