const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://ba-ai.local/api/v1/admin'
const SESSION_KEY = 'ba_ai_admin_session'

export const getSession = () => {
  const raw = localStorage.getItem(SESSION_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export const setSession = (token, user) => {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ token, user }))
}

export const clearSession = () => {
  localStorage.removeItem(SESSION_KEY)
}

export const apiRequest = async (path, token = '', options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.message ?? 'Có lỗi xảy ra khi gọi API.')
  }

  if (typeof data === 'object' && data !== null && 'data' in data) {
    return data.data
  }

  return data
}

