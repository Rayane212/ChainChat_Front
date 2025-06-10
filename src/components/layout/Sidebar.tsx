import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  MessageCircle, 
  Users, 
  Settings, 
  User, 
  LogOut,
  Shield
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'

interface SidebarProps {
  user?: {
    id: string
    email: string
    username?: string
    avatar?: string
  }
  onLogout: () => void
}

const navigation = [
  { name: 'Messages', href: '/dashboard', icon: MessageCircle },
  { name: 'Groupes', href: '/groups', icon: Users },
  { name: 'Profil', href: '/profile', icon: User },
  { name: 'Paramètres', href: '/settings', icon: Settings },
]

export function Sidebar({ user, onLogout }: SidebarProps) {
  const location = useLocation()

  return (
    <div className="flex h-full w-64 flex-col bg-card border-r">
      {/* Logo */}
      <div className="flex h-16 items-center px-6">
        <img 
          src="/image.png" 
          alt="ChainChat" 
          className="h-8 w-8"
        />
        <span className="ml-3 text-xl font-bold brand-gradient-text">
          ChainChat
        </span>
      </div>

      <Separator />

      {/* User Profile */}
      <div className="p-4">
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={user?.avatar} />
            <AvatarFallback className="brand-gradient text-white">
              {user?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user?.username || user?.email}
            </p>
            <p className="text-xs text-muted-foreground">En ligne</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link key={item.name} to={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className="w-full justify-start"
              >
                <item.icon className="mr-3 h-4 w-4" />
                {item.name}
              </Button>
            </Link>
          )
        })}
      </nav>

      <Separator />

      {/* Security & Logout */}
      <div className="p-4 space-y-2">
        <Link to="/security">
          <Button variant="ghost" className="w-full justify-start">
            <Shield className="mr-3 h-4 w-4" />
            Sécurité
          </Button>
        </Link>
        <Button 
          variant="ghost" 
          className="w-full justify-start text-destructive hover:text-destructive"
          onClick={onLogout}
        >
          <LogOut className="mr-3 h-4 w-4" />
          Déconnexion
        </Button>
      </div>
    </div>
  )
}