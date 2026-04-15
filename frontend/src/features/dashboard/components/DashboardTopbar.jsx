import { LogOut } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'

export function DashboardTopbar({ user, onLogout, title, subtitle }) {
  return (
    <Card className="flex flex-wrap items-center justify-between gap-4 p-6">
      <div>
        <p className="text-sm font-medium text-indigo-600">Welcome back</p>
        <h1 className="text-3xl font-semibold text-slate-900">{title ?? user.name}</h1>
        <p className="mt-1 text-sm text-slate-500">{subtitle ?? 'Quản trị hệ thống người dùng và phân quyền'}</p>
      </div>
      <Button variant="secondary" onClick={onLogout}>
        <LogOut size={16} className="mr-2" />
        Đăng xuất
      </Button>
    </Card>
  )
}

