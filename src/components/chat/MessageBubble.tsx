import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  content: string
  senderId: string
  createdAt: string
  sender?: {
    username: string
    avatar?: string
  }
}

interface MessageBubbleProps {
  message: Message
  isOwn: boolean
  showAvatar?: boolean
}

export function MessageBubble({ message, isOwn, showAvatar = true }: MessageBubbleProps) {
  return (
    <div className={cn(
      "flex items-end space-x-2 mb-4",
      isOwn ? "flex-row-reverse space-x-reverse" : "flex-row"
    )}>
      {showAvatar && !isOwn && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={message.sender?.avatar} />
          <AvatarFallback className="text-xs">
            {message.sender?.username?.[0]?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={cn(
        "flex flex-col space-y-1",
        isOwn ? "items-end" : "items-start"
      )}>
        {!isOwn && showAvatar && (
          <span className="text-xs text-muted-foreground px-3">
            {message.sender?.username}
          </span>
        )}
        
        <div className={cn(
          "chat-bubble",
          isOwn ? "chat-bubble-sent" : "chat-bubble-received"
        )}>
          <p className="text-sm">{message.content}</p>
        </div>
        
        <span className={cn(
          "text-xs text-muted-foreground px-3",
          isOwn ? "text-right" : "text-left"
        )}>
          {formatTime(message.createdAt)}
        </span>
      </div>
    </div>
  )
}