export default function ProfilePage() {
  return (
    <div className="container mx-auto p-6 max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Trang cá nhân sinh viên</h1>
      
      <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold text-xl">
            SV
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Sinh viên KTX</h2>
            <p className="text-sm text-slate-500">Email: student@vnu.edu.vn</p>
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-zinc-800 pt-4 flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-zinc-300">Xác minh thẻ KTX</p>
            <p className="text-xs text-slate-500">Bắt buộc để đăng & gửi yêu cầu ghép chuyến</p>
          </div>
          <a href="/profile/verify" className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold">
            Tải lên thẻ KTX
          </a>
        </div>
      </div>
    </div>
  );
}
