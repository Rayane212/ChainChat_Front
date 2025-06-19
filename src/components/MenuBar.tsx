// components/layout/MenuBar.tsx
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { MessageSquare, Users, Settings as SettingsIcon } from 'lucide-react'

interface Props {
  active: string
  onSelect: (id: string) => void
  orientation?: 'horizontal' | 'vertical'
}

const navItems = [
  { id: 'chat', label: 'Chats', icon: MessageSquare, badge: 3 },
  { id: 'contacts', label: 'Contacts', icon: Users, badge: 0 },
  { id: 'settings', label: 'Settings', icon: SettingsIcon, badge: 0 }
]

export default function MenuBar({ active, onSelect, orientation = 'horizontal' }: Props) {
  const isHorizontal = orientation === 'horizontal'

  return (
    <div className={cn('border-t border-border', isHorizontal ? 'flex justify-around' : 'flex flex-col')}>
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = item.id === active
        return (
          <Button
            key={item.id}
            variant="ghost"
            onClick={() => onSelect(item.id)}
            className={cn(
              isHorizontal
                ? 'flex flex-col items-center space-y-1 py-2 flex-1 h-auto'
                : 'flex items-center space-x-2 py-2 px-4 w-full justify-start',
              isActive
                ? 'text-purple-400'
                : 'text-foreground-muted hover:text-foreground'
            )}
          >
            <div className="relative">
              <Icon className="w-5 h-5" />
              {item.badge > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs h-4 w-4 flex items-center justify-center">
                  {item.badge}
                </Badge>
              )}
            </div>
            <span className="text-xs font-medium">{item.label}</span>
          </Button>
        )
      })}
    </div>
  )
}
