export default function AdminVerificationsPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Duyệt hồ sơ thẻ KTX (Mục 13.5)</h1>
      <p className="text-slate-500 dark:text-zinc-400">Danh sách sinh viên tải lên ảnh thẻ KTX chờ phê duyệt</p>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-zinc-800/50 text-slate-700 dark:text-zinc-300">
            <tr>
              <th className="p-3">Họ tên</th>
              <th className="p-3">Email</th>
              <th className="p-3">Khu / Tòa</th>
              <th className="p-3">Ảnh thẻ KTX</th>
              <th className="p-3">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
            <tr>
              <td className="p-4 text-slate-500" colSpan={5}>Không có hồ sơ nào đang chờ duyệt.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
