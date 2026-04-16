import { UserCog } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'
import { Input } from '../../../components/ui/input'
import { Select2 } from '../../../components/ui/select2'

export function UserFormCard({
  roles,
  userForm,
  setUserForm,
  loading,
  canCreate,
  canEdit,
  onSubmit,
  onReset,
  fieldErrors,
}) {
  const roleOptions = roles.map((role) => ({ value: role.id, label: role.name }))
  const selectedRoleOption = roleOptions.find((option) => option.value === userForm.role_id) ?? null

  return (
    <Card className="p-6">
      <h3 className="mb-1 flex items-center gap-2 text-lg font-semibold text-slate-900">
        <UserCog size={18} /> Biểu mẫu tài khoản
      </h3>
      <p className="mb-5 text-sm text-slate-500">Tạo mới hoặc cập nhật tài khoản.</p>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600">Họ tên</label>
            <Input
              value={userForm.name}
              onChange={(event) => setUserForm({ ...userForm, name: event.target.value })}
              required
            />
            {fieldErrors?.name && <p className="text-xs text-rose-600">{fieldErrors.name}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600">Email</label>
            <Input
              type="email"
              value={userForm.email}
              onChange={(event) => setUserForm({ ...userForm, email: event.target.value })}
              required
            />
            {fieldErrors?.email && <p className="text-xs text-rose-600">{fieldErrors.email}</p>}
          </div>
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
          {fieldErrors?.password && <p className="text-xs text-rose-600">{fieldErrors.password}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-600">Vai trò</label>
          <Select2
            options={roleOptions}
            value={selectedRoleOption}
            onChange={(selectedOption) => {
              setUserForm({ ...userForm, role_id: selectedOption ? Number(selectedOption.value) : null })
            }}
            placeholder="Chọn 1 vai trò..."
          />
          {!userForm.role_id && (
            <p className="text-xs text-slate-400">Mỗi tài khoản chỉ có 1 vai trò.</p>
          )}
          {fieldErrors?.role_id && <p className="text-xs text-rose-600">{fieldErrors.role_id}</p>}
        </div>

        <div className="flex gap-2 border-t border-slate-100 pt-4">
          <Button
            type="submit"
            disabled={
              loading ||
              !userForm.role_id ||
              (!canCreate && !userForm.id) ||
              (!canEdit && !!userForm.id)
            }
          >
            {userForm.id ? 'Cập nhật' : 'Tạo tài khoản'}
          </Button>
          <Button type="button" variant="secondary" onClick={onReset}>
            Đặt lại
          </Button>
        </div>
      </form>
    </Card>
  )
}

