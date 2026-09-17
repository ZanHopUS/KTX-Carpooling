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
      <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-2xl text-amber-800 dark:text-amber-300 text-xs font-medium">
        ℹ️ Bạn là tài xế tạo chuyến đi này. Bạn có thể xem và chấp nhận yêu cầu của các sinh viên khác tại trang Quản lý yêu cầu.
      </div>
    );
  }

  if (userAlreadyRequested) {
    return (
      <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 rounded-2xl text-blue-800 dark:text-blue-300 text-xs font-medium space-y-2">
        <p>✅ <strong>Bạn đã gửi yêu cầu ghép chuyến cho tài xế này!</strong></p>
        <p className="text-[11px] text-blue-600 dark:text-blue-400">
          Vui lòng đợi tài xế phản hồi hoặc truy cập mục <strong>Yêu cầu ghép chuyến</strong> để kiểm tra trạng thái.
        </p>
      </div>
    );
  }

  if (tripStatus !== 'OPEN' && tripStatus !== 'REQUESTED') {
    return (
      <div className="p-4 bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl text-slate-600 dark:text-zinc-400 text-xs font-medium">
        🔒 Chuyến đi này đã nhận đủ hành khách hoặc đã kết thúc.
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
    <form onSubmit={handleSubmit} className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
      <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <span>🛵</span> Gửi yêu cầu đi cùng xe máy
      </h3>

      {feedback?.error && (
        <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-xs rounded-xl font-medium">
          ⚠️ {feedback.error}
        </div>
      )}

      {feedback?.success && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400 text-xs rounded-xl font-medium">
          🎉 {feedback.success}
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1">
          ⏰ Giờ đón mong muốn của bạn
        </label>
        <input
          type="time"
          value={requestedTime}
          onChange={(e) => setRequestedTime(e.target.value)}
          required
          className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span className="text-[11px] text-slate-400 mt-1 block">
          Lưu ý: Thuật toán quy định độ lệch giờ đón không quá 5 phút so với tài xế ({defaultPickupTime}).
        </span>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1">
          💬 Lời nhắn cho tài xế (Tùy chọn)
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={2}
          placeholder="Ví dụ: Em đợi sẵn trước cửa sảnh tòa B2 ạ..."
          className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !!feedback?.success}
        className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/25 transition disabled:opacity-50"
      >
        {isSubmitting ? 'Đang gửi yêu cầu...' : '🚀 Xác nhận gửi yêu cầu ghép xe'}
      </button>
    </form>
  );
}
