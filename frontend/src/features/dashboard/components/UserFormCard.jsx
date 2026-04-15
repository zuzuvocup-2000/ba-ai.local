import { UserCog } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'
import { Input } from '../../../components/ui/input'

export function UserFormCard({
  roles,
  userForm,
  setUserForm,
  loading,
  canCreate,
  canEdit,
  onSubmit,
  onReset,
}) {
  return (
    <Card className="p-6">
      <h3 className="mb-1 flex items-center gap-2 text-lg font-semibold text-slate-900">
        <UserCog size={18} /> User Form
      </h3>
      <p className="mb-5 text-sm text-slate-500">Tạo mới hoặc cập nhật tài khoản.</p>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-600">Họ tên</label>
          <Input
            value={userForm.name}
            onChange={(event) => setUserForm({ ...userForm, name: event.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-600">Email</label>
          <Input
            type="email"
            value={userForm.email}
            onChange={(event) => setUserForm({ ...userForm, email: event.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-600">Mật khẩu</label>
          <Input
            type="password"
            value={userForm.password}
            onChange={(event) => setUserForm({ ...userForm, password: event.target.value })}
            required={!userForm.id}
            placeholder={userForm.id ? 'Để trống nếu không đổi' : ''}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-600">Vai trò</label>
          <select
            className="min-h-32 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700 shadow-sm outline-none focus-visible:border-indigo-300 focus-visible:ring-2 focus-visible:ring-indigo-500/30"
            multiple
            value={userForm.role_ids}
            onChange={(event) => {
              const selectedValues = Array.from(event.target.selectedOptions).map((option) => Number(option.value))
              setUserForm({ ...userForm, role_ids: selectedValues })
            }}
            required
          >
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 pt-2">
          <Button type="submit" disabled={loading || (!canCreate && !userForm.id) || (!canEdit && !!userForm.id)}>
            {userForm.id ? 'Cập nhật' : 'Tạo user'}
          </Button>
          <Button type="button" variant="secondary" onClick={onReset}>
            Reset
          </Button>
        </div>
      </form>
    </Card>
  )
}

