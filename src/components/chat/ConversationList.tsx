import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatTime, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface Conversation {
  id: string
  name?: string
  isGroup: boolean
  lastMessage?: {
    content: string
    createdAt: string
    sender?: {
      username: string
    }
  }
  participants: Array<{
    id: string
    username: string
    avatar?: string
  }>
  unreadCount?: number
}

interface ConversationListProps {
  conversations: Conversation[]
  selectedConversationId?: string
  onSelectConversation: (conversationId: string) => void
  currentUserId: string
}

export function ConversationList({
  conversations,
  selectedConversationId,
  onSelectConversation,
  currentUserId
}: ConversationListProps) {
  const getConversationName = (conversation: Conversation) => {
    if (conversation.isGroup) {
      return conversation.name || 'Groupe sans nom'
    }
    
    const otherParticipant = conversation.participants.find(
      p => p.id !== currentUserId
    )
    return otherParticipant?.username || 'Utilisateur inconnu'
  }

  const getConversationAvatar = (conversation: Conversation) => {
    if (conversation.isGroup) {
      return null // Group avatar logic
    }
    
    const otherParticipant = conversation.participants.find(
      p => p.id !== currentUserId
    )
    return otherParticipant?.avatar
  }

  const getAvatarFallback = (conversation: Conversation) => {
    if (conversation.isGroup) {
      return 'G'
    }
    
    const otherParticipant = conversation.participants.find(
      p => p.id !== currentUserId
    )
    return otherParticipant?.username?.[0]?.toUpperCase() || 'U'
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-2 space-y-1">
        {conversations.map((conversation) => (
          <div
            key={conversation.id}
            onClick={() => onSelectConversation(conversation.id)}
            className={cn(
              "flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-accent",
              selectedConversationId === conversation.id && "bg-accent"
            )}
          >
            <Avatar className="h-12 w-12">
              <AvatarImage src={getConversationAvatar(conversation) || undefined} />
              <AvatarFallback className="brand-gradient text-white">
                {getAvatarFallback(conversation)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-medium truncate">
                  {getConversationName(conversation)}
                </h3>
                {conversation.lastMessage && (
                  <span className="text-xs text-muted-foreground">
                    {formatTime(conversation.lastMessage.createdAt)}
                  </span>
                )}
              </div>
              
              {conversation.lastMessage && (
                <p className="text-sm text-muted-foreground truncate">
                  {conversation.isGroup && conversation.lastMessage.sender && (
                    <span className="font-medium">
                      {conversation.lastMessage.sender.username}: 
                    </span>
                  )}
                  {conversation.lastMessage.content}
                </p>
              )}
            </div>
            
            {conversation.unreadCount && conversation.unreadCount > 0 && (
              <div className="flex items-center justify-center h-5 w-5 bg-brand-purple text-white text-xs rounded-full">
                {conversation.unreadCount}
              </div>
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}