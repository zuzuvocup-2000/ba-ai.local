import { Outlet } from 'react-router-dom'
import { DashboardSidebar } from '../components/DashboardSidebar'

export function AdminLayout({ user, onLogout, onChangePassword, loading }) {
  return (
    <main className="relative h-screen overflow-hidden">
      <div className="pointer-events-none absolute -left-20 top-0 h-80 w-80 rounded-full bg-indigo-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-40 h-80 w-80 rounded-full bg-sky-300/30 blur-3xl" />

      <div className="relative grid h-screen w-full grid-cols-[250px_minmax(0,1fr)] gap-0">
        <div className="h-screen pl-0 pr-5 py-6">
          <DashboardSidebar
            user={user}
            onLogout={onLogout}
            onChangePassword={onChangePassword}
          />
        </div>
        <section className="min-w-0 overflow-y-auto">
          <div className="space-y-6 px-6 py-6 xl:px-8 xl:py-8">
            <Outlet />
          </div>
        </section>
      </div>
      {loading && (
        <div className="pointer-events-none absolute inset-0 z-[9997] bg-slate-900/10 backdrop-blur-[1px]">
          <div className="grid h-full place-items-center">
            <div className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow">
              Đang tải dữ liệu...
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

