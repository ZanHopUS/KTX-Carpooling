'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TripRequest, Trip, UserProfile } from '@/types/database';
import { acceptTripRequestAction, rejectTripRequestAction, cancelTripRequestAction } from '@/app/(main)/trips/[id]/actions';


interface RequestsClientProps {
  sentRequests: TripRequest[];
  receivedRequests: TripRequest[];
}

export default function RequestsClient({ sentRequests, receivedRequests }: RequestsClientProps) {
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleAccept = async (requestId: string, tripId: string) => {
    setLoadingId(requestId);
    await acceptTripRequestAction(requestId, tripId);
    setLoadingId(null);
  };

  const handleReject = async (requestId: string, tripId: string) => {
    setLoadingId(requestId);
    await rejectTripRequestAction(requestId, tripId);
    setLoadingId(null);
  };

  const handleCancel = async (requestId: string, tripId: string) => {
    setLoadingId(requestId);
    await cancelTripRequestAction(requestId, tripId);
    setLoadingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-zinc-800 text-sm font-bold">
        <button
          onClick={() => setActiveTab('received')}
          className={`pb-3 px-4 transition border-b-2 flex items-center gap-2 ${
            activeTab === 'received'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-zinc-400'
          }`}
        >
          <span>📥 Yêu cầu nhận được (Tài xế)</span>
          <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
            {receivedRequests.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('sent')}
          className={`pb-3 px-4 transition border-b-2 flex items-center gap-2 ${
            activeTab === 'sent'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-zinc-400'
          }`}
        >
          <span>📤 Yêu cầu đã gửi (Hành khách)</span>
          <span className="px-2 py-0.5 text-xs rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
            {sentRequests.length}
          </span>
        </button>
      </div>

      {/* Tab Content: Received Requests */}
      {activeTab === 'received' && (
        <div className="space-y-4">
          {receivedRequests.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 text-slate-500 text-sm">
              Bạn chưa nhận được yêu cầu ghép xe nào từ hành khách.
            </div>
          ) : (
            receivedRequests.map((req) => {
              const trip = req.trip as Trip | undefined;
              const passenger = req.passenger as UserProfile | undefined;

              return (
                <div
                  key={req.id}
                  className="p-5 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Passenger Profile */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow">
                        {passenger?.full_name?.slice(0, 1) || 'H'}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                            {passenger?.full_name || 'Hành khách'}
                          </h4>
                          {passenger?.dorm_card_verified === 'VERIFIED' && <span>✅</span>}
                        </div>
                        <p className="text-xs text-slate-500">{passenger?.university} • Tòa {passenger?.dorm_building}</p>
                      </div>
                    </div>

                    {/* Status & Match score */}
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 font-extrabold text-xs border border-blue-200 dark:border-blue-900">
                        🎯 Score: {req.match_score}đ
                      </span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        req.status === 'PENDING' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                        req.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {req.status === 'PENDING' && '⌛ Chờ tài xế duyệt'}
                        {req.status === 'ACCEPTED' && '✅ Đã chấp nhận'}
                        {req.status === 'REJECTED' && '❌ Đã từ chối'}
                        {req.status === 'CANCELLED' && '⚪ Đã hủy'}
                      </span>
                    </div>
                  </div>

                  {/* Trip Details */}
                  {trip && (
                    <div className="p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl text-xs space-y-1 text-slate-600 dark:text-zinc-300">
                      <p>🗓️ <strong>Chuyến đi:</strong> {trip.date} lúc {trip.pickup_time} ({trip.pickup_point} → {trip.destination_university})</p>
                      <p>⏰ <strong>Giờ hành khách muốn đón:</strong> <span className="font-bold text-blue-600 dark:text-blue-400">{req.requested_pickup_time}</span></p>
                    </div>
                  )}

                  {/* Driver Actions */}
                  {req.status === 'PENDING' && (
                    <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                      <button
                        onClick={() => handleAccept(req.id, req.trip_id)}
                        disabled={loadingId === req.id}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition disabled:opacity-50"
                      >
                        {loadingId === req.id ? 'Đang xử lý...' : '✅ Chấp nhận ghép chuyến'}
                      </button>
                      <button
                        onClick={() => handleReject(req.id, req.trip_id)}
                        disabled={loadingId === req.id}
                        className="px-4 py-2 bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 text-slate-700 dark:text-zinc-300 font-bold text-xs rounded-xl transition"
                      >
                        Từ chối
                      </button>
                    </div>
                  )}

                  {req.status === 'ACCEPTED' && (
                    <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex justify-end">
                      <Link
                        href={`/trips/${req.trip_id}/chat`}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition"
                      >
                        💬 Mở phòng Chat riêng với hành khách →
                      </Link>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab Content: Sent Requests */}
      {activeTab === 'sent' && (
        <div className="space-y-4">
          {sentRequests.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 text-slate-500 text-sm">
              Bạn chưa gửi yêu cầu ghép xe nào. Hãy tìm chuyến phù hợp trên danh sách!
            </div>
          ) : (
            sentRequests.map((req) => {
              const trip = req.trip as Trip | undefined;
              const driver = trip?.driver as UserProfile | undefined;

              return (
                <div
                  key={req.id}
                  className="p-5 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold text-slate-400 block mb-1">Chuyến xe máy KTX</span>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                        {trip?.pickup_point} → {trip?.destination_university}
                      </h4>
                      <p className="text-xs text-slate-500">Tài xế: {driver?.full_name || 'Ký túc xá'} • 🗓️ {trip?.date} lúc {trip?.pickup_time}</p>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      req.status === 'PENDING' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                      req.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {req.status === 'PENDING' && '⌛ Đang chờ tài xế xác nhận'}
                      {req.status === 'ACCEPTED' && '🎉 Tài xế đã chấp nhận!'}
                      {req.status === 'REJECTED' && '❌ Tài xế từ chối'}
                      {req.status === 'CANCELLED' && '⚪ Đã hủy'}
                    </span>
                  </div>

                  {req.status === 'PENDING' && (
                    <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex justify-end">
                      <button
                        onClick={() => handleCancel(req.id, req.trip_id)}
                        disabled={loadingId === req.id}
                        className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 font-bold text-xs rounded-xl transition"
                      >
                        Hủy yêu cầu
                      </button>
                    </div>
                  )}

                  {req.status === 'ACCEPTED' && (
                    <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex justify-end">
                      <Link
                        href={`/trips/${req.trip_id}/chat`}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition"
                      >
                        💬 Mở phòng Chat trao đổi điểm đón →
                      </Link>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
