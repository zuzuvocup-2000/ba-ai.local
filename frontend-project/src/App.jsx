import { Routes, Route, Navigate } from 'react-router-dom'
import { getSession } from './api'
import { LoginPage } from './features/auth/LoginPage'
import { ProjectsPage } from './features/projects/ProjectsPage'
import { GroupsPage } from './features/groups/GroupsPage'
import { RequirementDetailPage } from './features/requirements/RequirementDetailPage'

// ── Protected route wrapper ──────────────────────────────────────────────────
function Protected({ children }) {
  const session = getSession()
  if (!session?.token) {
    return <Navigate to="/login" replace />
  }
  return children
}

// ── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected */}
      <Route
        path="/projects"
        element={
          <Protected>
            <ProjectsPage />
          </Protected>
        }
      />
      <Route
        path="/projects/:projectId/groups"
        element={
          <Protected>
            <GroupsPage />
          </Protected>
        }
      />
      <Route
        path="/projects/:projectId/groups/:groupId"
        element={
          <Protected>
            <GroupsPage />
          </Protected>
        }
      />
      <Route
        path="/projects/:projectId/requirements/:requirementId"
        element={
          <Protected>
            <RequirementDetailPage />
          </Protected>
        }
      />

      {/* Fallback: redirect root → /projects */}
      <Route path="/" element={<Navigate to="/projects" replace />} />
      <Route path="*" element={<Navigate to="/projects" replace />} />
    </Routes>
  )
}
