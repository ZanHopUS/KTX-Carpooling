export default async function TripChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="container mx-auto p-6 max-w-2xl h-[calc(100vh-120px)] flex flex-col">
      <div className="p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-t-xl">
        <h2 className="font-bold text-slate-900 dark:text-white">Phòng chat chuyến đi #{id}</h2>
        <p className="text-xs text-slate-500">Trao đổi điểm đón cụ thể, biển số xe, nhận diện giữa tài xế & hành khách</p>
      </div>

      <div className="flex-1 bg-slate-50 dark:bg-zinc-950 border-x border-slate-200 dark:border-zinc-800 p-4 overflow-y-auto space-y-3">
        <div className="bg-blue-100 dark:bg-blue-900/40 p-3 rounded-lg text-sm text-blue-900 dark:text-blue-200 max-w-md">
          <p className="font-semibold text-xs mb-1">Hệ thống</p>
          Chuyến đi đã được xác nhận. Vui lòng có mặt trước giờ đón 5 phút.
        </div>
      </div>

      <div className="p-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-b-xl flex gap-2">
        <input 
          type="text" 
          placeholder="Nhập tin nhắn trao đổi..." 
          className="flex-1 px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg text-sm bg-transparent"
        />
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">Gửi</button>
      </div>
    </div>
  );
}
