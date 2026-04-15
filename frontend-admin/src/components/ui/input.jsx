import { cn } from '../../lib/utils'

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        'flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none ring-offset-white placeholder:text-slate-400 focus-visible:border-indigo-300 focus-visible:ring-2 focus-visible:ring-indigo-500/30 focus-visible:ring-offset-0',
        className,
      )}
      {...props}
    />
  )
}

