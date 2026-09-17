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
      <div className="flex border-b border-gray-200 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('received')}
          className={`pb-3 px-4 transition border-b-2 flex items-center gap-2 ${
            activeTab === 'received'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <span>Yêu cầu nhận được (Tài xế)</span>
          <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700">
            {receivedRequests.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('sent')}
          className={`pb-3 px-4 transition border-b-2 flex items-center gap-2 ${
            activeTab === 'sent'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <span>Yêu cầu đã gửi (Hành khách)</span>
          <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">
            {sentRequests.length}
          </span>
        </button>
      </div>

      {/* Tab Content: Received Requests */}
      {activeTab === 'received' && (
        <div className="space-y-4">
          {receivedRequests.length === 0 ? (
            <div className="p-10 text-center bg-white rounded-2xl border border-gray-200 text-gray-500 text-sm">
              Bạn chưa nhận được yêu cầu ghép xe nào từ hành khách.
            </div>
          ) : (
            receivedRequests.map((req) => {
              const trip = req.trip as Trip | undefined;
              const passenger = req.passenger as UserProfile | undefined;

              return (
                <div
                  key={req.id}
                  className="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                        {passenger?.full_name?.slice(0, 1) || 'H'}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-gray-900 text-sm">
                            {passenger?.full_name || 'Hành khách'}
                          </h4>
                          {passenger?.dorm_card_verified === 'VERIFIED' && (
                            <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200">
                              ✓ Đã xác minh
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">{passenger?.university} • Tòa {passenger?.dorm_building}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        req.status === 'PENDING' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                        req.status === 'ACCEPTED' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {req.status === 'PENDING' && '⌛ Chờ duyệt'}
                        {req.status === 'ACCEPTED' && '✅ Đã chấp nhận'}
                        {req.status === 'REJECTED' && '❌ Đã từ chối'}
                        {req.status === 'CANCELLED' && '⚪ Đã hủy'}
                      </span>
                    </div>
                  </div>

                  {trip && (
                    <div className="p-3 bg-gray-50 rounded-xl text-xs space-y-1 text-gray-700">
                      <p>🗓️ <strong>Chuyến đi:</strong> {trip.date} lúc {trip.pickup_time} ({trip.pickup_point} → {trip.destination_university})</p>
                      <p>⏰ <strong>Giờ hành khách muốn đón:</strong> <span className="font-bold text-blue-600">{req.requested_pickup_time}</span></p>
                    </div>
                  )}

                  {req.status === 'PENDING' && (
                    <div className="flex gap-2 pt-2 border-t border-gray-100">
                      <button
                        onClick={() => handleAccept(req.id, req.trip_id)}
                        disabled={loadingId === req.id}
                        className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition disabled:opacity-50"
                      >
                        {loadingId === req.id ? 'Đang xử lý...' : 'Chấp nhận ghép chuyến'}
                      </button>
                      <button
                        onClick={() => handleReject(req.id, req.trip_id)}
                        disabled={loadingId === req.id}
                        className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl transition"
                      >
                        Từ chối
                      </button>
                    </div>
                  )}

                  {req.status === 'ACCEPTED' && (
                    <div className="pt-2 border-t border-gray-100 flex justify-end">
                      <Link
                        href={`/trips/${req.trip_id}/chat`}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition"
                      >
                        Mở phòng nhắn tin →
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
            <div className="p-10 text-center bg-white rounded-2xl border border-gray-200 text-gray-500 text-sm">
              Bạn chưa gửi yêu cầu ghép xe nào. Hãy tìm chuyến phù hợp trên trang Tìm chuyến!
            </div>
          ) : (
            sentRequests.map((req) => {
              const trip = req.trip as Trip | undefined;
              const driver = trip?.driver as UserProfile | undefined;

              return (
                <div
                  key={req.id}
                  className="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-semibold text-gray-500 block mb-1">Chuyến xe máy</span>
                      <h4 className="font-bold text-gray-900 text-sm">
                        {trip?.pickup_point} → {trip?.destination_university}
                      </h4>
                      <p className="text-xs text-gray-500">Tài xế: {driver?.full_name || 'Ký túc xá'} • 🗓️ {trip?.date} lúc {trip?.pickup_time}</p>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      req.status === 'PENDING' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                      req.status === 'ACCEPTED' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {req.status === 'PENDING' && '⌛ Đang chờ tài xế xác nhận'}
                      {req.status === 'ACCEPTED' && '🎉 Tài xế đã chấp nhận!'}
                      {req.status === 'REJECTED' && '❌ Tài xế từ chối'}
                      {req.status === 'CANCELLED' && '⚪ Đã hủy'}
                    </span>
                  </div>

                  {req.status === 'PENDING' && (
                    <div className="pt-2 border-t border-gray-100 flex justify-end">
                      <button
                        onClick={() => handleCancel(req.id, req.trip_id)}
                        disabled={loadingId === req.id}
                        className="px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 font-semibold text-xs rounded-xl transition"
                      >
                        Hủy yêu cầu
                      </button>
                    </div>
                  )}

                  {req.status === 'ACCEPTED' && (
                    <div className="pt-2 border-t border-gray-100 flex justify-end">
                      <Link
                        href={`/trips/${req.trip_id}/chat`}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition"
                      >
                        Mở phòng nhắn tin →
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
