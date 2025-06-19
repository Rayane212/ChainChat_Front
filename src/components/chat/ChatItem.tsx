import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Pin, VolumeX, Shield, Users } from 'lucide-react'

interface ChatItemProps {
  id: string
  name: string
  avatar?: string
  lastMessage: string
  timestamp: string
  unreadCount: number
  isPinned?: boolean
  isMuted?: boolean
  isOnline?: boolean
  isGroup?: boolean
  isVerified?: boolean
  selected: boolean
  onClick: () => void
}

export default function ChatItem({
  name,
  avatar,
  lastMessage,
  timestamp,
  unreadCount,
  isMuted,
  isPinned,
  isGroup,
  isVerified,
  selected,
  onClick,
  isOnline
}: ChatItemProps) {
  return (
    <div
      className={cn(
        'group relative flex items-center space-x-3 p-3 mx-2 rounded-xl cursor-pointer transition-all duration-200',
        selected
          ? 'bg-purple-500/20 border border-purple-500/30'
          : 'hover:bg-surface-hover active:scale-[0.98]'
      )}
      onClick={onClick}
    >
      <div className="relative">
        <Avatar className="w-12 h-12">
          <AvatarImage src={avatar ? undefined : ''} />
          <AvatarFallback
            className={cn(
              'font-semibold text-sm',
              isGroup
                ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-blue-400'
                : 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-purple-400'
            )}
          >
            {avatar || (isGroup ? <Users className="w-5 h-5" /> : name.slice(0, 2).toUpperCase())}
          </AvatarFallback>
        </Avatar>

        {isOnline && !isGroup && (
          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-background rounded-full" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center space-x-1.5">
            <h3 className={cn('font-semibold truncate text-sm', selected ? 'text-purple-300' : 'text-foreground')}>
              {name}
            </h3>
            {isVerified && <Shield className="w-3.5 h-3.5 text-blue-400" />}
            {isPinned && <Pin className="w-3 h-3 text-muted-foreground" />}
            {isMuted && <VolumeX className="w-3 h-3 text-muted-foreground" />}
          </div>
          <span className="text-xs text-muted-foreground">{timestamp}</span>
        </div>

        <div className="flex justify-between items-center">
          <p className="text-xs text-muted-foreground truncate pr-2">{lastMessage}</p>
          {unreadCount > 0 && (
            <Badge className="bg-purple-500 text-white text-xs h-5 min-w-[20px] px-1.5 rounded-full">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}
