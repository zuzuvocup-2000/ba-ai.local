import { DashboardSidebar } from './components/DashboardSidebar'
import { DashboardTopbar } from './components/DashboardTopbar'
import { StatsCards } from './components/StatsCards'
import { UserFormCard } from './components/UserFormCard'
import { UsersTableCard } from './components/UsersTableCard'

export function DashboardPage({
  user,
  roles,
  users,
  loading,
  error,
  can,
  userForm,
  setUserForm,
  onLogout,
  onSubmitUser,
  onResetUserForm,
  onEditUser,
  onDeleteUser,
}) {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute -left-20 top-0 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-40 h-72 w-72 rounded-full bg-cyan-200/40 blur-3xl" />

      <div className="relative mx-auto grid max-w-[1460px] grid-cols-1 gap-6 p-6 lg:grid-cols-[280px,1fr] lg:p-8">
        <DashboardSidebar user={user} />

        <section className="space-y-6">
          <DashboardTopbar user={user} onLogout={onLogout} />

          {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

          <StatsCards
            totalUsers={users.length}
            totalRoles={roles.length}
            totalPermissions={user.permissions.length}
          />

          <div className="grid gap-6 2xl:grid-cols-[430px,1fr]">
            <UserFormCard
              roles={roles}
              userForm={userForm}
              setUserForm={setUserForm}
              loading={loading}
              canCreate={can('users.create')}
              canEdit={can('users.edit')}
              onSubmit={onSubmitUser}
              onReset={onResetUserForm}
            />

            <UsersTableCard
              users={users}
              canEdit={can('users.edit')}
              canDelete={can('users.delete')}
              onEdit={onEditUser}
              onDelete={onDeleteUser}
            />
          </div>
        </section>
      </div>
    </main>
  )
}

