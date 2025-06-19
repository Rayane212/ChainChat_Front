import { createContext, useContext, useState, ReactNode } from 'react'

interface ChatContextType {
  selectedChatId: string | null
  selectChat: (chatId: string) => void
  clearChat: () => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)

  const selectChat = (chatId: string) => {
    setSelectedChatId(chatId)
  }

  const clearChat = () => {
    setSelectedChatId(null)
  }

  const value: ChatContextType = {
    selectedChatId,
    selectChat,
    clearChat
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export function useChat() {
  const context = useContext(ChatContext)
  if (!context) throw new Error('useChat must be used within ChatProvider')
  return context
}
