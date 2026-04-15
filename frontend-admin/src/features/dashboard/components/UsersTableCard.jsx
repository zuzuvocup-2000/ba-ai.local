import { ShieldCheck } from 'lucide-react'
import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'

export function UsersTableCard({ users, canEdit, canDelete, onEdit, onDelete }) {
  const getInitials = (name) =>
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('')

  return (
    <Card className="p-6">
      <h3 className="mb-1 flex items-center gap-2 text-lg font-semibold text-slate-900">
        <ShieldCheck size={18} /> User Permissions
      </h3>
      <p className="mb-4 text-sm text-slate-500">Danh sách tài khoản và quyền hiện tại.</p>

      <div className="overflow-x-auto rounded-xl border border-slate-100">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
            <tr className="border-b border-slate-200">
              <th className="px-3 py-3">Tên</th>
              <th className="px-3 py-3">Email</th>
              <th className="px-3 py-3">Vai trò</th>
              <th className="px-3 py-3">Quyền</th>
              <th className="px-3 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((item) => (
              <tr key={item.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50/80 last:border-b-0">
                <td className="px-3 py-3">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-sky-100 text-xs font-semibold text-indigo-700">
                      {getInitials(item.name)}
                    </span>
                    <span className="font-medium text-slate-800">{item.name}</span>
                  </div>
                </td>
                <td className="px-3 py-3 text-slate-600">{item.email}</td>
                <td className="px-3 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {item.roles.map((role) => (
                      <Badge key={role.id} className="bg-violet-50 text-violet-700">{role.name}</Badge>
                    ))}
                  </div>
                </td>
                <td className="px-3 py-3">
                  <div className="max-w-md text-xs leading-relaxed text-slate-500">{item.permissions.join(', ')}</div>
                </td>
                <td className="px-3 py-3">
                  <div className="flex gap-2">
                    <Button type="button" variant="secondary" onClick={() => onEdit(item)} disabled={!canEdit}>
                      Sửa
                    </Button>
                    <Button type="button" variant="danger" onClick={() => onDelete(item.id)} disabled={!canDelete}>
                      Xóa
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!users.length && <p className="py-4 text-center text-sm text-slate-500">Không có dữ liệu user.</p>}
      </div>
    </Card>
  )
}

