import apiClient from '@/api/apiClient'

export interface LoginDto {
    emailOrUsername: string
    password: string
}

export interface RegisterDto {
    firstName: string
    lastName: string
    birthday: Date
    email: string
    username: string
    password: string
    confirmPassword: string
    isTwoFactorEnabled?: boolean
}
  

export interface User {
  id: string
  email: string
  username: string
  avatar?: string
  isTwoFactorEnabled?: boolean
}

export const login = async (credentials: LoginDto) => {
    console.log(credentials)
    const res = await apiClient.post('/auth/login', {
      ...(credentials.emailOrUsername.includes('@')
        ? { email: credentials.emailOrUsername }
        : { username: credentials.emailOrUsername }),
      password: credentials.password
    })
    const {accessToken , refreshToken} = res.data.data
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    return accessToken
  }

export const register = async (data: RegisterDto) => {
  const res = await apiClient.post('/auth/register', data)
  const { accessToken, refreshToken } = res.data.data
  localStorage.setItem('accessToken', accessToken)
  localStorage.setItem('refreshToken', refreshToken)
  // const { publicKey, privateKey } = await generateKeyPair();
  return accessToken
}
  
  

export const logout = () => {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  window.location.href = '/auth'
}

export const getMe = async (): Promise<User> => {
  const res = await apiClient.get<User>('/auth/me')
  return res.data
}

export const verifyCode = async (code: string): Promise<boolean> => {
  const res = await apiClient.post<{ valid: boolean }>('/auth/verify-code', { code })
  return res.data.valid
}

export const validateToken = async (token: string) => {
    const res = await apiClient.post('/auth/validate-token', {token:token})
    const data = res.data.data.decoded
    return await data
  }
  
