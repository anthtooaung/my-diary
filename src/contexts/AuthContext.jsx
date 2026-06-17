import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // On mount, check if a token exists in localStorage
  useEffect(() => {
    const stored = localStorage.getItem('diary_token')
    if (stored) {
      // Verify the token is still valid
      api.getEntries({ limit: '1' })
        .then(() => setToken(stored))
        .catch(() => localStorage.removeItem('diary_token'))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (password) => {
    const data = await api.login(password)
    localStorage.setItem('diary_token', data.token)
    setToken(data.token)
    navigate('/dashboard')
  }, [navigate])

  const logout = useCallback(async () => {
    try {
      await api.logout()
    } catch {
      // Ignore server errors on logout
    }
    localStorage.removeItem('diary_token')
    setToken(null)
    navigate('/')
  }, [navigate])

  const isAuthenticated = !!token

  return (
    <AuthContext.Provider value={{ token, isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
