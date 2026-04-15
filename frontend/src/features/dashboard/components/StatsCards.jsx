import { Card } from '../../../components/ui/card'
import { ShieldCheck, Sparkles, Users } from 'lucide-react'

export function StatsCards({ totalUsers, totalRoles, totalPermissions }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">Tổng users</p>
          <span className="rounded-lg bg-blue-50 p-2 text-blue-600"><Users size={16} /></span>
        </div>
        <p className="mt-3 text-3xl font-semibold tracking-tight">{totalUsers}</p>
        <p className="mt-1 text-xs text-slate-400">Tài khoản đang có trong hệ thống</p>
      </Card>
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">Vai trò hệ thống</p>
          <span className="rounded-lg bg-violet-50 p-2 text-violet-600"><Sparkles size={16} /></span>
        </div>
        <p className="mt-3 text-3xl font-semibold tracking-tight">{totalRoles}</p>
        <p className="mt-1 text-xs text-slate-400">Role đang được cấu hình</p>
      </Card>
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">Quyền của bạn</p>
          <span className="rounded-lg bg-emerald-50 p-2 text-emerald-600"><ShieldCheck size={16} /></span>
        </div>
        <p className="mt-3 text-3xl font-semibold tracking-tight">{totalPermissions}</p>
        <p className="mt-1 text-xs text-slate-400">Permission được cấp cho tài khoản</p>
      </Card>
    </div>
  )
}

