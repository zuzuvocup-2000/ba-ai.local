import { useCallback, useEffect, useMemo, useState } from 'react'
import { apiRequest, clearSession, getSession, setSession } from '../api'

const initialLoginForm = { email: 'admin@ba-ai.local', password: 'Admin@123', system: 'admin' }
const initialUserForm = { id: null, name: '', email: '', password: '', role_ids: [] }

export function useAdminDashboard() {
  const [token, setToken] = useState(getSession()?.token ?? '')
  const [user, setUser] = useState(getSession()?.user ?? null)
  const [roles, setRoles] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [loginForm, setLoginForm] = useState(initialLoginForm)
  const [userForm, setUserForm] = useState(initialUserForm)

  const can = useMemo(() => {
    const permissions = new Set(user?.permissions ?? [])
    return (permission) => permissions.has(permission)
  }, [user])

  const resetUserForm = useCallback(() => {
    setUserForm(initialUserForm)
  }, [])

  const refreshUsers = useCallback(async (activeToken, canViewUsers) => {
    if (!canViewUsers) return []
    const data = await apiRequest('/users', activeToken)
    setUsers(data)
    return data
  }, [])

  const fetchBootstrap = useCallback(async (activeToken) => {
    const [meData, roleData] = await Promise.all([
      apiRequest('/auth/me', activeToken),
      apiRequest('/roles', activeToken),
    ])

    setUser(meData)
    setRoles(roleData)
    setSession(activeToken, meData)

    if (meData.permissions.includes('users.view')) {
      await refreshUsers(activeToken, true)
    } else {
      setUsers([])
    }
  }, [refreshUsers])

  useEffect(() => {
    if (!token) return

    setLoading(true)
    fetchBootstrap(token)
      .catch(() => {
        setError('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.')
        clearSession()
        setToken('')
        setUser(null)
        setRoles([])
        setUsers([])
      })
      .finally(() => setLoading(false))
  }, [token, fetchBootstrap])

  const login = async (event) => {
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

  const logout = async () => {
    if (token) {
      await apiRequest('/auth/logout', token, { method: 'POST' }).catch(() => null)
    }
    clearSession()
    setToken('')
    setUser(null)
    setRoles([])
    setUsers([])
    resetUserForm()
  }

  const editUser = (selectedUser) => {
    setUserForm({
      id: selectedUser.id,
      name: selectedUser.name,
      email: selectedUser.email,
      password: '',
      role_ids: selectedUser.roles.map((role) => role.id),
    })
  }

  const submitUser = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const payload = {
        name: userForm.name,
        email: userForm.email,
        role_ids: userForm.role_ids,
      }

      if (userForm.password) {
        payload.password = userForm.password
      }

      if (!userForm.id) {
        await apiRequest('/users', token, { method: 'POST', body: payload })
      } else {
        await apiRequest(`/users/${userForm.id}`, token, { method: 'PUT', body: payload })
      }

      await refreshUsers(token, can('users.view'))
      resetUserForm()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  const deleteUser = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xoá tài khoản này?')) return
    setLoading(true)
    setError('')

    try {
      await apiRequest(`/users/${id}`, token, { method: 'DELETE' })
      await refreshUsers(token, can('users.view'))
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  return {
    auth: { token, user, loginForm, setLoginForm, login, logout },
    data: { roles, users, loading, error, setError, can },
    userForm: { userForm, setUserForm, resetUserForm, editUser, submitUser, deleteUser },
  }
}

