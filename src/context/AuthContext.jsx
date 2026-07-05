import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import { login as loginApi } from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [username, setUsername] = useState(() => localStorage.getItem('username'))
  const [village, setVillage] = useState(() => localStorage.getItem('village'))
  const [userId, setUserId] = useState(() => localStorage.getItem('userId'))

  const login = useCallback(async (usernameInput, pin) => {
    // The API only returns a bearer token on success (see apidocs.md).
    // There is no "current user" profile endpoint, so we keep the
    // entered username locally to personalize the sidebar/header.
    const response = await loginApi(usernameInput, pin)
    const { token: newToken } = response.data
    const userData = response.data.data
    localStorage.setItem('token', newToken)
    localStorage.setItem('username', usernameInput)
    localStorage.setItem('village', userData.village)
    localStorage.setItem('userId', userData.id)
    setToken(newToken)
    setUsername(usernameInput)
    setVillage(userData.village)
    setUserId(userData.id)
    return response.data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    localStorage.removeItem('village')
    localStorage.removeItem('userId')
    setToken(null)
    setUsername(null)
    setVillage(null)
    setUserId(null)
  }, [])

  const value = useMemo(
    () => ({
      token,
      username,
      village,
      userId,
      isAuthenticated: Boolean(token),
      login,
      logout,
    }),
    [token, username, village, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
