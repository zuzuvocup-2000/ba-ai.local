export function Toast({ toast, onClose }) {
  if (!toast) return null

  const toneClass = toast.type === 'success'
    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
    : 'border-rose-200 bg-rose-50 text-rose-700'

  return (
    <div className="fixed right-4 top-4 z-[10000] w-full max-w-sm">
      <div className={`rounded-xl border px-4 py-3 text-sm shadow-lg ${toneClass}`}>
        <div className="flex items-start justify-between gap-2">
          <p>{toast.message}</p>
          <button type="button" onClick={onClose} className="text-xs opacity-70 hover:opacity-100">
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}

