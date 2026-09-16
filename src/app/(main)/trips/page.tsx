export default function TripsPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Tìm chuyến đi KTX</h1>
          <p className="text-slate-500 dark:text-zinc-400">Danh sách chuyến xe máy từ KTX Khu A & Khu B đến trường đại học</p>
        </div>
      </div>

      {/* Natural language AI Filter component placeholder */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl border border-blue-200 dark:border-blue-900/50">
        <label className="block text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
          ✨ Tìm chuyến bằng AI (Nhập ngôn ngữ tự nhiên)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder='Ví dụ: "Mai mình học tiết 1 ở HCMUS, tìm giúp chuyến đón ở B2 lúc 6 rưỡi"'
            className="flex-1 px-3 py-2 text-sm bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg">
            Gợi ý AI
          </button>
        </div>
      </div>
    </div>
  );
}
