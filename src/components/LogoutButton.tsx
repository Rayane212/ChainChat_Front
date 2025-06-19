import { LogOut } from 'lucide-react'
import { useAuth } from '@/context/AuthProvider'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function LogoutButton() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.info('You have been logged out')
    navigate('/auth')
  }

  return (
    <Button
      onClick={handleLogout}
      variant="ghost"
      className="text-red-500 hover:bg-red-500/10 flex items-center gap-2 w-full justify-start"
    >
      <LogOut className="w-4 h-4" />
      <span>Logout</span>
    </Button>
  )
}
