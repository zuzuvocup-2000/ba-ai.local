import { Plus, Trash2, Monitor, Smartphone, Server, Globe, Layers } from 'lucide-react'
import { Button } from '../../../components/ui/button'

const ICON_OPTIONS = [
  { value: 'globe', label: 'Web', Icon: Globe },
  { value: 'monitor', label: 'Desktop', Icon: Monitor },
  { value: 'smartphone', label: 'Mobile', Icon: Smartphone },
  { value: 'server', label: 'Backend / API', Icon: Server },
  { value: 'layers', label: 'Khác', Icon: Layers },
]

const iconOf = (key) => ICON_OPTIONS.find((o) => o.value === key)?.Icon ?? Layers

const newId = () => `p_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`

export function PlatformsTab({ platforms = [], onChange }) {
  const add = () =>
    onChange([
      ...platforms,
      { id: newId(), name: '', icon: 'globe', description: '' },
    ])

  const update = (id, patch) =>
    onChange(platforms.map((p) => (p.id === id ? { ...p, ...patch } : p)))

  const remove = (id) => onChange(platforms.filter((p) => p.id !== id))

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-800">Các nền tảng phát triển</h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Liệt kê các nền tảng dự án hỗ trợ (Web, Mobile, Desktop, Backend...).
        </p>
      </div>

      {platforms.length === 0 && (
        <p className="rounded-xl border border-dashed border-slate-200 py-6 text-center text-xs text-slate-400">
          Chưa có nền tảng nào. Nhấn &quot;Thêm nền tảng&quot;.
        </p>
      )}

      <div className="space-y-2">
        {platforms.map((p) => {
          const Icon = iconOf(p.icon)
          return (
            <div key={p.id} className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="flex items-start gap-2">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Icon size={16} />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                      className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-semibold outline-none focus:border-blue-400 focus:bg-white"
                      placeholder="Tên nền tảng (VD: Web App)"
                      value={p.name}
                      onChange={(e) => update(p.id, { name: e.target.value })}
                    />
                    <select
                      value={p.icon ?? 'globe'}
                      onChange={(e) => update(p.id, { icon: e.target.value })}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm outline-none focus:border-blue-400 focus:bg-white sm:w-40"
                    >
                      {ICON_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <input
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm outline-none focus:border-blue-400 focus:bg-white"
                    placeholder="Mô tả ngắn (VD: dành cho khách hàng, sử dụng trình duyệt...)"
                    value={p.description ?? ''}
                    onChange={(e) => update(p.id, { description: e.target.value })}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => remove(p.id)}
                  className="mt-0.5 shrink-0 rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <Button type="button" variant="ghost" size="sm" onClick={add}>
        <Plus size={13} /> Thêm nền tảng
      </Button>
    </div>
  )
}
