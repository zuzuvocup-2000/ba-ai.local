import { useState, useEffect } from 'react'
import api, { getSession, clearSession } from '../api'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const session = getSession()
    if (!session?.token) {
      setLoading(false)
      return
    }

    api.me(session.token)
      .then((userData) => {
        setUser({ ...userData, token: session.token })
      })
      .catch(() => {
        clearSession()
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const logout = async () => {
    const session = getSession()
    if (session?.token) {
      await api.logout(session.token).catch(() => null)
    }
    clearSession()
    setUser(null)
  }

  return { user, loading, logout }
}
