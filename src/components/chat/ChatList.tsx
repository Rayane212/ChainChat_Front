// components/chat/ChatList.tsx
import ChatItem from './ChatItem'
import { useNavigate } from 'react-router-dom'

interface Chat {
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
}

interface Props {
  chats: Chat[]
  selectedId: string
  onSelect: (id: string) => void
}

export default function ChatList({ chats, selectedId, onSelect }: Props) {
  const navigate = useNavigate()
  const pinned = chats.filter((c) => c.isPinned)
  const others = chats.filter((c) => !c.isPinned)

  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-1 py-2">
        {pinned.length > 0 && (
          <div className="mb-4">
            <p className="px-4 py-2 text-xs font-semibold uppercase text-muted-foreground">
              Pinned
            </p>
            <div className="space-y-1">
              {pinned.map((chat) => (
                <div key={chat.id} className="px-2">
                  <ChatItem
                    {...chat}
                    selected={chat.id === selectedId}
                    onClick={() => {
                      onSelect(chat.id)
                      navigate(`/chat/${chat.id}`)
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {others.length > 0 && (
          <div className="mb-4">
            {pinned.length > 0 && (
              <p className="px-4 py-2 text-xs font-semibold uppercase text-muted-foreground">
                All Chats
              </p>
            )}
            <div className="space-y-1">
              {others.map((chat) => (
                <div key={chat.id} className="px-2">
                  <ChatItem
                    {...chat}
                    selected={chat.id === selectedId}
                    onClick={() => {
                      onSelect(chat.id)
                      navigate(`/chat/${chat.id}`)
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}