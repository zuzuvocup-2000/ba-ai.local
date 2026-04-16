import { useMemo, useState } from 'react'

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
  const [loginForm, setLoginForm] = useState({
    email: 'ba@ba-ai.local',
    password: 'Ba@123456',
    system: 'project',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [session, setSession] = useState(null)

  const roleNames = useMemo(() => {
    if (!session?.user?.roles) return ''
    return session.user.roles.map((role) => role.name).join(', ')
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

  return (
    <section className="workspace">
      <header className="workspace-header">
        <div>
          <strong>BA AI - Project System</strong>
          <div className="desc">Xin chào, {session.user?.name}</div>
        </div>
        <button className="button" onClick={onLogout} style={{ width: 'auto' }}>
          Đăng xuất
        </button>
      </header>
      <main className="workspace-main">
        <p>
          <span className="pill">Hệ thống: {session.system}</span>
        </p>
        <p>Email: {session.user?.email}</p>
        <p>Vai trò: {roleNames || 'Chưa có'}</p>
        <p>Số quyền đã nạp: {(session.user?.permissions || []).length}</p>
      </main>
    </section>
  )
}

