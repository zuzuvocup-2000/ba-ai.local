import { cva } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2',
  {
    variants: {
      variant: {
        default: 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow hover:from-indigo-700 hover:to-blue-700',
        secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
        danger: 'bg-rose-600 text-white shadow hover:bg-rose-700',
        ghost: 'hover:bg-slate-100 text-slate-600',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

export function Button({ className, variant, ...props }) {
  return <button className={cn(buttonVariants({ variant }), className)} {...props} />
}

