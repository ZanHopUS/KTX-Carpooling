export default function DashboardPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Bảng điều khiển sinh viên</h1>
          <p className="text-slate-500 dark:text-zinc-400">Theo dõi các chuyến đi và yêu cầu ghép xe của bạn</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500 dark:text-zinc-400">Chuyến đi đã hoàn thành</h3>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">0</p>
        </div>
        <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500 dark:text-zinc-400">Yêu cầu chờ duyệt</h3>
          <p className="text-3xl font-bold text-amber-600 mt-2">0</p>
        </div>
        <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500 dark:text-zinc-400">Trạng thái xác minh thẻ KTX</h3>
          <span className="inline-block mt-2 px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
            Chưa xác minh
          </span>
        </div>
      </div>
    </div>
  );
}
