import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { Sidebar } from '@/components/layout/Sidebar'
import { ConversationList } from '@/components/chat/ConversationList'
import { MessageBubble } from '@/components/chat/MessageBubble'
import { ChatInput } from '@/components/chat/ChatInput'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import api from '@/lib/api'
import { socketService } from '@/lib/socket'

export function DashboardPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState<any>(null)
  const [conversations, setConversations] = useState<any[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    initializeDashboard()
  }, [])

  const initializeDashboard = async () => {
    try {
      // Validate token and get user info
      const token = localStorage.getItem('accessToken')
      if (!token) {
        navigate('/login')
        return
      }

      const userResponse = await api.post('/auth/validate-token', { token })
      setUser(userResponse.data.user)

      // Get conversations
      const conversationsResponse = await api.get('/messages')
      setConversations(conversationsResponse.data)

      // Initialize WebSocket
      await socketService.connect()
      
      // Listen for new messages
      socketService.on('newMessage', (message) => {
        setMessages(prev => [...prev, message])
      })

      setIsLoading(false)
    } catch (error) {
      console.error('Dashboard initialization error:', error)
      navigate('/login')
    }
  }

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      socketService.disconnect()
      navigate('/login')
    }
  }

  const handleSelectConversation = async (conversationId: string) => {
    setSelectedConversation(conversationId)
    // Load messages for this conversation
    // This would typically come from your API
    setMessages([])
  }

  const handleSendMessage = async (content: string) => {
    if (!selectedConversation) return

    try {
      const response = await api.post('/messages', {
        recipientId: selectedConversation,
        content
      })
      
      // Emit via WebSocket for real-time delivery
      socketService.emit('sendMessage', {
        conversationId: selectedConversation,
        content
      })
    } catch (error) {
      console.error('Send message error:', error)
    }
  }

  const filteredConversations = conversations.filter(conv =>
    conv.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.participants.some((p: any) => 
      p.username.toLowerCase().includes(searchQuery.toLowerCase())
    )
  )

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <img src="/image.png" alt="ChainChat" className="h-16 w-16 mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex">
      <Sidebar user={user} onLogout={handleLogout} />
      
      {/* Conversations Panel */}
      <div className="w-80 border-r bg-card flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Messages</h2>
            <Button size="icon" variant="ghost">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <ConversationList
          conversations={filteredConversations}
          selectedConversationId={selectedConversation || undefined}
          onSelectConversation={handleSelectConversation}
          currentUserId={user?.id}
        />
      </div>

      {/* Chat Panel */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b">
              <h3 className="font-semibold">
                {conversations.find(c => c.id === selectedConversation)?.name || 'Conversation'}
              </h3>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwn={message.senderId === user?.id}
                />
              ))}
            </ScrollArea>

            {/* Chat Input */}
            <ChatInput onSendMessage={handleSendMessage} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <img src="/image.png" alt="ChainChat" className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Bienvenue sur ChainChat</h3>
              <p className="text-muted-foreground">
                Sélectionnez une conversation pour commencer à discuter
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}