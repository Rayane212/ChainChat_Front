import { Outlet } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Bell } from 'lucide-react'
import Sidebar from '@/components/chat/Sidebar'
import MenuBar from '@/components/MenuBar'

export default function MainLayout() {
  return (
    <div className="h-screen flex bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-80 flex-col border-r border-border bg-surface">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-surface">
          <h1 className="text-lg font-bold text-purple-400">ChainChat</h1>
          <Button variant="ghost" size="sm">
            <Bell className="w-5 h-5 text-foreground-muted" />
          </Button>
        </div>

        {/* Routed view */}
        <div className="flex-1 overflow-hidden">
          <Outlet />
        </div>

        {/* Mobile bottom menu */}
        <div className="lg:hidden border-t border-border bg-surface">
          <MenuBar active="chat" onSelect={() => {}} />
        </div>
      </div>
    </div>
  )
}
