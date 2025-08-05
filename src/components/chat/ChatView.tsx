import { useParams } from 'react-router-dom'
import { useChat } from '@/context/ChatProvider'
import MessageHeader from './MessageHeader'
import SecureMessageList from './SecureMessageList'
import SecureChatInput from './SecureChatInput'

export default function ChatView() {
  const { id: paramId } = useParams()
  const { selectedChatId, selectChat } = useChat()

  const conversationId = paramId || selectedChatId

  // Si aucun chat sélectionné ou dans l'URL
  if (!conversationId) {
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
      <MessageHeader conversationId={conversationId} />

      <div className="flex-1 overflow-y-auto px-4 py-2">
        <SecureMessageList conversationId={conversationId} />
      </div>

      <div className="border-t border-border p-3">
        <SecureChatInput conversationId={conversationId} />
      </div>
    </div>
  )
}
