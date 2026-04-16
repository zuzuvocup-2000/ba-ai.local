import { useEffect } from 'react'
import { CheckCircle, XCircle, X } from 'lucide-react'

export function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => onClose?.(), 3000)
    return () => clearTimeout(timer)
  }, [toast, onClose])

  if (!toast) return null

  const isSuccess = toast.type === 'success'

  return (
    <div className="fixed right-4 top-4 z-[9999] w-full max-w-sm animate-in slide-in-from-top-2">
      <div
        className={[
          'flex items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg',
          isSuccess
            ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
            : 'border-rose-200 bg-rose-50 text-rose-800',
        ].join(' ')}
      >
        <span className="mt-0.5 shrink-0">
          {isSuccess ? <CheckCircle size={16} /> : <XCircle size={16} />}
        </span>
        <p className="flex-1 leading-snug">{toast.message}</p>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  )
}

// Hook for easy toast usage
import { useState, useCallback } from 'react'

export function useToast() {
  const [toast, setToast] = useState(null)

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type })
  }, [])

  const hideToast = useCallback(() => setToast(null), [])

  return { toast, showToast, hideToast }
}
