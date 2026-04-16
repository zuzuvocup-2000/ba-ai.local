import { cn } from '../../lib/utils'

// options: [{ value, label }] or ['value']
export function Select({ label, error, className, id, options = [], ...props }) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <select
        id={inputId}
        className={cn(
          'flex h-10 w-full rounded-xl border bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none',
          'focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20',
          error ? 'border-rose-400' : 'border-slate-200',
          className,
        )}
        {...props}
      >
        {options.map((opt) => {
          const val = typeof opt === 'object' ? opt.value : opt
          const lbl = typeof opt === 'object' ? opt.label : opt
          return (
            <option key={val} value={val}>
              {lbl}
            </option>
          )
        })}
      </select>
      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  )
}
