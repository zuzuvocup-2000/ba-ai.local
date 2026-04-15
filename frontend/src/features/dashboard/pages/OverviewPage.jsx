import { Card } from '../../../components/ui/card'
import { DashboardTopbar } from '../components/DashboardTopbar'
import { StatsCards } from '../components/StatsCards'

export function OverviewPage({ user, users, roles, onLogout, error }) {
  return (
    <>
      <DashboardTopbar
        user={user}
        onLogout={onLogout}
        title="Admin Overview"
        subtitle="Theo dõi nhanh trạng thái hệ thống và quyền truy cập"
      />

      {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

      <StatsCards
        totalUsers={users.length}
        totalRoles={roles.length}
        totalPermissions={user.permissions.length}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-base font-semibold text-slate-900">System Summary</h3>
          <p className="mt-2 text-sm text-slate-500">
            Dashboard này đã tách route theo module: overview, users và roles. Bạn có thể mở rộng thêm audit logs, reports
            hoặc settings mà không cần sửa cấu trúc tổng.
          </p>
        </Card>
        <Card className="p-6">
          <h3 className="text-base font-semibold text-slate-900">Current Account</h3>
          <p className="mt-2 text-sm text-slate-500">Email: {user.email}</p>
          <p className="mt-1 text-sm text-slate-500">Số quyền hiện có: {user.permissions.length}</p>
        </Card>
      </div>
    </>
  )
}

