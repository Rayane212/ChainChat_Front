import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Users, 
  Settings, 
  Search, 
  Bell,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const sidebarItems = [
    { 
      id: 'chat', 
      label: 'Chats', 
      icon: MessageSquare, 
      path: '/app/chat',
      badge: 3 
    },
    { 
      id: 'contacts', 
      label: 'Contacts', 
      icon: Users, 
      path: '/app/contacts',
      badge: 0 
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: Settings, 
      path: '/app/settings',
      badge: 0 
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileSidebarOpen(false);
  };

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Desktop Sidebar - 320px fixed width */}
      <div className="hidden lg:flex lg:w-80 lg:flex-col bg-surface border-r border-border">
        <SidebarContent 
          sidebarItems={sidebarItems}
          isActive={isActive}
          onNavigate={handleNavigation}
        />
      </div>

     
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-surface border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-purple-500">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-bold text-purple-400">ChainChat</h1>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="text-foreground-muted hover:text-foreground"
          >
            <Bell className="w-5 h-5" />
          </Button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          <Outlet />
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="lg:hidden bg-surface border-t border-border">
          <div className="flex items-center justify-around py-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  onClick={() => handleNavigation(item.path)}
                  className={cn(
                    "flex flex-col items-center space-y-1 py-3 px-4 transition-colors",
                    active 
                      ? "text-purple-400" 
                      : "text-foreground-muted hover:text-foreground"
                  )}
                >
                  <div className="relative">
                    <Icon className="w-5 h-5" />
                    {item.badge > 0 && (
                      <Badge className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs h-4 w-4 p-0 flex items-center justify-center">
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs font-medium">{item.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function SidebarContent({ 
  sidebarItems, 
  isActive, 
  onNavigate 
}: {
  sidebarItems: any[];
  isActive: (path: string) => boolean;
  onNavigate: (path: string) => void;
}) {
  return (
    <>
      {/* Sidebar Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 rounded-xl bg-purple-500">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-purple-400">ChainChat</h1>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-foreground-muted" />
          <input
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl focus:border-purple-500 focus:outline-none text-foreground placeholder:text-foreground-muted"
          />
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 p-3">
        <div className="space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Button
                key={item.id}
                variant="ghost"
                onClick={() => onNavigate(item.path)}
                className={cn(
                  "w-full justify-start p-4 h-auto transition-colors",
                  active 
                    ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" 
                    : "text-foreground-muted hover:text-foreground hover:bg-muted"
                )}
              >
                <div className="flex items-center space-x-3 w-full">
                  <div className="relative">
                    <Icon className="w-5 h-5" />
                    {item.badge > 0 && (
                      <Badge className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs h-4 w-4 p-0 flex items-center justify-center">
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                  <span className="font-medium">{item.label}</span>
                </div>
              </Button>
            );
          })}
        </div>
      </div>

      {/* User Profile Section */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-3 p-3 bg-background hover:bg-muted transition-colors cursor-pointer">
          <Avatar className="w-10 h-10">
            <AvatarImage src="" />
            <AvatarFallback className="bg-purple-500/20 text-purple-400 font-semibold">
              JD
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground truncate">John Doe</p>
            <p className="text-sm text-foreground-muted truncate">Online</p>
          </div>
        </div>
      </div>
    </>
  );
}