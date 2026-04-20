import { Plus, Trash2, Layers } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { EmptyState } from '../../../components/ui/empty-state'

const newId = () => `f_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`

export function FunctionsByPlatformTab({ platforms = [], functions = {}, onChange }) {
  const addFn = (platformId) => {
    const list = functions[platformId] ?? []
    onChange({
      ...functions,
      [platformId]: [...list, { id: newId(), name: '', description: '', priority: 'normal' }],
    })
  }

  const updateFn = (platformId, fnId, patch) => {
    const list = functions[platformId] ?? []
    onChange({
      ...functions,
      [platformId]: list.map((f) => (f.id === fnId ? { ...f, ...patch } : f)),
    })
  }

  const removeFn = (platformId, fnId) => {
    const list = functions[platformId] ?? []
    onChange({
      ...functions,
      [platformId]: list.filter((f) => f.id !== fnId),
    })
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-slate-800">Chức năng cần triển khai theo nền tảng</h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Liệt kê các chức năng sẽ triển khai cho từng nền tảng đã khai báo ở tab &quot;Nền tảng&quot;.
        </p>
      </div>

      {platforms.length === 0 && (
        <EmptyState
          icon={Layers}
          title="Chưa có nền tảng nào"
          description='Khai báo nền tảng tại tab "Nền tảng" trước khi thêm chức năng.'
          className="py-8"
        />
      )}

      {platforms.map((p) => {
        const list = functions[p.id] ?? []
        return (
          <div key={p.id} className="rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-slate-800">{p.name || 'Nền tảng chưa đặt tên'}</p>
                {p.description && (
                  <p className="text-xs text-slate-500">{p.description}</p>
                )}
              </div>
              <Button size="sm" variant="ghost" onClick={() => addFn(p.id)}>
                <Plus size={13} /> Thêm chức năng
              </Button>
            </div>

            {list.length === 0 ? (
              <p className="px-4 py-5 text-center text-xs text-slate-400">
                Chưa có chức năng nào cho nền tảng này.
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {list.map((fn) => (
                  <div key={fn.id} className="flex items-start gap-2 px-4 py-3">
                    <div className="flex-1 space-y-2">
                      <div className="flex gap-2">
                        <input
                          className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-semibold outline-none focus:border-blue-400 focus:bg-white"
                          placeholder="Tên chức năng"
                          value={fn.name}
                          onChange={(e) => updateFn(p.id, fn.id, { name: e.target.value })}
                        />
                        <select
                          value={fn.priority ?? 'normal'}
                          onChange={(e) => updateFn(p.id, fn.id, { priority: e.target.value })}
                          className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm outline-none focus:border-blue-400 focus:bg-white"
                        >
                          <option value="high">Ưu tiên cao</option>
                          <option value="normal">Bình thường</option>
                          <option value="low">Thấp</option>
                        </select>
                      </div>
                      <input
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm outline-none focus:border-blue-400 focus:bg-white"
                        placeholder="Mô tả ngắn chức năng..."
                        value={fn.description ?? ''}
                        onChange={(e) => updateFn(p.id, fn.id, { description: e.target.value })}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFn(p.id, fn.id)}
                      className="mt-1 shrink-0 rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
