import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { apiRequest, clearSession, getSession, setSession } from './api'

function App() {
  const [token, setToken] = useState(getSession()?.token ?? '')
  const [user, setUser] = useState(getSession()?.user ?? null)
  const [roles, setRoles] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [loginForm, setLoginForm] = useState({ email: 'admin@ba-ai.local', password: 'Admin@123' })
  const [userForm, setUserForm] = useState({ id: null, name: '', email: '', password: '', role_ids: [] })

  const can = useMemo(() => {
    const permissions = new Set(user?.permissions ?? [])
    return (permission) => permissions.has(permission)
  }, [user])

  const fetchBootstrap = async (activeToken) => {
    const [meData, roleData] = await Promise.all([
      apiRequest('/auth/me', activeToken),
      apiRequest('/roles', activeToken),
    ])

    setUser(meData)
    setRoles(roleData)
    setSession(activeToken, meData)

    if (meData.permissions.includes('users.view')) {
      const userData = await apiRequest('/users', activeToken)
      setUsers(userData)
    }
  }

  useEffect(() => {
    if (!token) return

    setLoading(true)
    fetchBootstrap(token)
      .catch(() => {
        setError('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.')
        setToken('')
        setUser(null)
        clearSession()
      })
      .finally(() => setLoading(false))
  }, [token])

  const handleLogin = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const response = await apiRequest('/auth/login', '', {
        method: 'POST',
        body: loginForm,
      })
      setToken(response.token)
      setUser(response.user)
      setSession(response.token, response.user)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    if (token) {
      await apiRequest('/auth/logout', token, { method: 'POST' }).catch(() => null)
    }
    clearSession()
    setToken('')
    setUser(null)
    setUsers([])
  }

  const resetForm = () => {
    setUserForm({ id: null, name: '', email: '', password: '', role_ids: [] })
  }

  const handleEditUser = (selectedUser) => {
    setUserForm({
      id: selectedUser.id,
      name: selectedUser.name,
      email: selectedUser.email,
      password: '',
      role_ids: selectedUser.roles.map((role) => role.id),
    })
  }

  const refreshUsers = async () => {
    if (!can('users.view')) return
    const data = await apiRequest('/users', token)
    setUsers(data)
  }

  const handleSubmitUser = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const body = {
        name: userForm.name,
        email: userForm.email,
        role_ids: userForm.role_ids,
      }
      if (userForm.password) {
        body.password = userForm.password
      }

      if (!userForm.id) {
        body.password = userForm.password
        await apiRequest('/users', token, { method: 'POST', body })
      } else {
        await apiRequest(`/users/${userForm.id}`, token, { method: 'PUT', body })
      }

      await refreshUsers()
      resetForm()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xoá tài khoản này?')) return
    setLoading(true)
    setError('')
    try {
      await apiRequest(`/users/${id}`, token, { method: 'DELETE' })
      await refreshUsers()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  if (!token || !user) {
    return (
      <main className="login-shell">
        <form className="card login-card" onSubmit={handleLogin}>
          <h1>BA AI Admin</h1>
          <p className="muted">Đăng nhập để quản trị hệ thống.</p>
          {error && <p className="error-text">{error}</p>}
          <label>
            Email
            <input
              type="email"
              value={loginForm.email}
              onChange={(event) => setLoginForm({ ...loginForm, email: event.target.value })}
              required
            />
          </label>
          <label>
            Mật khẩu
            <input
              type="password"
              value={loginForm.password}
              onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })}
              required
            />
          </label>
          <button type="submit" disabled={loading}>{loading ? 'Đang xử lý...' : 'Đăng nhập'}</button>
        </form>
      </main>
    )
  }

  return (
    <main className="admin-shell">
      <header className="topbar card">
        <div>
          <h2>BA AI Admin Console</h2>
          <p className="muted">Xin chào, {user.name}</p>
        </div>
        <div className="topbar-actions">
          <span className="badge">{user.roles.map((role) => role.name).join(', ')}</span>
          <button type="button" onClick={handleLogout}>Đăng xuất</button>
        </div>
      </header>

      {error && <p className="error-banner">{error}</p>}

      <section className="grid">
        <article className="card">
          <h3>Tạo / Cập nhật user</h3>
          <form onSubmit={handleSubmitUser} className="form-grid">
            <label>
              Họ tên
              <input
                value={userForm.name}
                onChange={(event) => setUserForm({ ...userForm, name: event.target.value })}
                required
              />
            </label>
            <label>
              Email
              <input
                type="email"
                value={userForm.email}
                onChange={(event) => setUserForm({ ...userForm, email: event.target.value })}
                required
              />
            </label>
            <label>
              Mật khẩu {userForm.id ? '(để trống nếu không đổi)' : ''}
              <input
                type="password"
                value={userForm.password}
                onChange={(event) => setUserForm({ ...userForm, password: event.target.value })}
                required={!userForm.id}
              />
            </label>
            <label>
              Vai trò
              <select
                multiple
                value={userForm.role_ids}
                onChange={(event) => {
                  const selectedValues = Array.from(event.target.selectedOptions).map((option) => Number(option.value))
                  setUserForm({ ...userForm, role_ids: selectedValues })
                }}
                required
              >
                {roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
              </select>
            </label>
            <div className="inline-actions">
              <button type="submit" disabled={loading || (!can('users.create') && !userForm.id) || (!can('users.edit') && !!userForm.id)}>
                {userForm.id ? 'Cập nhật user' : 'Tạo user'}
              </button>
              <button type="button" className="secondary" onClick={resetForm}>Reset</button>
            </div>
          </form>
        </article>

        <article className="card">
          <h3>Quản lý user</h3>
          {loading && <p className="muted">Đang tải dữ liệu...</p>}
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên</th>
                  <th>Email</th>
                  <th>Vai trò</th>
                  <th>Quyền</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {users.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.name}</td>
                    <td>{item.email}</td>
                    <td>{item.roles.map((role) => role.name).join(', ')}</td>
                    <td>{item.permissions.join(', ')}</td>
                    <td className="inline-actions">
                      <button type="button" className="secondary" onClick={() => handleEditUser(item)} disabled={!can('users.edit')}>Sửa</button>
                      <button type="button" className="danger" onClick={() => handleDeleteUser(item.id)} disabled={!can('users.delete')}>Xoá</button>
                    </td>
                  </tr>
                ))}
                {!users.length && (
                  <tr>
                    <td colSpan="6" className="muted">Không có dữ liệu user.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </main>
  )
}

export default App
