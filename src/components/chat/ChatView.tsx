// components/chat/ChatView.tsx
import { useParams } from 'react-router-dom'
import { useChat } from '@/context/ChatProvider'
import MessageHeader from './MessageHeader'
import MessageList from './MessageList'
import ChatInput from './ChatInput'

export default function ChatView() {
  const { id: paramId } = useParams()
  const { selectedChatId, selectChat } = useChat()

  const chatId = paramId || selectedChatId

  // Si aucun chat sélectionné ou dans l'URL
  if (!chatId) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-lg">
        Select a conversation
      </div>
    )
  }

  // Enregistrer le chat dans le contexte si on accède via URL directement
  if (!selectedChatId && paramId) {
    selectChat(paramId)
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <MessageHeader chatId={chatId} />

      <div className="flex-1 overflow-y-auto px-4 py-2">
        <MessageList chatId={chatId} />
      </div>

      <div className="border-t border-border p-3">
        <ChatInput chatId={chatId} />
      </div>
    </div>
  )
}
