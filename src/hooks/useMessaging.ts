import { useState, useEffect, useCallback } from 'react';
import messagingService, { Conversation, DecryptedMessage, CreateGroupRequest } from '@/services/messaging.service';
import { useE2EE } from './useE2EE';
import { toast } from 'sonner';


export function useMessaging() {
  const { isSessionUnlocked } = useE2EE();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Map<string, DecryptedMessage[]>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 📋 Charger les conversations
  const loadConversations = useCallback(async () => {
    if (!isSessionUnlocked) return;

    try {
      setLoading(true);
      setError(null);
      
      const conversationList = await messagingService.getConversations();
      setConversations(conversationList);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load conversations';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isSessionUnlocked]);

  // 💬 Charger les messages d'une conversation
  const loadMessages = useCallback(async (conversationId: string) => {
    if (!isSessionUnlocked) return;

    try {
      setLoading(true);
      
      const messageList = await messagingService.getMessages(conversationId);
      setMessages(prev => new Map(prev).set(conversationId, messageList));
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load messages';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isSessionUnlocked]);

  // 📤 Envoyer un message
  const sendMessage = useCallback(async (recipientId: string, content: string, conversationId?: string) => {
    if (!isSessionUnlocked) {
      toast.error('Session locked - please unlock your keys first');
      return;
    }

    try {
      await messagingService.sendMessage(recipientId, content, conversationId);
      
      // Le message apparaîtra via WebSocket automatiquement
      toast.success('✅ Message sent');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      toast.error(errorMessage);
    }
  }, [isSessionUnlocked]);

  // 📤 Envoyer un message de groupe
  const sendGroupMessage = useCallback(async (conversationId: string, content: string) => {
    if (!isSessionUnlocked) {
      toast.error('Session locked - please unlock your keys first');
      return;
    }

    try {
      await messagingService.sendGroupMessage(conversationId, content);
      toast.success('✅ Group message sent');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send group message';
      toast.error(errorMessage);
    }
  }, [isSessionUnlocked]);

  // 👥 Créer un groupe
  const createGroup = useCallback(async (request: CreateGroupRequest) => {
    if (!isSessionUnlocked) {
      toast.error('Session locked');
      return null;
    }

    try {
      const group = await messagingService.createGroup(request);
      
      // Ajouter à la liste locale
      setConversations(prev => [group, ...prev]);
      
      toast.success(`✅ Group "${group.name}" created`);
      return group;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create group';
      toast.error(errorMessage);
      return null;
    }
  }, [isSessionUnlocked]);

  // 🔄 Auto-chargement des conversations
  useEffect(() => {
    if (isSessionUnlocked) {
      loadConversations();
    } else {
      // Reset quand la session se verrouille
      setConversations([]);
      setMessages(new Map());
    }
  }, [isSessionUnlocked, loadConversations]);

  return {
    conversations,
    messages,
    loading,
    error,
    loadConversations,
    loadMessages,
    sendMessage,
    sendGroupMessage,
    createGroup,
    // Utilitaires
    getMessages: (conversationId: string) => messages.get(conversationId) || [],
    getConversation: (conversationId: string) => conversations.find(c => c.id === conversationId)
  };
}