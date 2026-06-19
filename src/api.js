const BASE_URL = '/api'

function getToken() {
  return localStorage.getItem('diary_token')
}

class AuthError extends Error {
  constructor() {
    super('Unauthorized')
    this.name = 'AuthError'
  }
}

async function request(endpoint, options = {}) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (res.status === 401) {
    localStorage.removeItem('diary_token')
    window.location.href = '/'
    throw new AuthError()
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const error = new Error(body.error || `Request failed (${res.status})`)
    error.status = res.status
    throw error
  }

  return res.json()
}

export const api = {
  // Auth
  login(password) {
    return request('/login', {
      method: 'POST',
      body: JSON.stringify({ password }),
    })
  },

  logout() {
    return request('/logout', { method: 'POST' })
  },

  // Entries
  getEntries(params = {}) {
    const query = new URLSearchParams(params).toString()
    return request(`/entries${query ? `?${query}` : ''}`)
  },

  getEntry(id) {
    return request(`/entries/${id}`)
  },

  createEntry(data) {
    return request('/entries', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  updateEntry(id, data) {
    return request(`/entries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  deleteEntry(id) {
    return request(`/entries/${id}`, { method: 'DELETE' })
  },

  // Moods
  getMoods(params = {}) {
    const query = new URLSearchParams(params).toString()
    return request(`/moods${query ? `?${query}` : ''}`)
  },

  // Goals
  getGoals(params = {}) {
    const query = new URLSearchParams(params).toString()
    return request(`/goals${query ? `?${query}` : ''}`)
  },

  createGoal(data) {
    return request('/goals', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  updateGoal(id, data) {
    return request(`/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  deleteGoal(id) {
    return request(`/goals/${id}`, { method: 'DELETE' })
  },

  // Settings
  changePassword(data) {
    return request('/password', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  exportData() {
    return request('/export')
  },

  // AI
  setAIKey(apiKey) {
    return request('/settings/ai-key', {
      method: 'PUT',
      body: JSON.stringify({ apiKey }),
    })
  },

  getAICoach() {
    return request('/ai/coach', { method: 'POST' })
  },

  getYearReview(year) {
    return request('/ai/year-review', {
      method: 'POST',
      body: JSON.stringify({ year }),
    })
  },

  getAIDigest(start, end) {
    return request('/ai/digest', {
      method: 'POST',
      body: JSON.stringify({ start, end }),
    })
  },
}
