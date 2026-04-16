import { cn } from '../../lib/utils'

export function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
      {Icon && (
        <div className="mb-4 rounded-full bg-slate-100 p-4 text-slate-400">
          <Icon size={28} />
        </div>
      )}
      <p className="text-sm font-medium text-slate-700">{title ?? 'Chưa có dữ liệu'}</p>
      {description && (
        <p className="mt-1 max-w-xs text-xs text-slate-500">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
