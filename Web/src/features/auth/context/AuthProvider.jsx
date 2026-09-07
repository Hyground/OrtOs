import { useCallback, useEffect, useMemo, useState } from 'react'
import { tokenStorage } from '@/lib/storage/tokenStorage'
import { authService } from '../services/authService'
import { AuthContext } from './AuthContext'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let active = true

    if (!tokenStorage.get()) {
      setStatus('unauthenticated')
      return undefined
    }

    authService
      .me()
      .then((current) => {
        if (!active) return
        setUser(current)
        setStatus('authenticated')
      })
      .catch(() => {
        if (!active) return
        tokenStorage.clear()
        setUser(null)
        setStatus('unauthenticated')
      })

    return () => {
      active = false
    }
  }, [])

  const login = useCallback(async (credentials) => {
    const { token, user: authUser } = await authService.login(credentials)
    tokenStorage.set(token)
    setUser(authUser)
    setStatus('authenticated')
    return authUser
  }, [])

  const logout = useCallback(() => {
    tokenStorage.clear()
    setUser(null)
    setStatus('unauthenticated')
  }, [])

  const value = useMemo(
    () => ({
      user,
      status,
      isAuthenticated: status === 'authenticated',
      login,
      logout,
    }),
    [user, status, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
