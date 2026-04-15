import { Outlet } from 'react-router-dom'
import { DashboardSidebar } from '../components/DashboardSidebar'

export function AdminLayout({ user }) {
  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <div className="pointer-events-none absolute -left-20 top-0 h-80 w-80 rounded-full bg-indigo-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-40 h-80 w-80 rounded-full bg-sky-300/30 blur-3xl" />

      <div className="relative grid min-h-screen w-full grid-cols-[250px_minmax(0,1fr)] gap-0">
        <div className="sticky top-0 h-screen pl-0 pr-5 py-6">
          <DashboardSidebar user={user} />
        </div>
        <section className="min-w-0 space-y-6 px-6 py-6 xl:px-8 xl:py-8">
          <Outlet />
        </section>
      </div>
    </main>
  )
}

