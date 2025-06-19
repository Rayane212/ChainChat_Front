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
    <div className="space-y-2 py-2">
      {pinned.length > 0 && (
        <>
          <p className="px-4 text-xs uppercase text-muted-foreground">Pinned</p>
          {pinned.map((chat) => (
            <ChatItem
            key={chat.id}
            {...chat}
            selected={chat.id === selectedId}
            onClick={() => {
            onSelect(chat.id)
            navigate(`/chat/${chat.id}`)
            }}
            />          
        ))}
        </>
      )}

      {others.length > 0 && (
        <>
          {pinned.length > 0 && <p className="px-4 text-xs uppercase text-muted-foreground">All Chats</p>}
          {others.map((chat) => (
            <ChatItem
            key={chat.id}
            {...chat}
            selected={chat.id === selectedId}
            onClick={() => {
            onSelect(chat.id)
            navigate(`/chat/${chat.id}`)
            }}
            />         
         ))}
        </>
      )}
    </div>
  )
}
