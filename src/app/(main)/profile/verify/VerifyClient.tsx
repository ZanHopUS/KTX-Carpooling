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
        status === 'VERIFIED' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
        status === 'PENDING' ? 'bg-amber-50 border-amber-200 text-amber-800' :
        status === 'REJECTED' ? 'bg-red-50 border-red-200 text-red-800' :
        'bg-gray-50 border-gray-200 text-gray-700'
      }`}>
        <div className="flex items-center gap-3">
          <div className="text-2xl">
            {status === 'VERIFIED' && '✅'}
            {status === 'PENDING' && '⌛'}
            {status === 'REJECTED' && '❌'}
          </div>
          <div>
            <h3 className="font-bold text-sm">
              {status === 'VERIFIED' && 'Tài khoản đã được xác minh thẻ KTX!'}
              {status === 'PENDING' && 'Hồ sơ xác minh thẻ KTX đang chờ duyệt'}
              {status === 'REJECTED' && 'Hồ sơ xác minh thẻ KTX bị từ chối'}
            </h3>
            <p className="text-xs opacity-90 mt-0.5">
              {status === 'VERIFIED' && 'Tài khoản của bạn đã đầy đủ uy tín để tham gia cộng đồng KTX Carpooling.'}
              {status === 'PENDING' && 'Ban quản trị đang kiểm tra và sẽ phản hồi sớm nhất.'}
              {status === 'REJECTED' && 'Vui lòng tải lại ảnh chụp thẻ KTX rõ nét hơn.'}
            </p>
          </div>
        </div>
      </div>

      {/* Upload Form */}
      <form onSubmit={handleSubmit} className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm space-y-5">
        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <span>🪪</span> Tải lên thẻ KTX
        </h3>

        {feedback?.error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">{feedback.error}</div>
        )}

        {feedback?.success && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl font-medium">{feedback.success}</div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Khu vực KTX
            </label>
            <select
              value={dormArea}
              onChange={(e) => setDormArea(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
            >
              {DORM_AREAS.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Tòa nhà KTX
            </label>
            <select
              value={dormBuilding}
              onChange={(e) => setDormBuilding(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
            >
              {(DORM_BUILDINGS[dormArea as keyof typeof DORM_BUILDINGS] || []).map((b) => (
                <option key={b} value={b}>Tòa {b}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Mã số sinh viên (MSSV)
            </label>
            <input
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="Ví dụ: 21120000"
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
            />
          </div>
        </div>

        {/* Image File Input & Preview */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
            Ảnh thẻ KTX (Rõ họ tên & MSSV)
          </label>

          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full text-xs text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
          />

          {previewUrl && (
            <div className="mt-3 relative rounded-xl overflow-hidden border border-gray-200 max-h-60 bg-gray-50 flex items-center justify-center p-2">
              <img src={previewUrl} alt="Xem trước thẻ KTX" className="max-h-52 object-contain rounded-lg" />
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-sm transition disabled:opacity-50"
        >
          {isSubmitting ? 'Đang gửi hồ sơ...' : 'Tải lên & Gửi xác minh'}
        </button>
      </form>
    </div>
  );
}
