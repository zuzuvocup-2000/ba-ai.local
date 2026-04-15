import { LoginPage } from './features/auth/LoginPage'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminLayout } from './features/dashboard/layout/AdminLayout'
import { OverviewPage } from './features/dashboard/pages/OverviewPage'
import { RolesPage } from './features/roles/pages/RolesPage'
import { UsersPage } from './features/users/pages/UsersPage'
import { useAdminDashboard } from './hooks/useAdminDashboard'

function App() {
  const { auth, data, userForm } = useAdminDashboard()

  if (!auth.token || !auth.user) {
    return (
      <LoginPage
        loginForm={auth.loginForm}
        setLoginForm={auth.setLoginForm}
        onSubmit={auth.login}
        error={data.error}
        loading={data.loading}
      />
    )
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin/overview" replace />} />
      <Route path="/admin" element={<AdminLayout user={auth.user} />}>
        <Route
          path="overview"
          element={
            <OverviewPage
              user={auth.user}
              users={data.users}
              roles={data.roles}
              onLogout={auth.logout}
              error={data.error}
            />
          }
        />
        <Route
          path="users"
          element={
            <UsersPage
              user={auth.user}
              roles={data.roles}
              users={data.users}
              loading={data.loading}
              can={data.can}
              userForm={userForm.userForm}
              setUserForm={userForm.setUserForm}
              onLogout={auth.logout}
              onSubmitUser={userForm.submitUser}
              onResetUserForm={userForm.resetUserForm}
              onEditUser={userForm.editUser}
              onDeleteUser={userForm.deleteUser}
              error={data.error}
            />
          }
        />
        <Route
          path="roles"
          element={
            <RolesPage
              user={auth.user}
              roles={data.roles}
              onLogout={auth.logout}
              error={data.error}
            />
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/admin/overview" replace />} />
    </Routes>
  )
}

export default App
