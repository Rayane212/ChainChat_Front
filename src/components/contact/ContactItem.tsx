import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { Wifi, Clock } from 'lucide-react'

interface Contact {
  id: string
  name: string
  username: string
  avatar?: string
  isOnline: boolean
  lastSeen: string
  isVerified?: boolean
  avatarColor: string
  selected: boolean
  onClick: () => void
}

export default function ContactItem({ name, username, isOnline, lastSeen, isVerified, avatar, avatarColor, selected, onClick }: Contact) {
  return (
    <div
      className={cn(
        'group flex items-center space-x-3 p-3 mx-2 rounded-xl cursor-pointer transition-all duration-200',
        selected
          ? 'bg-purple-500/20 border border-purple-500/30'
          : 'hover:bg-surface-hover active:scale-[0.98]'
      )}
      onClick={onClick}
    >
      <div className="relative">
        <Avatar className="w-12 h-12">
          <AvatarImage src="" />
          <AvatarFallback className={cn('font-semibold text-white bg-gradient-to-br', avatarColor)}>
            {avatar}
          </AvatarFallback>
        </Avatar>

        {isOnline && (
          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-background rounded-full" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-1">
          <h3 className={cn('font-semibold truncate text-sm', selected ? 'text-purple-300' : 'text-foreground')}>
            {name}
          </h3>
          {isVerified && (
            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
          )}
        </div>

        <div className="flex items-center space-x-1">
          {isOnline ? (
            <Wifi className="w-3 h-3 text-green-500 flex-shrink-0" />
          ) : (
            <Clock className="w-3 h-3 text-muted-foreground flex-shrink-0" />
          )}
          <p className="text-xs text-muted-foreground truncate">{lastSeen}</p>
        </div>

        <p className="text-xs text-purple-400 truncate mt-0.5">{username}</p>
      </div>
    </div>
  )
}
