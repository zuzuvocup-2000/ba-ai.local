import { cn } from '../../lib/utils'

export function Tabs({ tabs, value, onChange, className }) {
  return (
    <div className={cn('flex items-center gap-1 overflow-x-auto border-b border-slate-200', className)}>
      {tabs.map((tab) => {
        const active = tab.value === value
        const Icon = tab.icon
        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={cn(
              'relative inline-flex shrink-0 items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors',
              active
                ? 'text-blue-700'
                : 'text-slate-500 hover:text-slate-800',
            )}
          >
            {Icon && <Icon size={14} />}
            {tab.label}
            {active && (
              <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-blue-600" />
            )}
          </button>
        )
      })}
    </div>
  )
}
