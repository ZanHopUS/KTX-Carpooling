'use client';

import { useState } from 'react';
import { createTripRequestAction } from './actions';

interface TripRequestFormProps {
  tripId: string;
  defaultPickupTime: string;
  isDriver: boolean;
  userAlreadyRequested: boolean;
  tripStatus: string;
}

export default function TripRequestForm({
  tripId,
  defaultPickupTime,
  isDriver,
  userAlreadyRequested,
  tripStatus,
}: TripRequestFormProps) {
  const [requestedTime, setRequestedTime] = useState(defaultPickupTime);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ error?: string; success?: string } | null>(null);

  if (isDriver) {
    return (
      <div className="p-5 bg-amber-50/80 border border-amber-200 rounded-3xl text-amber-900 text-xs font-medium space-y-1">
        <p className="font-bold">ℹ️ Bạn là tài xế của chuyến đi này</p>
        <p className="text-amber-800">
          Bạn có thể duyệt hoặc phản hồi yêu cầu ghép chuyến của các sinh viên tại mục <strong>Yêu cầu ghép chuyến</strong>.
        </p>
      </div>
    );
  }

  if (userAlreadyRequested) {
    return (
      <div className="p-5 bg-blue-50/80 border border-blue-200 rounded-3xl text-blue-900 text-xs font-medium space-y-1">
        <p className="font-bold text-blue-950">✅ Đã gửi yêu cầu ghép chuyến!</p>
        <p className="text-blue-800">
          Vui lòng chờ tài xế xác nhận. Bạn có thể kiểm tra danh sách yêu cầu tại mục Yêu cầu.
        </p>
      </div>
    );
  }

  if (tripStatus !== 'OPEN' && tripStatus !== 'REQUESTED') {
    return (
      <div className="p-5 bg-slate-100 border border-slate-200 rounded-3xl text-slate-600 text-xs font-medium">
        🔒 Chuyến đi này đã chốt người hoặc đã kết thúc.
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    const formData = new FormData();
    formData.append('tripId', tripId);
    formData.append('requestedPickupTime', requestedTime);
    formData.append('message', message);

    const res = await createTripRequestAction(formData);
    setIsSubmitting(false);

    if (res?.error) {
      setFeedback({ error: res.error });
    } else if (res?.success) {
      setFeedback({ success: res.message });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
      <div className="flex items-center gap-2">
        <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 font-bold flex items-center justify-center text-sm">🛵</span>
        <h3 className="text-base font-extrabold text-slate-900">
          Gửi yêu cầu ghép chuyến
        </h3>
      </div>

      {feedback?.error && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl font-semibold">
          ⚠️ {feedback.error}
        </div>
      )}

      {feedback?.success && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-2xl font-semibold">
          🎉 {feedback.success}
        </div>
      )}

      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          Giờ đón mong muốn
        </label>
        <input
          type="time"
          value={requestedTime}
          onChange={(e) => setRequestedTime(e.target.value)}
          required
          className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          Lời nhắn cho tài xế (tùy chọn)
        </label>
        <textarea
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ví dụ: Đón mình ở trước sảnh tòa B2 nhé..."
          className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20 transition disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isSubmitting ? 'Đang gửi yêu cầu...' : 'Gửi yêu cầu ghép chuyến'}
      </button>
    </form>
  );
}
