export default function RequestsPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Quản lý yêu cầu ghép chuyến</h1>
      <p className="text-slate-500 dark:text-zinc-400">Danh sách yêu cầu ghép chuyến bạn đã nhận hoặc gửi đi</p>

      <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-500">
        Chưa có yêu cầu ghép chuyến nào.
      </div>
    </div>
  );
}
