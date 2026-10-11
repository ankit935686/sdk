import { useEffect, useState } from 'react'
import { api, withAuth } from '../lib/api'
import { AuthContext, TOKEN_KEY } from './AuthContext'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [hasToken, setHasToken] = useState(() => Boolean(localStorage.getItem(TOKEN_KEY)))

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) return

    api.get('/auth/me', withAuth(token))
      .then(({ data }) => setUser(data.user))
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY)
        setHasToken(false)
      })
  }, [])

  async function authenticate(mode, credentials) {
    const { data } = await api.post(`/auth/${mode}`, credentials)
    localStorage.setItem(TOKEN_KEY, data.token)
    setHasToken(true)
    setUser(data.user)
    return data.user
  }

  async function updateProfile(profileData) {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) throw new Error('Not authenticated')
    const { data } = await api.put('/auth/profile', profileData, withAuth(token))
    setUser(data.user)
    return data.user
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY)
    setHasToken(false)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, hasToken, authenticate, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
