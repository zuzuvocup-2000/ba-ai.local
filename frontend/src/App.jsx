import { useEffect, useMemo, useState } from 'react'
import { ShieldCheck, Users, UserCog, LayoutDashboard, LogOut } from 'lucide-react'
import { apiRequest, clearSession, getSession, setSession } from './api'
import { Card } from './components/ui/card'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { Badge } from './components/ui/badge'

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

  const totalUsers = users.length
  const totalRoles = roles.length

  if (!token || !user) {
    return (
      <main className="grid min-h-screen place-items-center px-4">
        <Card className="w-full max-w-md p-8">
          <div className="mb-6 space-y-2 text-center">
            <p className="text-sm text-slate-500">BA AI Platform</p>
            <h1 className="text-2xl font-semibold text-slate-900">Admin Console</h1>
            <p className="text-sm text-slate-500">Đăng nhập để quản trị người dùng và phân quyền.</p>
          </div>
          <form className="space-y-4" onSubmit={handleLogin}>
            {error && <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
            <div className="space-y-1">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={loginForm.email}
                onChange={(event) => setLoginForm({ ...loginForm, email: event.target.value })}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Mật khẩu</label>
              <Input
                type="password"
                value={loginForm.password}
                onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })}
                required
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Đang xử lý...' : 'Đăng nhập'}
            </Button>
          </form>
        </Card>
      </main>
    )
  }

  return (
    <main className="min-h-screen">
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-6 p-6 lg:grid-cols-[250px,1fr]">
        <aside className="space-y-4">
          <Card className="p-4">
            <h2 className="mb-1 text-lg font-semibold text-slate-900">BA AI</h2>
            <p className="mb-4 text-sm text-slate-500">Admin Navigation</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 rounded-md bg-slate-900 px-3 py-2 text-sm text-white">
                <LayoutDashboard size={16} />
                Dashboard
              </div>
              <div className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-600">
                <Users size={16} />
                User Management
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-slate-500">Đăng nhập với</p>
            <p className="mt-1 text-sm font-medium">{user.email}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {user.roles.map((role) => (
                <Badge key={role.id}>{role.name}</Badge>
              ))}
            </div>
          </Card>
        </aside>

        <section className="space-y-6">
          <Card className="flex flex-wrap items-center justify-between gap-4 p-5">
            <div>
              <p className="text-sm text-slate-500">Welcome back</p>
              <h1 className="text-2xl font-semibold text-slate-900">{user.name}</h1>
            </div>
            <Button variant="secondary" onClick={handleLogout}>
              <LogOut size={16} className="mr-2" />
              Đăng xuất
            </Button>
          </Card>

          {error && <p className="rounded-md border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">{error}</p>}

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="p-4">
              <p className="text-sm text-slate-500">Tổng users</p>
              <p className="mt-2 text-2xl font-semibold">{totalUsers}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-slate-500">Vai trò hệ thống</p>
              <p className="mt-2 text-2xl font-semibold">{totalRoles}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-slate-500">Quyền của bạn</p>
              <p className="mt-2 text-2xl font-semibold">{user.permissions.length}</p>
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-[420px,1fr]">
            <Card className="p-5">
              <h3 className="mb-1 flex items-center gap-2 text-lg font-semibold"><UserCog size={18} /> User Form</h3>
              <p className="mb-4 text-sm text-slate-500">Tạo mới hoặc cập nhật tài khoản.</p>
              <form onSubmit={handleSubmitUser} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Họ tên</label>
                  <Input
                    value={userForm.name}
                    onChange={(event) => setUserForm({ ...userForm, name: event.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    value={userForm.email}
                    onChange={(event) => setUserForm({ ...userForm, email: event.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Mật khẩu</label>
                  <Input
                    type="password"
                    value={userForm.password}
                    onChange={(event) => setUserForm({ ...userForm, password: event.target.value })}
                    required={!userForm.id}
                    placeholder={userForm.id ? 'Để trống nếu không đổi' : ''}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Vai trò</label>
                  <select
                    className="min-h-28 w-full rounded-md border border-slate-300 bg-white p-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
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
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    type="submit"
                    disabled={loading || (!can('users.create') && !userForm.id) || (!can('users.edit') && !!userForm.id)}
                  >
                    {userForm.id ? 'Cập nhật' : 'Tạo user'}
                  </Button>
                  <Button type="button" variant="secondary" onClick={resetForm}>Reset</Button>
                </div>
              </form>
            </Card>

            <Card className="p-5">
              <h3 className="mb-1 flex items-center gap-2 text-lg font-semibold"><ShieldCheck size={18} /> User Permissions</h3>
              <p className="mb-4 text-sm text-slate-500">Danh sách tài khoản và quyền hiện tại.</p>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-slate-500">
                    <tr className="border-b">
                      <th className="px-2 py-2">Tên</th>
                      <th className="px-2 py-2">Email</th>
                      <th className="px-2 py-2">Vai trò</th>
                      <th className="px-2 py-2">Quyền</th>
                      <th className="px-2 py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((item) => (
                      <tr key={item.id} className="border-b last:border-b-0">
                        <td className="px-2 py-3 font-medium">{item.name}</td>
                        <td className="px-2 py-3 text-slate-600">{item.email}</td>
                        <td className="px-2 py-3">{item.roles.map((role) => role.name).join(', ')}</td>
                        <td className="px-2 py-3">{item.permissions.join(', ')}</td>
                        <td className="px-2 py-3">
                          <div className="flex gap-2">
                            <Button type="button" variant="secondary" onClick={() => handleEditUser(item)} disabled={!can('users.edit')}>Sửa</Button>
                            <Button type="button" variant="danger" onClick={() => handleDeleteUser(item.id)} disabled={!can('users.delete')}>Xóa</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!users.length && <p className="py-4 text-center text-sm text-slate-500">Không có dữ liệu user.</p>}
              </div>
            </Card>
          </div>
        </section>
      </div>
    </main>
  )
}

export default App
