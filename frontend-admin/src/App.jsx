import { LoginPage } from './features/auth/LoginPage'
import { useCallback, useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { apiRequest } from './api'
import { AdminLayout } from './features/dashboard/layout/AdminLayout'
import { OverviewPage } from './features/dashboard/pages/OverviewPage'
import { LogListPage } from './features/logs/pages/LogListPage'
import { RolesPage } from './features/roles/pages/RolesPage'
import { GeneralSettingsPage } from './features/settings/pages/GeneralSettingsPage'
import { AiSettingsPage } from './features/settings/pages/AiSettingsPage'
import { TemplatesPage } from './features/templates/pages/TemplatesPage'
import { UsersPage } from './features/users/pages/UsersPage'
import { useAdminDashboard } from './hooks/useAdminDashboard'
import { ProjectCreatePage } from './features/projects/pages/ProjectCreatePage'
import { ProjectEditPage } from './features/projects/pages/ProjectEditPage'
import { ProjectListPage } from './features/projects/pages/ProjectListPage'
import { Toast } from './components/ui/toast'

function App() {
  const [toast, setToast] = useState(null)
  const notify = useCallback((type, message) => {
    setToast({ type, message })
  }, [])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 2600)
    return () => clearTimeout(timer)
  }, [toast])

  const { auth, data, loginState, userForm, projectForm, roleForm } = useAdminDashboard({ notify })

  const fetchSettings = async (token) => {
    return apiRequest('/settings', token)
  }

  const updateSettings = async (items, token) => {
    return apiRequest('/settings', token, {
      method: 'PUT',
      body: { items },
    })
  }

  const fetchAiSettings = async (token) => {
    return apiRequest('/settings?group=ai', token)
  }

  const updateAiSettings = async (items, token) => {
    return apiRequest('/settings', token, {
      method: 'PUT',
      body: items,
    })
  }

  const fetchTemplates = async (token) => {
    return apiRequest('/templates', token)
  }

  const createTemplate = async (data, token) => {
    return apiRequest('/templates', token, {
      method: 'POST',
      body: data,
    })
  }

  const updateTemplate = async (id, data, token) => {
    return apiRequest(`/templates/${id}`, token, {
      method: 'PUT',
      body: data,
    })
  }

  const deleteTemplate = async (id, token) => {
    return apiRequest(`/templates/${id}`, token, {
      method: 'DELETE',
    })
  }

  const setDefaultTemplate = async (id, token) => {
    return apiRequest(`/templates/${id}/set-default`, token, {
      method: 'POST',
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
    try {
      const result = await apiRequest('/auth/change-password', token, {
        method: 'PUT',
        body: payload,
      })
      notify('success', 'Đổi mật khẩu thành công.')
      return result
    } catch (error) {
      notify('error', error.message)
      throw error
    }
  }

  if (!auth.token || !auth.user) {
    return (
      <LoginPage
        loginForm={auth.loginForm}
        setLoginForm={auth.setLoginForm}
        onSubmit={auth.login}
        error={data.error}
        fieldErrors={loginState.loginErrors}
        loading={data.loading}
      />
    )
  }

  return (
    <>
      <Routes>
      <Route path="/" element={<Navigate to="/admin/overview" replace />} />
      <Route
        path="/admin"
        element={
          <AdminLayout
            user={auth.user}
            onLogout={auth.logout}
            onChangePassword={(payload) => changePassword(payload, auth.token)}
            loading={data.loading}
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
              fieldErrors={userForm.userFormErrors}
              error={data.error}
            />
          }
        />
        <Route
          path="projects"
          element={
            <ProjectListPage
              projects={data.projects}
              users={data.users}
              loading={data.loading}
              can={data.can}
              onDeleteProject={projectForm.deleteProject}
              onSyncProjectMembers={projectForm.syncProjectMembers}
              error={data.error}
            />
          }
        />
        <Route
          path="projects/create"
          element={
            <ProjectCreatePage
              loading={data.loading}
              can={data.can}
              users={data.users}
              projectForm={projectForm.projectForm}
              setProjectForm={projectForm.setProjectForm}
              onSubmitProject={projectForm.submitProject}
              onResetProjectForm={projectForm.resetProjectForm}
              fieldErrors={projectForm.projectFormErrors}
              error={data.error}
            />
          }
        />
        <Route
          path="projects/:projectId/edit"
          element={
            <ProjectEditPage
              loading={data.loading}
              can={data.can}
              users={data.users}
              projects={data.projects}
              projectForm={projectForm.projectForm}
              setProjectForm={projectForm.setProjectForm}
              onSubmitProject={projectForm.submitProject}
              onResetProjectForm={projectForm.resetProjectForm}
              onEditProject={projectForm.editProject}
              fieldErrors={projectForm.projectFormErrors}
              error={data.error}
            />
          }
        />
        <Route
          path="roles"
          element={
            <RolesPage
              roles={data.roles}
              permissions={data.permissions}
              can={data.can}
              loading={data.loading}
              onUpdatePermissions={roleForm.updateRolePermissions}
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
              onNotify={notify}
            />
          }
        />
        <Route
          path="settings/ai"
          element={
            <AiSettingsPage
              token={auth.token}
              error={data.error}
              fetchAiSettings={fetchAiSettings}
              updateAiSettings={updateAiSettings}
              onNotify={notify}
            />
          }
        />
        <Route
          path="templates"
          element={
            <TemplatesPage
              token={auth.token}
              error={data.error}
              fetchTemplates={fetchTemplates}
              createTemplate={createTemplate}
              updateTemplate={updateTemplate}
              deleteTemplate={deleteTemplate}
              setDefaultTemplate={setDefaultTemplate}
              onNotify={notify}
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
      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  )
}

export default App
