export default function CreateTripPage() {
  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Đăng chuyến đi mới</h1>
      <p className="text-slate-500 dark:text-zinc-400 mb-6">Dành cho tài xế có xe máy muốn chở thêm bạn đi học cùng tuyến</p>

      <form className="space-y-4 bg-white dark:bg-zinc-900 p-6 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">Ngày đi</label>
            <input type="date" className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">Giờ đón</label>
            <input type="time" className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-transparent" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">Khu KTX</label>
            <select className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-transparent">
              <option value="KHU_A">Khu A</option>
              <option value="KHU_B">Khu B</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">Tòa nhà KTX</label>
            <input type="text" placeholder="Ví dụ: B2" className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-transparent" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">Trường đến</label>
          <input type="text" placeholder="Ví dụ: HCMUS" className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-transparent" />
        </div>

        <button type="submit" className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg">
          Đăng chuyến đi
        </button>
      </form>
    </div>
  );
}
