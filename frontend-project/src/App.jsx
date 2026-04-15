import { useMemo, useState } from 'react'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://ba-ai.local/api/v1'

function formatError(errorPayload) {
  if (typeof errorPayload === 'string' && errorPayload) {
    return errorPayload
  }

  if (errorPayload && typeof errorPayload.message === 'string') {
    return errorPayload.message
  }

  return 'Cannot login. Please try again.'
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
    throw new Error(formatError(payload?.message ?? payload))
  }

  return payload?.data ?? payload
}

export default function App() {
  const [loginForm, setLoginForm] = useState({
    email: 'ba@ba-ai.local',
    password: 'Ba@123456',
    system: 'project',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [session, setSession] = useState(null)

  const roleNames = useMemo(() => {
    if (!session?.user?.roles) return ''
    return session.user.roles.map((role) => role.name).join(', ')
  }, [session])

  const onSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const data = await apiRequest('/auth/login', '', {
        method: 'POST',
        body: loginForm,
      })
      setSession(data)
    } catch (requestError) {
      setError(requestError.message)
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
  }

  if (!session) {
    return (
      <main className="page">
        <section className="card">
          <h1 className="title">Project Workspace</h1>
          <p className="desc">BA/Dev đăng nhập vào hệ thống project. Admin/PM vẫn có thể truy cập.</p>
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
            </div>
            <div className="group">
              <label className="label">Password</label>
              <input
                className="input"
                type="password"
                value={loginForm.password}
                onChange={(event) => setLoginForm((prev) => ({ ...prev, password: event.target.value }))}
                required
              />
            </div>
            <button className="button" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Login to Project'}
            </button>
          </form>
        </section>
      </main>
    )
  }

  return (
    <section className="workspace">
      <header className="workspace-header">
        <div>
          <strong>BA AI - Project System</strong>
          <div className="desc">Welcome, {session.user?.name}</div>
        </div>
        <button className="button" onClick={onLogout} style={{ width: 'auto' }}>
          Logout
        </button>
      </header>
      <main className="workspace-main">
        <p>
          <span className="pill">System: {session.system}</span>
        </p>
        <p>Email: {session.user?.email}</p>
        <p>Roles: {roleNames || 'N/A'}</p>
        <p>Permissions loaded: {(session.user?.permissions || []).length}</p>
      </main>
    </section>
  )
}

