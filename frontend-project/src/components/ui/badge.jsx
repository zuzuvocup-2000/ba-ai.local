import { cn } from '../../lib/utils'

// Status color maps
export const STATUS_COLORS = {
  draft: 'bg-slate-100 text-slate-600',
  pending: 'bg-yellow-100 text-yellow-700',
  in_progress: 'bg-blue-100 text-blue-700',
  review: 'bg-purple-100 text-purple-700',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-rose-100 text-rose-700',
  done: 'bg-emerald-100 text-emerald-700',
  active: 'bg-emerald-100 text-emerald-700',
  inactive: 'bg-slate-100 text-slate-500',
}

export const STATUS_LABELS = {
  draft: 'Nháp',
  pending: 'Chờ duyệt',
  in_progress: 'Đang làm',
  review: 'Đang review',
  approved: 'Đã duyệt',
  rejected: 'Từ chối',
  done: 'Hoàn thành',
  active: 'Hoạt động',
  inactive: 'Ngừng',
}

export const PRIORITY_COLORS = {
  low: 'bg-slate-100 text-slate-500',
  medium: 'bg-blue-100 text-blue-600',
  high: 'bg-orange-100 text-orange-600',
  critical: 'bg-rose-100 text-rose-600',
}

export const PRIORITY_LABELS = {
  low: 'Thấp',
  medium: 'Trung bình',
  high: 'Cao',
  critical: 'Khẩn cấp',
}

export function Badge({ className, status, priority, children, ...props }) {
  let colorClass = 'bg-slate-100 text-slate-600'
  let text = children

  if (status) {
    colorClass = STATUS_COLORS[status] ?? colorClass
    text = children ?? STATUS_LABELS[status] ?? status
  } else if (priority) {
    colorClass = PRIORITY_COLORS[priority] ?? colorClass
    text = children ?? PRIORITY_LABELS[priority] ?? priority
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        colorClass,
        className,
      )}
      {...props}
    >
      {text}
    </span>
  )
}
