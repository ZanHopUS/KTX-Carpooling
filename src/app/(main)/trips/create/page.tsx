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
    const result = await createTripAction(formData);
    if (result?.error) {
      setErrorMsg(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard"
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          style={{ color: 'var(--text-secondary)' }}>
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Đăng chuyến đi mới</h1>
          <p className="text-sm text-gray-500">Điền thông tin lịch trình để ghép sinh viên cùng tuyến đi học</p>
        </div>
      </div>

      {errorMsg && (
        <div className="alert alert-error" role="alert">
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20" className="shrink-0 mt-0.5">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
          </svg>
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="card overflow-hidden divide-y" style={{ borderColor: 'var(--border-default)' }}>

          {/* ── Nhóm 1: Thời gian & Điểm đón ── */}
          <div className="p-5 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-primary)' }}>
              1 · Thời gian & Điểm đón tại KTX
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label" htmlFor="ct-date">Ngày đi <span className="text-red-500">*</span></label>
                <input id="ct-date" name="date" type="date" defaultValue={todayStr} required className="form-input" />
              </div>
              <div>
                <label className="form-label" htmlFor="ct-time">Giờ đón <span className="text-red-500">*</span></label>
                <input id="ct-time" name="pickupTime" type="time" defaultValue="06:30" required className="form-input" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label" htmlFor="ct-area">Khu KTX <span className="text-red-500">*</span></label>
                <select id="ct-area" name="pickupArea" value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value as keyof typeof DORM_BUILDINGS)}
                  required className="form-select">
                  {DORM_AREAS.map((area) => (
                    <option key={area.id} value={area.id}>{area.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label" htmlFor="ct-building">Tòa nhà <span className="text-red-500">*</span></label>
                <select id="ct-building" name="pickupBuilding" required className="form-select">
                  {DORM_BUILDINGS[selectedArea]?.map((b) => (
                    <option key={b} value={b}>Tòa {b}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="form-label" htmlFor="ct-point">Điểm đón cụ thể <span className="text-red-500">*</span></label>
              <input id="ct-point" name="pickupPoint" type="text" required
                placeholder="Vd: Trước sảnh tòa B2, cổng phụ KTX Khu B..."
                className="form-input" />
            </div>
          </div>

          {/* ── Nhóm 2: Điểm đến ── */}
          <div className="p-5 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-primary)' }}>
              2 · Trường đại học đến
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label" htmlFor="ct-uni">Trường đại học <span className="text-red-500">*</span></label>
                <select id="ct-uni" name="destinationUniversity" value={selectedUniId}
                  onChange={(e) => { setSelectedUniId(e.target.value); setSelectedCampusIndex(0); }}
                  required className="form-select">
                  {UNIVERSITIES.map((uni) => (
                    <option key={uni.id} value={uni.id}>{uni.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label" htmlFor="ct-campus">Cơ sở</label>
                <select id="ct-campus" name="destinationCampus" value={selectedCampusIndex}
                  onChange={(e) => setSelectedCampusIndex(parseInt(e.target.value, 10))}
                  className="form-select">
                  {selectedUni.campuses.map((campus, idx) => (
                    <option key={campus} value={idx}>{campus}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="form-label" htmlFor="ct-dest-building">Tòa nhà / Giảng đường (tùy chọn)</label>
              <input id="ct-dest-building" name="destinationBuilding" type="text"
                placeholder="Vd: Tòa E, Tòa C, Giảng đường 1..."
                className="form-input" />
            </div>
          </div>

          {/* ── Nhóm 3: Chi phí & Thiết lập ── */}
          <div className="p-5 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-primary)' }}>
              3 · Chi phí & Thiết lập chuyến
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label" htmlFor="ct-dist">
                  Khoảng cách (km)
                  {fetchingDistance && <span className="ml-1.5 font-normal" style={{ color: 'var(--color-warning)' }}>đang tra...</span>}
                </label>
                <div className="relative">
                  <input id="ct-dist" type="number" min="0.5" max="30" step="0.1"
                    value={distanceKm} onChange={(e) => setDistanceKm(parseFloat(e.target.value) || 1)}
                    className="form-input pr-10" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs pointer-events-none" style={{ color: 'var(--text-muted)' }}>km</span>
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Tra tự động từ OpenStreetMap</p>
              </div>
              <div>
                <label className="form-label" htmlFor="ct-seats">Số chỗ ghép</label>
                <input id="ct-seats" name="availableSeats" type="number" defaultValue={1} min={1} max={1}
                  readOnly className="form-input cursor-not-allowed" style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)' }} />
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>MVP: 1 chỗ mỗi chuyến</p>
              </div>
            </div>

            {/* Price preview */}
            <div className="flex items-center justify-between p-4 rounded-xl"
              style={{ background: 'var(--color-primary-light)', border: '1px solid var(--color-primary-border)' }}>
              <div>
                <p className="text-sm font-semibold" style={{ color: '#1e40af' }}>Chi phí đóng góp tham khảo</p>
                <p className="text-xs" style={{ color: '#3b82f6' }}>2.000đ/km · tối thiểu 5.000đ · thanh toán trực tiếp</p>
              </div>
              <span className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>{formatVND(calculatedPrice)}</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label" htmlFor="ct-payment">Phương thức thanh toán</label>
                <select id="ct-payment" name="paymentMethod" className="form-select">
                  <option value="CASH">Tiền mặt</option>
                  <option value="BANK_TRANSFER">Chuyển khoản</option>
                </select>
              </div>
              <div>
                <label className="form-label" htmlFor="ct-notes">Ghi chú (tùy chọn)</label>
                <input id="ct-notes" name="notes" type="text"
                  placeholder="Vd: Xe Wave xanh, có mũ bảo hiểm phụ..."
                  className="form-input" />
              </div>
            </div>
          </div>

          {/* ── Submit ── */}
          <div className="p-5" style={{ background: 'var(--bg-subtle)' }}>
            <button type="submit" disabled={loading} className="btn btn-primary w-full">
              {loading ? 'Đang đăng chuyến...' : 'Đăng chuyến đi'}
            </button>
            <p className="text-xs text-center mt-3" style={{ color: 'var(--text-muted)' }}>
              Chuyến đi sẽ hiển thị công khai với sinh viên cùng tuyến đường
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
