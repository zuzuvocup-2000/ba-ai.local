import { cn } from '../../lib/utils'

export function Textarea({ label, error, className, id, rows = 4, ...props }) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        rows={rows}
        className={cn(
          'flex w-full rounded-xl border bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none placeholder:text-slate-400 resize-y',
          'focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20',
          error ? 'border-rose-400' : 'border-slate-200',
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  )
}
