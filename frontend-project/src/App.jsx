import { useMemo, useState } from 'react'
import { Navigate, NavLink, Route, Routes, useNavigate } from 'react-router-dom'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://ba-ai.local/api/v1/user'

function formatError(errorPayload) {
  if (typeof errorPayload === 'string' && errorPayload) {
    return errorPayload
  }

  if (errorPayload && typeof errorPayload.message === 'string') {
    return errorPayload.message
  }

  return 'Không thể đăng nhập. Vui lòng thử lại.'
}

function normalizeFieldErrors(errors) {
  if (!errors || typeof errors !== 'object') {
    return {}
  }

  return Object.entries(errors).reduce((accumulator, [field, value]) => {
    if (Array.isArray(value) && value.length > 0) {
      accumulator[field] = String(value[0])
    }
    return accumulator
  }, {})
}

async function apiRequest(path, token, options = {}) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    const requestError = new Error(formatError(payload?.message ?? payload))
    requestError.errors = payload?.errors ?? null
    requestError.status = response.status
    throw requestError
  }

  return payload?.data ?? payload
}

export default function App() {
  const navigate = useNavigate()
  const [loginForm, setLoginForm] = useState({
    email: 'ba@ba-ai.local',
    password: 'Ba@123456',
    system: 'project',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [session, setSession] = useState(null)
  const [projects, setProjects] = useState([])
  const [selectedProjectId, setSelectedProjectId] = useState(null)

  const roleNames = useMemo(() => {
    if (!session?.user?.roles) return ''
    return session.user.roles.map((role) => role.name).join(', ')
  }, [session])

  const canManageBusiness = useMemo(() => {
    const roleSlugs = new Set((session?.user?.roles ?? []).map((role) => role.slug))
    return (
      roleSlugs.has('super-admin') ||
      roleSlugs.has('admin') ||
      roleSlugs.has('project-manager') ||
      roleSlugs.has('manager') ||
      roleSlugs.has('ba')
    )
  }, [session])

  const onSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setFieldErrors({})
    try {
      const data = await apiRequest('/auth/login', '', {
        method: 'POST',
        body: loginForm,
      })
      setSession(data)
      const projectData = await apiRequest('/projects', data.token)
      setProjects(projectData)
      setSelectedProjectId(projectData[0]?.id ?? null)
      navigate('/workspace/chon-du-an')
    } catch (requestError) {
      setError(requestError.message)
      if (requestError && typeof requestError === 'object' && 'errors' in requestError) {
        setFieldErrors(normalizeFieldErrors(requestError.errors))
      }
    } finally {
      setLoading(false)
    }
  }

  const onLogout = async () => {
    if (!session?.token) {
      setSession(null)
      return
    }
    await apiRequest('/auth/logout', session.token, { method: 'POST' }).catch(() => null)
    setSession(null)
    setProjects([])
    setSelectedProjectId(null)
    navigate('/')
  }

  if (!session) {
    return (
      <main className="page">
        <section className="card">
          <h1 className="title">Không gian dự án</h1>
          <p className="desc">BA/Dev đăng nhập vào hệ thống dự án. Admin/PM vẫn có thể truy cập.</p>
          <form onSubmit={onSubmit}>
            {error ? <p className="alert">{error}</p> : null}
            <div className="group">
              <label className="label">Email</label>
              <input
                className="input"
                type="email"
                value={loginForm.email}
                onChange={(event) => setLoginForm((prev) => ({ ...prev, email: event.target.value }))}
                required
              />
              {fieldErrors.email ? <p className="field-error">{fieldErrors.email}</p> : null}
            </div>
            <div className="group">
              <label className="label">Mật khẩu</label>
              <input
                className="input"
                type="password"
                value={loginForm.password}
                onChange={(event) => setLoginForm((prev) => ({ ...prev, password: event.target.value }))}
                required
              />
              {fieldErrors.password ? <p className="field-error">{fieldErrors.password}</p> : null}
            </div>
            <button className="button" type="submit" disabled={loading}>
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập hệ thống dự án'}
            </button>
          </form>
        </section>
      </main>
    )
  }

  const selectedProject = projects.find((project) => project.id === selectedProjectId) ?? null

  return (
    <section className="workspace">
      <header className="workspace-header">
        <div>
          <strong>AI Business Analyst Assistant - Hệ thống dự án</strong>
          <div className="desc">Xin chào, {session.user?.name}</div>
        </div>
        <button className="button" onClick={onLogout} style={{ width: 'auto' }}>
          Đăng xuất
        </button>
      </header>
      <main className="workspace-main">
        <p><span className="pill">Hệ thống: {session.system}</span></p>
        <p>Email: {session.user?.email}</p>
        <p>Vai trò: {roleNames || 'Chưa có'}</p>

        <div className="tabs">
          <NavLink to="/workspace/chon-du-an" className={({ isActive }) => `tab ${isActive ? 'tab-active' : ''}`}>Chọn dự án</NavLink>
          <NavLink to="/workspace/flow" className={({ isActive }) => `tab ${isActive ? 'tab-active' : ''}`}>Flow</NavLink>
          <NavLink to="/workspace/db" className={({ isActive }) => `tab ${isActive ? 'tab-active' : ''}`}>DB</NavLink>
          <NavLink to="/workspace/detail-design" className={({ isActive }) => `tab ${isActive ? 'tab-active' : ''}`}>Detail design</NavLink>
        </div>

        <Routes>
          <Route
            path="/workspace/chon-du-an"
            element={(
              <div className="panel">
                <h3>Chọn dự án</h3>
                {!projects.length && <p>Không có dự án nào được gán cho tài khoản hiện tại.</p>}
                {projects.length > 0 && (
                  <select
                    className="input"
                    value={selectedProjectId ?? ''}
                    onChange={(event) => setSelectedProjectId(Number(event.target.value))}
                  >
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.code} - {project.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}
          />
          <Route
            path="/workspace/flow"
            element={(
              <div className="panel">
                <h3>Flow</h3>
                {!canManageBusiness ? <p>Bạn không có quyền truy cập chức năng nghiệp vụ.</p> : <p>Dự án: {selectedProject?.name ?? 'Chưa chọn dự án'}</p>}
              </div>
            )}
          />
          <Route
            path="/workspace/db"
            element={(
              <div className="panel">
                <h3>DB</h3>
                {!canManageBusiness ? <p>Bạn không có quyền truy cập chức năng nghiệp vụ.</p> : <p>Dự án: {selectedProject?.name ?? 'Chưa chọn dự án'}</p>}
              </div>
            )}
          />
          <Route
            path="/workspace/detail-design"
            element={(
              <div className="panel">
                <h3>Detail design</h3>
                {!canManageBusiness ? <p>Bạn không có quyền truy cập chức năng nghiệp vụ.</p> : <p>Dự án: {selectedProject?.name ?? 'Chưa chọn dự án'}</p>}
              </div>
            )}
          />
          <Route path="*" element={<Navigate to="/workspace/chon-du-an" replace />} />
        </Routes>
      </main>
    </section>
  )
}

