export default function VerifyDormCardPage() {
  return (
    <div className="container mx-auto p-6 max-w-md space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Xác minh thẻ KTX</h1>
      <p className="text-sm text-slate-500">
        Vui lòng tải lên ảnh chụp thẻ KTX để xác nhận bạn đang ở KTX Khu A hoặc Khu B. Ảnh của bạn được bảo mật tuyệt đối và chỉ Admin mới có quyền duyệt.
      </p>

      <form className="space-y-4 bg-white dark:bg-zinc-900 p-6 rounded-xl border border-slate-200 dark:border-zinc-800">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-2">Chọn ảnh thẻ KTX</label>
          <input 
            type="file" 
            accept="image/*" 
            className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        <button type="submit" className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm">
          Gửi xác minh
        </button>
      </form>
    </div>
  );
}
