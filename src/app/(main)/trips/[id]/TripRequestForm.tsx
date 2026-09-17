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
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-xs font-medium">
        ℹ️ Bạn là người đăng chuyến đi này. Bạn có thể duyệt yêu cầu ghép chuyến ở mục <strong>Yêu cầu ghép chuyến</strong>.
      </div>
    );
  }

  if (userAlreadyRequested) {
    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-blue-800 text-xs font-medium space-y-1">
        <p>✅ <strong>Bạn đã gửi yêu cầu ghép chuyến!</strong></p>
        <p className="text-gray-600">
          Vui lòng chờ tài xế phản hồi hoặc kiểm tra mục Yêu cầu.
        </p>
      </div>
    );
  }

  if (tripStatus !== 'OPEN' && tripStatus !== 'REQUESTED') {
    return (
      <div className="p-4 bg-gray-100 border border-gray-200 rounded-2xl text-gray-600 text-xs font-medium">
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
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm space-y-4">
      <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
        <span>🛵</span> Gửi yêu cầu ghép chuyến
      </h3>

      {feedback?.error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
          {feedback.error}
        </div>
      )}

      {feedback?.success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl font-medium">
          {feedback.success}
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
          Giờ đón mong muốn
        </label>
        <input
          type="time"
          value={requestedTime}
          onChange={(e) => setRequestedTime(e.target.value)}
          required
          className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
          Lời nhắn cho tài xế (tùy chọn)
        </label>
        <textarea
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ví dụ: Đón mình ở trước sảnh tòa B5 nhé..."
          className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu ghép chuyến'}
      </button>
    </form>
  );
}
