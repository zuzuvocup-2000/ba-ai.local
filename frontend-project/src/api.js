const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://ba-ai.local/api/v1/user'
const API_BASE_URL = rawApiBaseUrl.includes('/api/v1/user')
  ? rawApiBaseUrl
  : rawApiBaseUrl.replace('/api/v1', '/api/v1/user')

export const SESSION_KEY = 'ba_ai_user_session'

export class ApiRequestError extends Error {
  constructor(message, errors = null, status = 500) {
    super(message)
    this.name = 'ApiRequestError'
    this.errors = errors
    this.status = status
  }
}

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
    throw new ApiRequestError(
      data.message ?? 'Có lỗi xảy ra khi gọi API.',
      data.errors ?? null,
      response.status
    )
  }

  if (typeof data === 'object' && data !== null && 'data' in data) {
    return data.data
  }

  return data
}

// ── Auth ──────────────────────────────────────────────────────────────────────
const api = {
  login: (body) => apiRequest('/auth/login', '', { method: 'POST', body }),

  logout: (token) => apiRequest('/auth/logout', token, { method: 'POST' }),

  me: (token) => apiRequest('/auth/me', token),

  // ── Projects ────────────────────────────────────────────────────────────────
  getProjects: (token) => apiRequest('/projects', token),

  // ── Groups ──────────────────────────────────────────────────────────────────
  getGroups: (token, projectId) => apiRequest(`/projects/${projectId}/groups`, token),

  createGroup: (token, data) => apiRequest('/groups', token, { method: 'POST', body: data }),

  updateGroup: (token, id, data) => apiRequest(`/groups/${id}`, token, { method: 'PUT', body: data }),

  deleteGroup: (token, id) => apiRequest(`/groups/${id}`, token, { method: 'DELETE' }),

  reorderGroups: (token, data) => apiRequest('/groups/reorder', token, { method: 'POST', body: data }),

  // ── Requirements ────────────────────────────────────────────────────────────
  getRequirements: (token, projectId, filters = {}) => {
    const params = new URLSearchParams({ project_id: projectId, ...filters }).toString()
    return apiRequest(`/requirements?${params}`, token)
  },

  createRequirement: (token, data) => apiRequest('/requirements', token, { method: 'POST', body: data }),

  updateRequirement: (token, id, data) => apiRequest(`/requirements/${id}`, token, { method: 'PUT', body: data }),

  deleteRequirement: (token, id) => apiRequest(`/requirements/${id}`, token, { method: 'DELETE' }),

  moveRequirementGroup: (token, id, data) =>
    apiRequest(`/requirements/${id}/move-group`, token, { method: 'POST', body: data }),

  getRequirement: (token, id) => apiRequest(`/requirements/${id}`, token),

  // ── Analyses ────────────────────────────────────────────────────────────────
  getAnalysis: (token, requirementId, type) =>
    apiRequest(`/analyses?requirement_id=${requirementId}&type=${type}`, token),

  upsertAnalysis: (token, data) => apiRequest('/analyses', token, { method: 'POST', body: data }),

  deleteAnalysis: (token, id) => apiRequest(`/analyses/${id}`, token, { method: 'DELETE' }),

  // ── Documents ────────────────────────────────────────────────────────────────
  listDocuments: (token, requirementId) =>
    apiRequest(`/documents?requirement_id=${requirementId}`, token),

  getDocument: (token, id) => apiRequest(`/documents/${id}`, token),

  updateDocument: (token, id, data) =>
    apiRequest(`/documents/${id}`, token, { method: 'PUT', body: data }),

  deleteDocument: (token, id) =>
    apiRequest(`/documents/${id}`, token, { method: 'DELETE' }),

  generateDocument: (token, requirementId, documentType) =>
    apiRequest('/documents/generate', token, {
      method: 'POST',
      body: { requirement_id: requirementId, document_type: documentType },
    }),

  bulkGenerateDocuments: (token, groupId, documentTypes) =>
    apiRequest(`/groups/${groupId}/bulk-generate`, token, {
      method: 'POST',
      body: { document_types: documentTypes },
    }),
}

export default api
