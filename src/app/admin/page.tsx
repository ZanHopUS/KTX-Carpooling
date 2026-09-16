export default function AdminDashboardPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Trang Quản trị KTX Carpooling</h1>
          <p className="text-slate-500 dark:text-zinc-400">Quản lý duyệt thẻ KTX, người dùng và xử lý báo cáo sự cố</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a href="/admin/verifications" className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm hover:border-blue-500 transition">
          <h3 className="text-sm font-medium text-slate-500">Hồ sơ chờ duyệt thẻ KTX</h3>
          <p className="text-3xl font-bold text-amber-600 mt-2">0</p>
        </a>
        <a href="/admin/reports" className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm hover:border-blue-500 transition">
          <h3 className="text-sm font-medium text-slate-500">Báo cáo trễ / vi phạm</h3>
          <p className="text-3xl font-bold text-rose-600 mt-2">0</p>
        </a>
        <a href="/admin/users" className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm hover:border-blue-500 transition">
          <h3 className="text-sm font-medium text-slate-500">Tổng số người dùng</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">0</p>
        </a>
      </div>
    </div>
  );
}
