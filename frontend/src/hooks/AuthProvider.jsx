import { useEffect, useState } from 'react'
import { api, withAuth } from '../lib/api'
import { identifyUser, trackEvent, updateUserProfile } from '../services/clevertap'
import { AuthContext, TOKEN_KEY } from './AuthContext'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [hasToken, setHasToken] = useState(() => Boolean(localStorage.getItem(TOKEN_KEY)))

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) return

    api.get('/auth/me', withAuth(token))
      .then(({ data }) => {
        setUser(data.user)
        // Identify returning authenticated user
        if (data.user) {
          identifyUser(data.user)
        }
      })
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

    // CleverTap Integration: Identify the authenticated user
    if (data.user) {
      identifyUser(data.user)
      trackEvent(mode === 'login' ? 'User Logged In' : 'User Signed Up', {
        'Auth Method': 'Email/Password',
      })
    }

    return data.user
  }

  async function updateProfile(profileData) {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) throw new Error('Not authenticated')
    const { data } = await api.put('/auth/profile', profileData, withAuth(token))
    setUser(data.user)

    // CleverTap Integration: Update profile properties on current user
    updateUserProfile(profileData)
    trackEvent('Profile Updated', {
      'Updated Fields': Object.keys(profileData).join(', '),
    })

    return data.user
  }

  function logout() {
    trackEvent('User Logged Out')
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

