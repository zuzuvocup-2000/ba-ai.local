import { Outlet } from 'react-router-dom'
import { DashboardSidebar } from '../components/DashboardSidebar'

export function AdminLayout({ user }) {
  return (
    <main className="relative min-h-screen overflow-x-auto overflow-y-hidden">
      <div className="pointer-events-none absolute -left-20 top-0 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-40 h-72 w-72 rounded-full bg-cyan-200/40 blur-3xl" />

      <div className="relative mx-auto grid min-w-[1180px] max-w-[1460px] grid-cols-[280px,minmax(0,1fr)] gap-6 p-6 lg:p-8">
        <div className="sticky top-6 h-fit">
          <DashboardSidebar user={user} />
        </div>
        <section className="min-w-0 space-y-6">
          <Outlet />
        </section>
      </div>
    </main>
  )
}

