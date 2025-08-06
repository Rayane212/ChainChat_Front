import { createContext, useContext, useEffect, useState } from 'react'
import * as authService from '@/services/auth.service'
import messagingService from '@/services/messaging.service' 

export interface User {
  id: string
  email: string
  username: string
  avatar?: string
  isTwoFactorEnabled?: boolean
}

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
        .then(userData => {
          setUser(userData)
          // ✅ NOUVEAU : Synchroniser l'ID utilisateur avec le service de messagerie
          messagingService.updateCurrentUserId(userData.id)
        })
        .catch(() => localStorage.removeItem('accessToken'))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (emailOrUsername: string, password: string) => {
    const token = await authService.login({ emailOrUsername, password })
    if (token) {
      const userData = await authService.validateToken(token)
      setUser(userData)
      
      // ✅ NOUVEAU : Synchroniser l'ID utilisateur après login
      messagingService.updateCurrentUserId(userData.id)
    }
  }

  const logout = () => {
    authService.logout()
    setUser(null)
    
    // ✅ NOUVEAU : Nettoyer le cache du service de messagerie
    messagingService.clearCache()
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