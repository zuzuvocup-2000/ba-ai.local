import { Card } from '../../../components/ui/card'
import { ShieldCheck, Sparkles, Users } from 'lucide-react'

export function StatsCards({ totalUsers, totalRoles, totalPermissions }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="border-blue-100 bg-gradient-to-br from-blue-50/80 to-white p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-slate-600">Tổng users</p>
          <span className="rounded-lg bg-blue-50 p-2 text-blue-600"><Users size={16} /></span>
        </div>
        <p className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">{totalUsers}</p>
        <p className="mt-1 text-xs text-slate-400">Tài khoản đang có trong hệ thống</p>
      </Card>
      <Card className="border-violet-100 bg-gradient-to-br from-violet-50/80 to-white p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-slate-600">Vai trò hệ thống</p>
          <span className="rounded-lg bg-violet-50 p-2 text-violet-600"><Sparkles size={16} /></span>
        </div>
        <p className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">{totalRoles}</p>
        <p className="mt-1 text-xs text-slate-400">Role đang được cấu hình</p>
      </Card>
      <Card className="border-emerald-100 bg-gradient-to-br from-emerald-50/80 to-white p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-slate-600">Quyền của bạn</p>
          <span className="rounded-lg bg-emerald-50 p-2 text-emerald-600"><ShieldCheck size={16} /></span>
        </div>
        <p className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">{totalPermissions}</p>
        <p className="mt-1 text-xs text-slate-400">Permission được cấp cho tài khoản</p>
      </Card>
    </div>
  )
}

