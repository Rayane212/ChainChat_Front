import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL, 
  withCredentials: false // temporaire
})

// Injecte le token automatiquement
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Intercepteur de réponse pour refresh + logout
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // ❌ Si le token est invalide et qu'on n'a pas déjà essayé de refresh
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/refresh')
    ) {
      originalRequest._retry = true
      try {
        const res = await axios.post('192.168.49.2:30080/api/auth/refresh', {}, {
          withCredentials: true
        })

        const newToken = res.data.accessToken
        localStorage.setItem('accessToken', newToken)

        // 🔁 Relance la requête initiale avec le nouveau token
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        // ❌ Refresh échoué : redirige vers /auth
        localStorage.removeItem('accessToken')
        window.location.href = '/auth'
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient
