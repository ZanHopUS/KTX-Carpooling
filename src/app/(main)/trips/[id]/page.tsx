export default async function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="container mx-auto p-6 space-y-4 max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Chi tiết chuyến đi #{id}</h1>
      <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-3">
        <p className="text-sm text-slate-600 dark:text-zinc-400">Thông tin điểm đón, điểm đến và lịch trình xuất phát</p>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium">
          Gửi yêu cầu ghép chuyến
        </button>
      </div>
    </div>
  );
}
