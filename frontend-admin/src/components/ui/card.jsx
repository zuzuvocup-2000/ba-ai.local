import { cn } from '../../lib/utils'

export function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-200/80 bg-white/95 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur',
        className,
      )}
      {...props}
    />
  )
}

