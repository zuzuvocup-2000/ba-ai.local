import { LoginPage } from './features/auth/LoginPage'
import { Navigate, Route, Routes } from 'react-router-dom'
import { apiRequest } from './api'
import { AdminLayout } from './features/dashboard/layout/AdminLayout'
import { OverviewPage } from './features/dashboard/pages/OverviewPage'
import { LogListPage } from './features/logs/pages/LogListPage'
import { ProjectsPage } from './features/projects/pages/ProjectsPage'
import { RolesPage } from './features/roles/pages/RolesPage'
import { GeneralSettingsPage } from './features/settings/pages/GeneralSettingsPage'
import { UsersPage } from './features/users/pages/UsersPage'
import { useAdminDashboard } from './hooks/useAdminDashboard'

function App() {
  const { auth, data, userForm, projectForm } = useAdminDashboard()

  const fetchSettings = async (token) => {
    return apiRequest('/settings', token)
  }

  const updateSettings = async (items, token) => {
    return apiRequest('/settings', token, {
      method: 'PUT',
      body: { items },
    })
  }

  const fetchLogs = async (type, token, params = {}) => {
    const query = new URLSearchParams({
      page: String(params.page ?? 1),
      per_page: String(params.perPage ?? 10),
      ...(params.search ? { search: params.search } : {}),
    })
    return apiRequest(`/logs/${type}?${query.toString()}`, token)
  }

  const changePassword = async (payload, token) => {
    return apiRequest('/auth/change-password', token, {
      method: 'PUT',
      body: payload,
    })
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
      <Route
        path="/admin"
        element={
          <AdminLayout
            user={auth.user}
            onLogout={auth.logout}
            onChangePassword={(payload) => changePassword(payload, auth.token)}
          />
        }
      >
        <Route
          path="overview"
          element={
            <OverviewPage
              user={auth.user}
              users={data.users}
              roles={data.roles}
              error={data.error}
            />
          }
        />
        <Route
          path="users"
          element={
            <UsersPage
              roles={data.roles}
              users={data.users}
              loading={data.loading}
              can={data.can}
              userForm={userForm.userForm}
              setUserForm={userForm.setUserForm}
              onSubmitUser={userForm.submitUser}
              onResetUserForm={userForm.resetUserForm}
              onEditUser={userForm.editUser}
              onDeleteUser={userForm.deleteUser}
              error={data.error}
            />
          }
        />
        <Route
          path="projects"
          element={
            <ProjectsPage
              projects={data.projects}
              users={data.users}
              loading={data.loading}
              can={data.can}
              projectForm={projectForm.projectForm}
              setProjectForm={projectForm.setProjectForm}
              onSubmitProject={projectForm.submitProject}
              onResetProjectForm={projectForm.resetProjectForm}
              onEditProject={projectForm.editProject}
              onDeleteProject={projectForm.deleteProject}
              onSyncProjectMembers={projectForm.syncProjectMembers}
              error={data.error}
            />
          }
        />
        <Route
          path="roles"
          element={
            <RolesPage
              roles={data.roles}
              error={data.error}
            />
          }
        />
        <Route
          path="settings/general"
          element={
            <GeneralSettingsPage
              token={auth.token}
              error={data.error}
              fetchSettings={fetchSettings}
              updateSettings={updateSettings}
            />
          }
        />
        <Route
          path="logs/login"
          element={
            <LogListPage
              token={auth.token}
              error={data.error}
              type="login"
              fetchLogs={fetchLogs}
            />
          }
        />
        <Route
          path="logs/access"
          element={
            <LogListPage
              token={auth.token}
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
              token={auth.token}
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
              token={auth.token}
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
