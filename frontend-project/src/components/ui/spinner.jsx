import { cn } from '../../lib/utils'

export function Spinner({ className, size = 'md' }) {
  const sizeClass = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-8 w-8' }[size] ?? 'h-6 w-6'
  return (
    <span
      className={cn(
        'inline-block animate-spin rounded-full border-2 border-current border-t-transparent text-blue-600',
        sizeClass,
        className,
      )}
      role="status"
      aria-label="Đang tải..."
    />
  )
}

export function PageSpinner() {
  return (
    <div className="flex h-full min-h-[200px] items-center justify-center">
      <Spinner size="lg" />
    </div>
  )
}
