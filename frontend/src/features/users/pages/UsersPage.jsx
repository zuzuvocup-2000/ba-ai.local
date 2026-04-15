import { DashboardTopbar } from '../../dashboard/components/DashboardTopbar'
import { UserFormCard } from '../../dashboard/components/UserFormCard'
import { UsersTableCard } from '../../dashboard/components/UsersTableCard'

export function UsersPage({
  user,
  roles,
  users,
  loading,
  can,
  userForm,
  setUserForm,
  onLogout,
  onSubmitUser,
  onResetUserForm,
  onEditUser,
  onDeleteUser,
  error,
}) {
  return (
    <>
      <DashboardTopbar
        user={user}
        onLogout={onLogout}
        title="User Management"
        subtitle="Quản lý tài khoản, vai trò và phân quyền thao tác"
      />

      {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

      <div className="grid gap-6 2xl:grid-cols-[430px_1fr]">
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
    </>
  )
}

