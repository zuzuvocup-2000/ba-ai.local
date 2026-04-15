import { cva } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2',
  {
    variants: {
      variant: {
        default: 'bg-slate-900 text-white hover:bg-slate-800',
        secondary: 'bg-slate-200 text-slate-900 hover:bg-slate-300',
        danger: 'bg-rose-600 text-white hover:bg-rose-700',
        ghost: 'hover:bg-slate-100 text-slate-700',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

export function Button({ className, variant, ...props }) {
  return <button className={cn(buttonVariants({ variant }), className)} {...props} />
}

