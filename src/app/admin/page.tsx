import Link from 'next/link';

export default function AdminDashboardPage() {
  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Trang Quản trị KTX Carpooling</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/admin/verifications"
          className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 hover:border-blue-500 shadow-sm transition space-y-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center font-bold text-lg">
            🪪
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-500 transition">
            Duyệt thẻ KTX Sinh viên →
          </h3>
          <p className="text-xs text-slate-500">
            Xem và phê duyệt các yêu cầu xác minh thẻ KTX của sinh viên
          </p>
        </Link>
      </div>
    </div>
  );
}
