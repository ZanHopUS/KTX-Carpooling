'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Trip, UserProfile } from '@/types/database';
import { rankTrips, MatchResult, MatchingCriteria } from '@/lib/matching';
import { DORM_AREAS, UNIVERSITIES } from '@/utils/constants';
import { formatVND } from '@/lib/pricing';

interface TripsSearchClientProps {
  initialTrips: Trip[];
  currentUserProfile?: UserProfile | null;
}

export default function TripsSearchClient({ initialTrips, currentUserProfile }: TripsSearchClientProps) {
  const todayStr = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState<string>(todayStr);
  const [pickupTime, setPickupTime] = useState<string>('07:00');
  const [university, setUniversity] = useState<string>(currentUserProfile?.university || 'HCMUS');
  const [dormArea, setDormArea] = useState<string>(currentUserProfile?.dorm_area || 'KHU_B');
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  // Perform Matching Calculation
  const criteria: MatchingCriteria = {
    date,
    pickup_time: pickupTime,
    passenger_university: university,
    passenger_profile: currentUserProfile || undefined,
  };

  const rankedResults: MatchResult[] = rankTrips(initialTrips, criteria);

  // Optional keyword search filter
  const filteredResults = rankedResults.filter(({ trip }) => {
    if (!searchKeyword.trim()) return true;
    const kw = searchKeyword.toLowerCase();
    return (
      trip.pickup_point.toLowerCase().includes(kw) ||
      trip.destination_university.toLowerCase().includes(kw) ||
      trip.driver?.full_name?.toLowerCase().includes(kw)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Tìm chuyến xe đi học</h1>
            <p className="text-sm text-gray-500 mt-1">
              Danh sách các chuyến xe máy ghép cùng tuyến đường từ KTX Khu A &amp; Khu B
            </p>
          </div>
          <Link
            href="/trips/create"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition shadow-sm self-start md:self-auto"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Đăng chuyến xe</span>
          </Link>
        </div>

        {/* Search & Filters Form */}
        <div className="pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Ngày đi
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Khung giờ đón
            </label>
            <input
              type="time"
              value={pickupTime}
              onChange={(e) => setPickupTime(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Trường học (Điểm đến)
            </label>
            <select
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
            >
              {UNIVERSITIES.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Khu KTX (Điểm xuất phát)
            </label>
            <select
              value={dormArea}
              onChange={(e) => setDormArea(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
            >
              {DORM_AREAS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-900">
          Chuyến đi phù hợp ({filteredResults.length})
        </h2>
        <span className="text-xs text-gray-500">
          Được sắp xếp theo mức độ phù hợp tuyến đường &amp; thời gian
        </span>
      </div>

      {/* Results List */}
      {filteredResults.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 space-y-3">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto text-xl font-bold">
            🛵
          </div>
          <h3 className="text-base font-bold text-gray-900">
            Chưa tìm thấy chuyến đi phù hợp
          </h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Hiện chưa có chuyến xe nào ghép đúng tiêu chí bạn chọn. Bạn hãy thử chọn khung giờ khác hoặc tự đăng chuyến!
          </p>
          <div className="pt-2">
            <Link
              href="/trips/create"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition shadow-sm"
            >
              Đăng chuyến xe ngay
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredResults.map(({ trip, match_score, breakdown }) => (
            <div
              key={trip.id}
              className="bg-white rounded-2xl border border-gray-200 hover:border-blue-300 p-5 shadow-sm transition flex flex-col justify-between space-y-4"
            >
              {/* Top: Driver info */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                    {trip.driver?.full_name?.slice(0, 1) || 'S'}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-gray-900 text-sm">
                        {trip.driver?.full_name || 'Sinh viên KTX'}
                      </span>
                      {trip.driver?.dorm_card_verified === 'VERIFIED' && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200">
                          ✓ Đã xác minh
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      ⭐ {trip.driver?.rating?.toFixed(1) || '5.0'} • {trip.driver?.completed_trip_count || 0} chuyến đã đi
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                    Độ khớp {match_score}%
                  </span>
                </div>
              </div>

              {/* Match Criteria Badges */}
              <div className="flex flex-wrap gap-1.5 text-xs">
                {breakdown.school_score > 0 && (
                  <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-medium">
                    🏫 Cùng trường
                  </span>
                )}
                {breakdown.time_score > 0 && (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-medium">
                    ⏰ Khớp giờ đi
                  </span>
                )}
              </div>

              {/* Route details */}
              <div className="p-3 bg-gray-50 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between items-center text-gray-700">
                  <span>📍 <strong>Đón:</strong> {trip.pickup_point} ({trip.pickup_building})</span>
                  <span className="font-semibold text-blue-600">🕒 {trip.pickup_time}</span>
                </div>
                <div className="flex justify-between items-center text-gray-700">
                  <span>🏫 <strong>Đến:</strong> {trip.destination_university} {trip.destination_campus ? `(${trip.destination_campus})` : ''}</span>
                  <span>🗓️ {trip.date}</span>
                </div>
              </div>

              {/* Bottom bar */}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-gray-500 block">Đóng góp chi phí:</span>
                  <span className="text-base font-bold text-blue-600">
                    {formatVND(trip.suggested_price)}
                  </span>
                  <span className="text-xs text-gray-400 ml-1">({trip.distance_km} km)</span>
                </div>

                <Link
                  href={`/trips/${trip.id}`}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition"
                >
                  Xem chi tiết
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
