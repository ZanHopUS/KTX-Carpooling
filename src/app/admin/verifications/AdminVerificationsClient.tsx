'use client';

import { useState } from 'react';
import { UserProfile } from '@/types/database';
import { approveVerificationAction, rejectVerificationAction } from './actions';

interface AdminVerificationsClientProps {
  pendingUsers: UserProfile[];
}

export default function AdminVerificationsClient({ pendingUsers }: AdminVerificationsClientProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState<Record<string, string>>({});

  const handleApprove = async (userId: string) => {
    setLoadingId(userId);
    await approveVerificationAction(userId);
    setLoadingId(null);
  };

  const handleReject = async (userId: string) => {
    setLoadingId(userId);
    const note = rejectNote[userId] || 'Ảnh thẻ bị mờ hoặc thông tin không khớp.';
    await rejectVerificationAction(userId, note);
    setLoadingId(null);
  };

  return (
    <div className="space-y-4">
      {pendingUsers.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 text-slate-500 text-sm">
          🎉 Hiện không có hồ sơ xác minh thẻ KTX nào đang chờ duyệt.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pendingUsers.map((u) => (
            <div
              key={u.id}
              className="p-5 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
                    {u.full_name?.slice(0, 1) || 'S'}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{u.full_name}</h4>
                    <p className="text-xs text-slate-500">{u.email}</p>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl text-xs space-y-1 text-slate-600 dark:text-zinc-300">
                  <p>🎓 <strong>Trường:</strong> {u.university}</p>
                  <p>🆔 <strong>MSSV:</strong> {u.student_id || 'Chưa nhập'}</p>
                  <p>🏢 <strong>KTX:</strong> {u.dorm_area} - Tòa {u.dorm_building}</p>
                </div>

                {/* Card Image Preview */}
                {u.dorm_card_url ? (
                  <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-700 bg-slate-900 max-h-48 flex items-center justify-center p-1">
                    <img src={u.dorm_card_url} alt="Ảnh thẻ KTX" className="max-h-44 object-contain rounded" />
                  </div>
                ) : (
                  <div className="p-4 text-center bg-slate-100 dark:bg-zinc-800 rounded-xl text-xs text-slate-400">
                    Chưa có liên kết ảnh thẻ
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 space-y-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(u.id)}
                    disabled={loadingId === u.id}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition disabled:opacity-50"
                  >
                    {loadingId === u.id ? 'Đang xử lý...' : '✅ Duyệt hồ sơ'}
                  </button>
                  <button
                    onClick={() => handleReject(u.id)}
                    disabled={loadingId === u.id}
                    className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 font-bold text-xs rounded-xl transition"
                  >
                    Từ chối
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
