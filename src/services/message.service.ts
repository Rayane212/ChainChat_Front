import apiClient from '@/api/apiClient'

export interface Message {
  id: string
  senderId: string
  content: string
  conversationId: string
  createdAt: string
}

export interface Conversation {
  id: string
  isGroup: boolean
  name?: string
  participants: string[]
  lastMessage?: Message
}

export const getConversations = async (): Promise<Conversation[]> => {
  const res = await apiClient.get('/messaging/conversations')
  return res.data
}

export const getMessages = async (conversationId: string): Promise<Message[]> => {
  const res = await apiClient.get(`/messaging/conversations/${conversationId}/messages`)
  return res.data
}

export const sendMessage = async (conversationId: string, content: string) => {
  const res = await apiClient.post(`/messaging/conversations/${conversationId}/messages`, {
    content
  })
  return res.data
}

export const createGroup = async (name: string, memberIds: string[]) => {
  const res = await apiClient.post('/messaging/groups', {
    name,
    members: memberIds
  })
  return res.data
}

export const getGroupMembers = async (groupId: string) => {
  const res = await apiClient.get(`/messaging/groups/${groupId}/members`)
  return res.data
}
