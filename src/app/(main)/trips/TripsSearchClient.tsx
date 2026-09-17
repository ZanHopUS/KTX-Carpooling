'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Trip, UserProfile } from '@/types/database';
import { rankTrips, MatchResult, MatchingCriteria } from '@/lib/matching';
import { DORM_AREAS, UNIVERSITIES, PRICING_CONFIG } from '@/utils/constants';
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
  const [aiQuery, setAiQuery] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiNotice, setAiNotice] = useState<string | null>(null);

  // Perform Matching Calculation
  const criteria: MatchingCriteria = {
    date,
    pickup_time: pickupTime,
    passenger_university: university,
    passenger_profile: currentUserProfile || undefined,
  };

  const rankedResults: MatchResult[] = rankTrips(initialTrips, criteria);

  // Handle AI Search Query
  const handleAiSearch = async () => {
    if (!aiQuery.trim()) return;
    setIsAiLoading(true);
    setAiNotice(null);

    try {
      const res = await fetch('/api/ai/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: aiQuery }),
      });

      const data = await res.json();
      if (data.success && data.intent) {
        const { date: aiDate, pickup_time: aiTime, destination_school: aiUni } = data.intent;

        if (aiDate) setDate(aiDate);
        if (aiTime) setPickupTime(aiTime);
        if (aiUni) setUniversity(aiUni);

        setAiNotice(`✨ AI đã trích xuất: ${aiUni ? `Trường ${aiUni}` : ''} ${aiTime ? `| Giờ đón ${aiTime}` : ''} ${aiDate ? `| Ngày ${aiDate}` : ''}`);
      } else {
        setAiNotice('⚠️ Không thể phân tích câu tìm kiếm. Vui lòng thử diễn đạt lại.');
      }
    } catch (err) {
      console.error('AI Search Error:', err);
      setAiNotice('⚠️ Lỗi kết nối AI server.');
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero AI Search Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-6 md:p-8 text-white shadow-2xl border border-blue-800/40">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30">
            <span>✨ AI Natural Search Assistant</span>
          </div>

          <h2 className="text-xl md:text-2xl font-black tracking-tight">
            Tìm chuyến xe máy thông minh bằng ngôn ngữ tự nhiên
          </h2>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAiSearch()}
              placeholder='Ví dụ: "Mai mình học tiết 1 ở HCMUS, tìm chuyến ở B2 lúc 6 rưỡi"'
              className="flex-1 px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700/80 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
            />
            <button
              onClick={handleAiSearch}
              disabled={isAiLoading}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {isAiLoading ? 'Đang phân tích...' : '🤖 Phân tích AI'}
            </button>
          </div>

          {aiNotice && (
            <p className="text-xs font-medium text-blue-300 bg-blue-900/40 px-3 py-1.5 rounded-lg inline-block border border-blue-700/40">
              {aiNotice}
            </p>
          )}
        </div>
      </div>

      {/* Manual Filter Controls */}
      <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">
          ⚙️ Bộ lọc tìm kiếm chi tiết
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-zinc-400 mb-1">
              📅 Ngày đi
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-zinc-400 mb-1">
              ⏰ Giờ đón mong muốn (±5 phút)
            </label>
            <input
              type="time"
              value={pickupTime}
              onChange={(e) => setPickupTime(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-zinc-400 mb-1">
              🏢 Trường đến
            </label>
            <select
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {UNIVERSITIES.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.id} - {u.name.split('(')[0]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-zinc-400 mb-1">
              🏘️ Khu vực KTX
            </label>
            <select
              value={dormArea}
              onChange={(e) => setDormArea(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
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

      {/* Results Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Danh sách chuyến đi khớp thuật toán ({rankedResults.length})
          </h3>
          <span className="text-xs text-slate-500 dark:text-zinc-400">
            Ưu tiên cùng trường (+40đ) • Lệch giờ ≤ 5 phút
          </span>
        </div>

        {rankedResults.length === 0 ? (
          <div className="p-12 text-center bg-slate-50 dark:bg-zinc-900/50 rounded-2xl border border-dashed border-slate-300 dark:border-zinc-800 space-y-3">
            <div className="text-4xl">🛵</div>
            <h4 className="text-base font-bold text-slate-700 dark:text-zinc-300">
              Chưa có chuyến đi nào phù hợp với bộ lọc hiện tại
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Hãy thử thay đổi khung giờ đón hoặc đăng chuyến mới nếu bạn có xe máy!
            </p>
            <Link
              href="/trips/create"
              className="inline-block mt-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition"
            >
              ➕ Đăng chuyến xe máy ngay
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rankedResults.map(({ trip, match_score, breakdown }) => (
              <div
                key={trip.id}
                className="group relative p-5 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 hover:border-blue-500/50 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
              >
                {/* Header: Driver info & Match Score Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow">
                      {trip.driver?.full_name?.slice(0, 1) || 'T'}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">
                          {trip.driver?.full_name || 'Tài xế KTX'}
                        </span>
                        {trip.driver?.dorm_card_verified === 'VERIFIED' && (
                          <span title="Đã xác minh thẻ KTX" className="text-xs">
                            ✅
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500 dark:text-zinc-400">
                        ⭐ {trip.driver?.rating?.toFixed(1) || '5.0'} • {trip.driver?.completed_trip_count || 0} chuyến thành công
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-extrabold text-xs border border-emerald-300/40">
                      🎯 Score: {match_score}đ
                    </span>
                  </div>
                </div>

                {/* Score breakdown tags */}
                <div className="flex flex-wrap gap-1.5 text-[11px] font-medium">
                  {breakdown.school_score > 0 && (
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                      🏫 Cùng trường (+40)
                    </span>
                  )}
                  {breakdown.time_score > 0 && (
                    <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900">
                      ⏰ Khớp giờ đón (+{breakdown.time_score})
                    </span>
                  )}
                  {breakdown.reputation_score > 0 && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
                      ⭐ Tài xế uy tín (+10)
                    </span>
                  )}
                </div>

                {/* Route & Timing details */}
                <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-700 dark:text-zinc-300">
                    <span>📍 <strong>Điểm đón:</strong> {trip.pickup_point} ({trip.pickup_building})</span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">🕒 {trip.pickup_time}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-700 dark:text-zinc-300">
                    <span>🏫 <strong>Điểm đến:</strong> {trip.destination_university} {trip.destination_campus ? `(${trip.destination_campus})` : ''}</span>
                    <span>🗓️ {trip.date}</span>
                  </div>
                </div>

                {/* Pricing & Action */}
                <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex justify-between items-center">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Đóng góp chi phí:</span>
                    <span className="text-base font-extrabold text-blue-600 dark:text-blue-400">
                      {formatVND(trip.suggested_price)}
                    </span>
                    <span className="text-[11px] text-slate-500 ml-1">({trip.distance_km} km)</span>
                  </div>

                  <Link
                    href={`/trips/${trip.id}`}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow transition hover:scale-105"
                  >
                    Xem chi tiết & Gửi yêu cầu →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
