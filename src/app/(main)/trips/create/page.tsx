'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DORM_AREAS, DORM_BUILDINGS, UNIVERSITIES } from '@/utils/constants';
import { calculateSuggestedPrice, formatVND, fetchLiveMotorcycleDistance } from '@/lib/pricing';
import { createTripAction } from '../actions';

export default function CreateTripPage() {
  const [selectedArea, setSelectedArea] = useState<keyof typeof DORM_BUILDINGS>('KHU_B');
  const [selectedUniId, setSelectedUniId] = useState<string>('HCMUS');
  const [selectedCampusIndex, setSelectedCampusIndex] = useState<number>(1);
  const [distanceKm, setDistanceKm] = useState<number>(3.8);
  const [fetchingDistance, setFetchingDistance] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const selectedUni = UNIVERSITIES.find((u) => u.id === selectedUniId) || UNIVERSITIES[0];
  const calculatedPrice = calculateSuggestedPrice(distanceKm);

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
    return () => { isMounted = false; };
  }, [selectedArea, selectedUniId, selectedCampusIndex]);

  const todayStr = new Date().toISOString().split('T')[0];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set('distanceKm', distanceKm.toString());
    formData.set('destinationCampus', selectedUni.campuses[selectedCampusIndex] || '');
    const result = await createTripAction(formData);
    if (result?.error) {
      setErrorMsg(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="w-10 h-10 rounded-2xl bg-white border border-slate-200/80 hover:bg-slate-50 flex items-center justify-center text-slate-600 font-bold transition shadow-xs shrink-0"
        >
          ←
        </Link>
        <div className="space-y-0.5">
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
            <span>🛵 Đăng chuyến xe máy</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Tạo chuyến đi mới</h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Điền lịch trình đi học để ghép sinh viên cùng tuyến đường từ KTX
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
          <span>⚠️ {errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
          {/* ── Nhóm 1: Thời gian & Điểm đón ── */}
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-blue-600">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px]">1</span>
              <span>Thời gian &amp; Điểm đón tại KTX</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5" htmlFor="ct-date">
                  Ngày đi <span className="text-red-500">*</span>
                </label>
                <input
                  id="ct-date"
                  name="date"
                  type="date"
                  defaultValue={todayStr}
                  required
                  className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5" htmlFor="ct-time">
                  Giờ đón <span className="text-red-500">*</span>
                </label>
                <input
                  id="ct-time"
                  name="pickupTime"
                  type="time"
                  defaultValue="06:30"
                  required
                  className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5" htmlFor="ct-area">
                  Khu KTX <span className="text-red-500">*</span>
                </label>
                <select
                  id="ct-area"
                  name="pickupArea"
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value as keyof typeof DORM_BUILDINGS)}
                  required
                  className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                >
                  {DORM_AREAS.map((area) => (
                    <option key={area.id} value={area.id}>{area.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5" htmlFor="ct-building">
                  Tòa nhà <span className="text-red-500">*</span>
                </label>
                <select
                  id="ct-building"
                  name="pickupBuilding"
                  required
                  className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                >
                  {DORM_BUILDINGS[selectedArea]?.map((b) => (
                    <option key={b} value={b}>Tòa {b}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5" htmlFor="ct-point">
                Điểm đón cụ thể <span className="text-red-500">*</span>
              </label>
              <input
                id="ct-point"
                name="pickupPoint"
                type="text"
                required
                placeholder="Vd: Trước sảnh tòa B2, cổng phụ KTX Khu B..."
                className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* ── Nhóm 2: Điểm đến ── */}
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-blue-600">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px]">2</span>
              <span>Trường đại học đến</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5" htmlFor="ct-uni">
                  Trường đại học <span className="text-red-500">*</span>
                </label>
                <select
                  id="ct-uni"
                  name="destinationUniversity"
                  value={selectedUniId}
                  onChange={(e) => { setSelectedUniId(e.target.value); setSelectedCampusIndex(0); }}
                  required
                  className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                >
                  {UNIVERSITIES.map((uni) => (
                    <option key={uni.id} value={uni.id}>{uni.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5" htmlFor="ct-campus">
                  Cơ sở
                </label>
                <select
                  id="ct-campus"
                  value={selectedCampusIndex}
                  onChange={(e) => setSelectedCampusIndex(parseInt(e.target.value, 10))}
                  className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                >
                  {selectedUni.campuses.map((campus, idx) => (
                    <option key={campus} value={idx}>{campus}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5" htmlFor="ct-dest-building">
                Tòa nhà / Giảng đường (tùy chọn)
              </label>
              <input
                id="ct-dest-building"
                name="destinationBuilding"
                type="text"
                placeholder="Vd: Tòa E, Tòa C, Giảng đường 1..."
                className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* ── Nhóm 3: Chi phí & Thiết lập ── */}
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-blue-600">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px]">3</span>
              <span>Chi phí &amp; Thiết lập chuyến</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5" htmlFor="ct-dist">
                  Khoảng cách (km)
                  {fetchingDistance && <span className="ml-1.5 text-amber-600 font-normal">đang tra...</span>}
                </label>
                <div className="relative">
                  <input
                    id="ct-dist"
                    type="number"
                    min="0.5"
                    max="30"
                    step="0.1"
                    value={distanceKm}
                    onChange={(e) => setDistanceKm(parseFloat(e.target.value) || 1)}
                    className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition pr-12"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">km</span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium mt-1">Tra tự động từ OpenStreetMap</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5" htmlFor="ct-seats">
                  Số chỗ ghép
                </label>
                <input
                  id="ct-seats"
                  name="availableSeats"
                  type="number"
                  defaultValue={1}
                  min={1}
                  max={1}
                  readOnly
                  className="w-full px-4 py-2.5 text-sm bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-medium cursor-not-allowed"
                />
                <p className="text-[11px] text-slate-400 font-medium mt-1">Mặc định: 1 chỗ xe máy mỗi chuyến</p>
              </div>
            </div>

            {/* Price Preview Card */}
            <div className="flex items-center justify-between p-5 rounded-2xl bg-blue-50/80 border border-blue-100 shadow-xs">
              <div>
                <p className="text-xs sm:text-sm font-extrabold text-blue-950">Chi phí đóng góp tham khảo</p>
                <p className="text-[11px] text-blue-700 font-medium">2.000đ/km · tối thiểu 5.000đ · chia sẻ chi phí trực tiếp</p>
              </div>
              <span className="text-2xl sm:text-3xl font-black text-blue-600">{formatVND(calculatedPrice)}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5" htmlFor="ct-payment">
                  Phương thức thanh toán
                </label>
                <select id="ct-payment" name="paymentMethod" className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition">
                  <option value="CASH">Tiền mặt</option>
                  <option value="BANK_TRANSFER">Chuyển khoản</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5" htmlFor="ct-notes">
                  Ghi chú (tùy chọn)
                </label>
                <input
                  id="ct-notes"
                  name="notes"
                  type="text"
                  placeholder="Vd: Xe Wave xanh, có mũ bảo hiểm phụ..."
                  className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                />
              </div>
            </div>
          </div>

          {/* ── Submit Button ── */}
          <div className="p-6 bg-slate-50/60 text-center space-y-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Đang đăng chuyến...' : '🚀 Đăng chuyến đi ngay'}
            </button>
            <p className="text-[11px] text-slate-400 font-medium">
              Chuyến đi sẽ hiển thị công khai với sinh viên KTX cùng tuyến đường đến trường
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
