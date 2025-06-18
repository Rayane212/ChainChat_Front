import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import WelcomePage from './pages/WelcomePage';
import AuthPage from './pages/AuthPage';
import ChatDashboard from './pages/ChatDashboard';
import ContactsPage from './pages/ContactsPage';
import SettingsPage from './pages/SettingsPage';
import ConversationPage from './pages/ConversationPage';
import MainLayout from './components/layout/MainLayout';
import { Toaster } from '@/components/ui/sonner';

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <Router future={{ 
        v7_startTransition: true,
        v7_relativeSplatPath: true 
      }}>
        <div className="min-h-screen bg-background">
          <Routes>
            <Route path="/" element={<WelcomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/conversation/:contactId" element={<ConversationPage />} />
            <Route path="/app" element={<MainLayout />}>
              <Route path="chat" element={<ChatDashboard />} />
              <Route path="contacts" element={<ContactsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route index element={<Navigate to="chat" replace />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;