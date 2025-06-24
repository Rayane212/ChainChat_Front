import { createContext, useContext, useEffect, useState } from 'react'
import * as authService from '@/service/auth.service'
import { User } from '@/service/auth.service'

interface AuthContextProps {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  login: (emailOrUsername: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (token) {
        authService
        .validateToken(token)
        .then(user => setUser(user)) // ou juste set isAuthenticated = true
        .catch(() => localStorage.removeItem('accessToken'))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])


  const login = async (emailOrUsername: string, password: string) => {
    const token = await authService.login({ emailOrUsername, password })
    if (token) {
      const user = await authService.validateToken(token)
      setUser(user)
    }
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
