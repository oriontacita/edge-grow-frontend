export default function ConfirmDialog({ open, title, message, onConfirm, onCancel, loading }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-4">
      <div className="bg-surface rounded-xl shadow-lg max-w-sm w-full p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-error-container flex items-center justify-center text-error">
            <span className="material-symbols-outlined">warning</span>
          </div>
          <h3 className="font-headline-md text-lg font-bold text-on-surface">{title}</h3>
        </div>
        <p className="text-sm text-on-surface-variant mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 rounded-lg font-bold text-on-surface-variant hover:bg-surface-container transition-colors"
            onClick={onCancel}
            disabled={loading}
          >
            Batal
          </button>
          <button
            className="px-4 py-2 rounded-lg font-bold bg-error text-white hover:opacity-90 transition-all disabled:opacity-50"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Menghapus...' : 'Hapus'}
          </button>
        </div>
      </div>
    </div>
  )
}
