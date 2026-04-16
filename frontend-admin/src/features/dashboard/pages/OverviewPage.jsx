import { Card } from '../../../components/ui/card'
import { StatsCards } from '../components/StatsCards'

export function OverviewPage({ user, users, roles, error }) {
  return (
    <>

      {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

      <StatsCards
        totalUsers={users.length}
        totalRoles={roles.length}
        totalPermissions={user.permissions.length}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-base font-semibold text-slate-900">Tổng quan hệ thống</h3>
          <p className="mt-2 text-sm text-slate-500">
            Dashboard đã tách route theo module: tổng quan, tài khoản, vai trò, dự án, cấu hình và nhật ký.
            Bạn có thể mở rộng thêm báo cáo mà không cần sửa cấu trúc tổng.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-slate-50 p-3 text-center">
              <p className="text-xs text-slate-400">Tài khoản</p>
              <p className="mt-1 text-lg font-semibold text-slate-800">{users.length}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 text-center">
              <p className="text-xs text-slate-400">Vai trò</p>
              <p className="mt-1 text-lg font-semibold text-slate-800">{roles.length}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 text-center">
              <p className="text-xs text-slate-400">Quyền</p>
              <p className="mt-1 text-lg font-semibold text-slate-800">{user.permissions.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="text-base font-semibold text-slate-900">Tài khoản hiện tại</h3>
          <p className="mt-2 text-sm text-slate-500">Email: {user.email}</p>
          <p className="mt-1 text-sm text-slate-500">Số quyền hiện có: {user.permissions.length}</p>
        </Card>
      </div>
    </>
  )
}

