import { Plus, Trash2 } from 'lucide-react'
import { Button } from '../../../components/ui/button'

export function PermissionsTab({ roles = [], onChange }) {
  const addRole = () => onChange([...roles, { name: '', description: '' }])
  const updateRole = (i, key, val) => {
    const next = [...roles]
    next[i] = { ...next[i], [key]: val }
    onChange(next)
  }
  const removeRole = (i) => onChange(roles.filter((_, idx) => idx !== i))

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-800">Quyền / Vai trò trong dự án</h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Liệt kê các quyền của dự án kèm mô tả. AI sẽ dùng thông tin này khi sinh tài liệu.
        </p>
      </div>

      {roles.length === 0 && (
        <p className="rounded-xl border border-dashed border-slate-200 py-6 text-center text-xs text-slate-400">
          Chưa có quyền nào. Nhấn &quot;Thêm quyền&quot; để bắt đầu.
        </p>
      )}

      <div className="space-y-2">
        {roles.map((role, i) => (
          <div
            key={i}
            className="flex gap-2 rounded-xl border border-slate-200 bg-white p-3"
          >
            <div className="flex flex-1 flex-col gap-2 sm:flex-row">
              <input
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-semibold outline-none focus:border-blue-400 focus:bg-white sm:w-40"
                placeholder="VD: admin"
                value={role.name}
                onChange={(e) => updateRole(i, 'name', e.target.value)}
              />
              <input
                className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm outline-none focus:border-blue-400 focus:bg-white"
                placeholder="Mô tả quyền này cho phép làm gì..."
                value={role.description}
                onChange={(e) => updateRole(i, 'description', e.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={() => removeRole(i)}
              className="mt-0.5 shrink-0 rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      <Button type="button" variant="ghost" size="sm" onClick={addRole}>
        <Plus size={13} /> Thêm quyền
      </Button>
    </div>
  )
}
