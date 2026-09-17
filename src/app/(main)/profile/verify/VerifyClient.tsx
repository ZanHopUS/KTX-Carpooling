'use client';

import { useState } from 'react';
import { UserProfile } from '@/types/database';
import { uploadDormCardAction } from '../actions';
import { DORM_AREAS, DORM_BUILDINGS } from '@/utils/constants';

interface VerifyClientProps {
  userProfile: UserProfile;
}

export default function VerifyClient({ userProfile }: VerifyClientProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(userProfile.dorm_card_url || null);
  const [studentId, setStudentId] = useState(userProfile.student_id || '');
  const [dormArea, setDormArea] = useState(userProfile.dorm_area || 'KHU_B');
  const [dormBuilding, setDormBuilding] = useState(userProfile.dorm_building || 'B2');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ error?: string; success?: string } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file && !userProfile.dorm_card_url) {
      setFeedback({ error: 'Vui lòng chọn 1 tệp hình ảnh thẻ KTX.' });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    const formData = new FormData();
    if (file) formData.append('dormCardFile', file);
    formData.append('studentId', studentId);
    formData.append('dormArea', dormArea);
    formData.append('dormBuilding', dormBuilding);

    const res = await uploadDormCardAction(formData);
    setIsSubmitting(false);

    if (res.error) {
      setFeedback({ error: res.error });
    } else {
      setFeedback({ success: res.message });
    }
  };

  const status = userProfile.dorm_card_verified;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Verification Status Banner */}
      <div className={`p-5 rounded-2xl border ${
        status === 'VERIFIED' ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300' :
        status === 'PENDING' ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300' :
        status === 'REJECTED' ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900 text-red-800 dark:text-red-300' :
        'bg-slate-50 dark:bg-zinc-800 border-slate-200 text-slate-700'
      }`}>
        <div className="flex items-center gap-3">
          <div className="text-2xl">
            {status === 'VERIFIED' && '✅'}
            {status === 'PENDING' && '⌛'}
            {status === 'REJECTED' && '❌'}
          </div>
          <div>
            <h3 className="font-bold text-sm">
              {status === 'VERIFIED' && 'Tài khoản đã xác minh thẻ KTX thành công!'}
              {status === 'PENDING' && 'Hồ sơ xác minh thẻ KTX đang chờ duyệt'}
              {status === 'REJECTED' && 'Hồ sơ xác minh thẻ KTX bị từ chối'}
            </h3>
            <p className="text-xs opacity-90 mt-0.5">
              {status === 'VERIFIED' && 'Bạn hiện có đầy đủ quyền đăng chuyến xe máy và gửi yêu cầu ghép xe đi học.'}
              {status === 'PENDING' && 'Ban quản trị sẽ kiểm tra ảnh thẻ KTX và duyệt hồ sơ của bạn.'}
              {status === 'REJECTED' && 'Vui lòng tải lại ảnh chụp thẻ KTX rõ nét hơn.'}
            </p>
          </div>
        </div>
      </div>

      {/* Upload Form */}
      <form onSubmit={handleSubmit} className="p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span>🪪</span> Tải lên thông tin & Ảnh thẻ KTX
        </h3>

        {feedback?.error && (
          <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl font-medium">⚠️ {feedback.error}</div>
        )}

        {feedback?.success && (
          <div className="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-xl font-medium">🎉 {feedback.success}</div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1">
              Khu vực KTX
            </label>
            <select
              value={dormArea}
              onChange={(e) => setDormArea(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {DORM_AREAS.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1">
              Tòa nhà KTX
            </label>
            <select
              value={dormBuilding}
              onChange={(e) => setDormBuilding(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {(DORM_BUILDINGS[dormArea as keyof typeof DORM_BUILDINGS] || []).map((b) => (
                <option key={b} value={b}>Tòa {b}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1">
              Mã số sinh viên (MSSV)
            </label>
            <input
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="Ví dụ: 22120000"
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Image File Input & Preview */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400">
            📸 Ảnh mặt trước Thẻ KTX (Rõ họ tên & MSSV)
          </label>

          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-950 dark:file:text-blue-300 cursor-pointer"
          />

          {previewUrl && (
            <div className="mt-3 relative rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-700 max-h-60 bg-slate-900 flex items-center justify-center p-2">
              <img src={previewUrl} alt="Xem trước thẻ KTX" className="max-h-52 object-contain rounded-lg" />
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/25 transition disabled:opacity-50"
        >
          {isSubmitting ? 'Đang gửi hồ sơ...' : '📤 Tải lên & Gửi xác minh Thẻ KTX'}
        </button>
      </form>
    </div>
  );
}
