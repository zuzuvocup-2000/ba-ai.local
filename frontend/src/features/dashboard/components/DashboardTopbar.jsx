import { LogOut } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'

export function DashboardTopbar({ user, onLogout, title, subtitle }) {
  return (
    <Card className="flex flex-wrap items-center justify-between gap-4 border-slate-200/70 bg-white/90 p-6">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-500">Admin dashboard</p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">{title ?? user.name}</h1>
        <p className="text-sm text-slate-500">{subtitle ?? 'Quản trị hệ thống người dùng và phân quyền'}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-right">
          <p className="text-xs text-slate-400">Signed in</p>
          <p className="max-w-[240px] truncate text-sm font-medium text-slate-700">{user.email}</p>
        </div>
        <Button variant="secondary" onClick={onLogout}>
        <LogOut size={16} className="mr-2" />
        Đăng xuất
        </Button>
      </div>
    </Card>
  )
}

