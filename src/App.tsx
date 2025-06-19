import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/sonner'

import AuthPage from './pages/AuthPage'
import ChatView from './components/chat/ChatView'
import MainLayout from './components/layout/MainLayout'

import { AuthProvider, useAuth } from './context/AuthProvider'
import { ChatProvider } from './context/ChatProvider'

function PrivateRoute() {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Outlet /> : <Navigate to="/auth" replace />
}

function PublicRoute() {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Navigate to="/chat" replace /> : <Outlet />
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <AuthProvider>
        <ChatProvider>
          <Router>
            <Routes>
              {/* Public route */}
              <Route element={<PublicRoute />}>
                <Route path="/auth" element={<AuthPage />} />
              </Route>

              {/* Private routes */}
              <Route element={<PrivateRoute />}>
                <Route element={<MainLayout />}>
                  <Route path="/chat" element={<ChatView />} />
                  <Route path="/chat/:id" element={<ChatView />} />
                </Route>
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/chat" replace />} />
            </Routes>
            <Toaster />
          </Router>
        </ChatProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
