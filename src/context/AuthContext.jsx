import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import { login as loginApi } from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('pita_token'))
  const [username, setUsername] = useState(() => localStorage.getItem('pita_username'))

  const login = useCallback(async (usernameInput, pin) => {
    // The API only returns a bearer token on success (see apidocs.md).
    // There is no "current user" profile endpoint, so we keep the
    // entered username locally to personalize the sidebar/header.
    const response = await loginApi(usernameInput, pin)
    const { token: newToken } = response.data
    localStorage.setItem('pita_token', newToken)
    localStorage.setItem('pita_username', usernameInput)
    setToken(newToken)
    setUsername(usernameInput)
    return response.data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('pita_token')
    localStorage.removeItem('pita_username')
    setToken(null)
    setUsername(null)
  }, [])

  const value = useMemo(
    () => ({
      token,
      username,
      isAuthenticated: Boolean(token),
      login,
      logout,
    }),
    [token, username, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
