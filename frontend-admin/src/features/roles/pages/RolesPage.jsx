import { ShieldCheck } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'
import { Select2 } from '../../../components/ui/select2'
import rbacConfig from '../../../config/rbac-config.json'

export function RolesPage({ roles, permissions, can, loading, onUpdatePermissions, error }) {
  const [activeRoleId, setActiveRoleId] = useState(null)
  const [selectedPermissionSlugs, setSelectedPermissionSlugs] = useState([])

  const roleMap = useMemo(() => new Map(roles.map((role) => [role.slug, role])), [roles])
  const editableRoles = useMemo(
    () =>
      rbacConfig.roles.map((item) => {
        if (item.slug === 'system-admin' && roleMap.has('super-admin') && !roleMap.has('system-admin')) {
          return { ...item, ...roleMap.get('super-admin') }
        }
        return { ...item, ...(roleMap.get(item.slug) ?? {}) }
      }).filter((item) => item.id),
    [roleMap]
  )

  const permissionNameMap = useMemo(
    () =>
      new Map([
        ...rbacConfig.permissions.map((permission) => [permission.slug, permission.name]),
        ...permissions.map((permission) => [permission.slug, permission.name]),
      ]),
    [permissions]
  )
  const permissionOptions = useMemo(
    () => permissions.map((permission) => ({ value: permission.slug, label: permissionNameMap.get(permission.slug) ?? permission.slug })),
    [permissionNameMap, permissions]
  )

  return (
    <>
      {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {editableRoles.map((role) => (
          <Card key={role.id} className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <span className="rounded-lg bg-gradient-to-br from-indigo-100 to-sky-100 p-2 text-indigo-600">
                <ShieldCheck size={16} />
              </span>
              <div>
                <h3 className="text-base font-semibold text-slate-900">{role.name}</h3>
                <p className="text-xs uppercase tracking-wide text-slate-400">{role.slug}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {role.permissions.map((permission) => (
                <Badge key={permission} className="bg-slate-100 text-slate-700">
                  {permissionNameMap.get(permission) ?? permission}
                </Badge>
              ))}
            </div>
            <div className="mt-4 border-t border-slate-100 pt-4">
              <Button
                type="button"
                variant="secondary"
                disabled={!can('roles.edit')}
                onClick={() => {
                  setActiveRoleId(role.id)
                  setSelectedPermissionSlugs(role.permissions ?? [])
                }}
              >
                Sửa quyền
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {activeRoleId && (
        <div className="fixed inset-0 z-[9998] grid place-items-center bg-slate-900/55 p-4">
          <Card className="w-full max-w-2xl p-6">
            <h3 className="text-lg font-semibold text-slate-900">Cập nhật quyền vai trò</h3>
            <p className="mt-1 text-sm text-slate-500">Chọn quyền áp dụng cho vai trò.</p>
            <div className="mt-4">
              <Select2
                isMulti
                options={permissionOptions}
                value={permissionOptions.filter((option) => selectedPermissionSlugs.includes(option.value))}
                onChange={(options) => setSelectedPermissionSlugs((options ?? []).map((option) => option.value))}
                placeholder="Chọn quyền..."
              />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setActiveRoleId(null)}>
                Hủy
              </Button>
              <Button
                type="button"
                disabled={loading || !can('roles.edit')}
                onClick={async () => {
                  await onUpdatePermissions(activeRoleId, selectedPermissionSlugs)
                  setActiveRoleId(null)
                }}
              >
                Lưu quyền
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  )
}

