'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Trip, Message, UserProfile } from '@/types/database';
import { sendMessageAction, updateTripStatusAction, submitRatingAction } from './actions';

interface ChatClientProps {
  trip: Trip;
  currentUser: UserProfile;
  otherUser: UserProfile;
  initialMessages: Message[];
}

export default function ChatClient({ trip, currentUser, otherUser, initialMessages }: ChatClientProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputMsg, setInputMsg] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState('');
  const [ratingDone, setRatingDone] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim() || isSending) return;

    setIsSending(true);
    const content = inputMsg;
    setInputMsg('');

    const res = await sendMessageAction(trip.id, content);
    setIsSending(false);

    if (res.success) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          trip_id: trip.id,
          sender_id: currentUser.id,
          content,
          created_at: new Date().toISOString(),
        },
      ]);
    }
  };

  const handleQuickAction = async (msg: string, newStatus?: string) => {
    setIsSending(true);
    if (newStatus) {
      await updateTripStatusAction(trip.id, newStatus as any, msg);
    } else {
      await sendMessageAction(trip.id, msg);
    }
    setIsSending(false);

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        trip_id: trip.id,
        sender_id: currentUser.id,
        content: msg,
        created_at: new Date().toISOString(),
      },
    ]);
  };

  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitRatingAction(trip.id, otherUser.id, stars, comment);
    setRatingDone(true);
    setShowRatingModal(false);
  };

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {/* Header bar */}
      <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/trips/${trip.id}`} className="text-slate-400 hover:text-slate-600 text-sm">
            ← Chi tiết
          </Link>
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">
            {otherUser.full_name?.slice(0, 1) || 'U'}
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">{otherUser.full_name}</h3>
            <p className="text-[11px] text-slate-500">
              {trip.pickup_point} → {trip.destination_university}
            </p>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
          {trip.status === 'ACCEPTED' ? '🟢 Chuyến đã chốt' : trip.status}
        </span>
      </div>

      {/* Quick Action Buttons Bar */}
      <div className="flex flex-wrap gap-2 text-xs">
        <button
          onClick={() => handleQuickAction('📍 Tôi đã có mặt tại điểm đón!')}
          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 rounded-xl font-semibold border border-blue-200 dark:border-blue-900 transition"
        >
          📍 Tôi đã đến điểm đón
        </button>

        <button
          onClick={() => handleQuickAction('⏰ Xin lỗi, mình bị trễ khoảng 5 phút!')}
          className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 rounded-xl font-semibold border border-amber-200 dark:border-amber-900 transition"
        >
          ⏰ Báo trễ 5 phút
        </button>

        <button
          onClick={() => handleQuickAction('🎉 Chuyến đi hoàn tất! Cảm ơn bạn.', 'COMPLETED')}
          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition shadow"
        >
          🎉 Hoàn thành chuyến đi
        </button>

        <button
          onClick={() => setShowRatingModal(true)}
          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition shadow"
        >
          ⭐ Đánh giá
        </button>
      </div>

      {/* Chat Messages Box */}
      <div className="p-4 bg-slate-50 dark:bg-zinc-900/60 rounded-3xl border border-slate-200 dark:border-zinc-800 min-h-[350px] max-h-[480px] overflow-y-auto space-y-3 flex flex-col justify-end">
        {messages.length === 0 ? (
          <div className="text-center text-xs text-slate-400 py-12">
            💬 Phòng nhắn tin trực tiếp giữa Tài xế và Hành khách.<br />Hãy trao đổi vị trí đứng đón, đặc điểm nhận diện xe máy (màu xe, biển số).
          </div>
        ) : (
          messages.map((m) => {
            const isMe = m.sender_id === currentUser.id;
            return (
              <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-xs space-y-1 shadow-sm ${
                    isMe
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white border border-slate-200 dark:border-zinc-700 rounded-bl-none'
                  }`}
                >
                  <p className="leading-relaxed">{m.content}</p>
                  <span className={`text-[10px] block text-right ${isMe ? 'text-blue-200' : 'text-slate-400'}`}>
                    {new Date(m.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={inputMsg}
          onChange={(e) => setInputMsg(e.target.value)}
          placeholder="Nhập tin nhắn..."
          className="flex-1 px-4 py-3 text-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={isSending || !inputMsg.trim()}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow transition disabled:opacity-50"
        >
          Gửi
        </button>
      </form>

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-zinc-800 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              ⭐ Đánh giá chuyến đi với {otherUser.full_name}
            </h3>

            {ratingDone ? (
              <div className="p-4 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl text-center">
                🎉 Cảm ơn bạn đã gửi đánh giá cho đối phương!
              </div>
            ) : (
              <form onSubmit={handleRatingSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold mb-1">Số sao đánh giá (1-5 sao)</label>
                  <div className="flex gap-2 text-2xl cursor-pointer">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span key={s} onClick={() => setStars(s)}>
                        {s <= stars ? '⭐' : '☆'}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Nhận xét tổng quan</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    placeholder="Đi đúng giờ, thân thiện, chạy xe an toàn..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowRatingModal(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
                  >
                    Đóng
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-purple-600 text-white font-bold rounded-xl shadow"
                  >
                    Gửi đánh giá
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
