import { cn } from '../../lib/utils'

const variantClasses = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm',
  secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
  danger: 'bg-rose-600 text-white hover:bg-rose-700 shadow-sm',
  ghost: 'text-slate-600 hover:bg-slate-100',
}

const sizeClasses = {
  sm: 'h-7 px-3 text-xs rounded-lg',
  md: 'h-9 px-4 text-sm rounded-xl',
  lg: 'h-11 px-5 text-sm rounded-xl',
}

export function Button({ className, variant = 'primary', size = 'md', ...props }) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50 gap-1.5',
        variantClasses[variant] ?? variantClasses.primary,
        sizeClasses[size] ?? sizeClasses.md,
        className,
      )}
      {...props}
    />
  )
}
