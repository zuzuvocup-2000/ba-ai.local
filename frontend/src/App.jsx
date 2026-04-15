import { LoginPage } from './features/auth/LoginPage'
import { Navigate, Route, Routes } from 'react-router-dom'
import { apiRequest } from './api'
import { AdminLayout } from './features/dashboard/layout/AdminLayout'
import { OverviewPage } from './features/dashboard/pages/OverviewPage'
import { LogListPage } from './features/logs/pages/LogListPage'
import { RolesPage } from './features/roles/pages/RolesPage'
import { GeneralSettingsPage } from './features/settings/pages/GeneralSettingsPage'
import { UsersPage } from './features/users/pages/UsersPage'
import { useAdminDashboard } from './hooks/useAdminDashboard'

function App() {
  const { auth, data, userForm } = useAdminDashboard()

  const fetchSettings = async (token) => {
    return apiRequest('/settings', token)
  }

  const updateSettings = async (items, token) => {
    return apiRequest('/settings', token, {
      method: 'PUT',
      body: { items },
    })
  }

  const fetchLogs = async (type, token) => {
    return apiRequest(`/logs/${type}?limit=100`, token)
  }

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
        <Route
          path="settings/general"
          element={
            <GeneralSettingsPage
              user={auth.user}
              token={auth.token}
              onLogout={auth.logout}
              error={data.error}
              fetchSettings={fetchSettings}
              updateSettings={updateSettings}
            />
          }
        />
        <Route
          path="logs/access"
          element={
            <LogListPage
              user={auth.user}
              token={auth.token}
              onLogout={auth.logout}
              error={data.error}
              type="access"
              fetchLogs={fetchLogs}
            />
          }
        />
        <Route
          path="logs/actions"
          element={
            <LogListPage
              user={auth.user}
              token={auth.token}
              onLogout={auth.logout}
              error={data.error}
              type="action"
              fetchLogs={fetchLogs}
            />
          }
        />
        <Route
          path="logs/errors"
          element={
            <LogListPage
              user={auth.user}
              token={auth.token}
              onLogout={auth.logout}
              error={data.error}
              type="error"
              fetchLogs={fetchLogs}
            />
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/admin/overview" replace />} />
    </Routes>
  )
}

export default App
