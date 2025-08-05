import apiClient from '@/api/apiClient';
import webSocketService, { E2EEMessage } from './websocket.service';
import { generateKeyPair } from '@/E2E/encryption';
import { SodiumKeyManager } from '@/E2E/keyManager';

export interface DecryptedMessage {
  id: string;
  senderId: string;
  senderName?: string;
  recipientId?: string;
  conversationId: string;
  content: string; // ✅ Contenu déchiffré
  timestamp: string;
  isFromMe: boolean;
  readAt?: string;
}

export interface Conversation {
  id: string;
  name?: string;
  isGroup: boolean;
  participants: Array<{
    id: string;
    username: string;
    publicKey: string;
  }>;
  lastMessage?: DecryptedMessage;
  unreadCount: number;
  createdAt: string;
}

export interface CreateGroupRequest {
  name: string;
  userIds: string[];
}

class MessagingE2EEService {
  private keyManager: SodiumKeyManager;
  private messageCache: Map<string, DecryptedMessage[]> = new Map();
  private conversationCache: Map<string, Conversation> = new Map();

  constructor() {
    this.keyManager = new SodiumKeyManager();
    this.setupWebSocketHandlers();
  }

  private setupWebSocketHandlers(): void {
    // Écouter les nouveaux messages
    webSocketService.onMessage((encryptedMessage: E2EEMessage) => {
      const decryptedMessage = this.convertToDecryptedMessage(encryptedMessage);
      this.addMessageToCache(decryptedMessage);
      
      // Mettre à jour la conversation
      this.updateConversationLastMessage(decryptedMessage);
    });
  }

  // 🔑 Gestion des clés E2EE
  async initializeUserKeys(userId: string, password: string): Promise<{ publicKey: string; privateKey: string }> {
    try {
      // Vérifier si les clés existent déjà
      const hasKeys = await this.keyManager.hasKeys(userId);
      
      if (hasKeys.hasPrivate && hasKeys.hasPublic) {
        // Clés existantes - déverrouiller la session
        await webSocketService.unlockSession(password, userId);
        const publicKey = await this.keyManager.getPublicKey(userId);
        
        return {
          publicKey,
          privateKey: '[PROTECTED]' // Ne jamais exposer la clé privée
        };
      }

      // Générer de nouvelles clés
      const { publicKey, privateKey } = await generateKeyPair();
      
      // Stocker les clés de manière sécurisée
      await this.keyManager.storePrivateKey(privateKey, password, userId);
      await this.keyManager.storePublicKey(publicKey, userId);
      
      // Déverrouiller la session
      await webSocketService.unlockSession(password, userId);
      
      // Envoyer la clé publique au serveur
      await this.registerPublicKey(publicKey);
      
      return {
        publicKey,
        privateKey: '[PROTECTED]'
      };
      
    } catch (error) {
      console.error('❌ Failed to initialize user keys:', error);
      throw new Error('Failed to setup encryption keys');
    }
  }

  async regenerateKeys(userId: string, password: string): Promise<{ publicKey: string }> {
    try {
      // Supprimer les anciennes clés
      await this.keyManager.deleteUserKeys(userId);
      
      // Générer de nouvelles clés
      const { publicKey, privateKey } = await generateKeyPair();
      
      // Stocker les nouvelles clés
      await this.keyManager.storePrivateKey(privateKey, password, userId);
      await this.keyManager.storePublicKey(publicKey, userId);
      
      // Déverrouiller la session avec les nouvelles clés
      await webSocketService.unlockSession(password, userId);
      
      // Mettre à jour la clé publique sur le serveur
      await this.registerPublicKey(publicKey);
      
      return { publicKey };
      
    } catch (error) {
      console.error('❌ Failed to regenerate keys:', error);
      throw new Error('Failed to regenerate encryption keys');
    }
  }

  private async registerPublicKey(publicKey: string): Promise<void> {
    try {
      await apiClient.post('/messages/regenerate-keys', {
        publicKey // ✅ Seulement la clé publique est envoyée
      });
    } catch (error) {
      console.error('❌ Failed to register public key:', error);
      throw error;
    }
  }

  // 💬 Gestion des messages
  async sendMessage(recipientId: string, content: string, conversationId?: string): Promise<void> {
    if (!webSocketService.isSessionUnlocked()) {
      throw new Error('Session locked - please unlock your keys first');
    }

    if (!webSocketService.isConnected()) {
      throw new Error('Not connected to messaging service');
    }

    // Générer un ID de conversation si pas fourni
    const finalConversationId = conversationId || [recipientId, 'current-user-id'].sort().join('-');

    await webSocketService.sendMessage(recipientId, content, finalConversationId);
  }

  async sendGroupMessage(conversationId: string, content: string): Promise<void> {
    if (!webSocketService.isSessionUnlocked()) {
      throw new Error('Session locked - please unlock your keys first');
    }

    if (!webSocketService.isConnected()) {
      throw new Error('Not connected to messaging service');
    }

    await webSocketService.sendGroupMessage(conversationId, content);
  }

  // 📋 Gestion des conversations
  async getConversations(): Promise<Conversation[]> {
    try {
      const response = await apiClient.get('/messages');
      const conversationsData = response.data.data;

      const conversations: Conversation[] = conversationsData.map((conv: any) => ({
        id: conv.id,
        name: conv.name || this.getConversationName(conv),
        isGroup: conv.isGroup,
        participants: conv.userConversations?.map((uc: any) => ({
          id: uc.user.id,
          username: uc.user.username,
          publicKey: uc.user.publicKey
        })) || [],
        lastMessage: conv.messages?.[0] ? this.createDecryptedMessageStub(conv.messages[0]) : undefined,
        unreadCount: 0, // À calculer côté client
        createdAt: conv.createdAt || new Date().toISOString()
      }));

      // Mettre en cache
      conversations.forEach(conv => {
        this.conversationCache.set(conv.id, conv);
      });

      return conversations;
      
    } catch (error) {
      console.error('❌ Failed to get conversations:', error);
      throw new Error('Failed to load conversations');
    }
  }

  async getMessages(conversationId: string): Promise<DecryptedMessage[]> {
    // Vérifier le cache d'abord
    if (this.messageCache.has(conversationId)) {
      return this.messageCache.get(conversationId)!;
    }

    try {
      const response = await apiClient.get(`/conversations/${conversationId}/messages`);
      const messagesData = response.data.data;

      // Note: Les messages sont stockés chiffrés côté serveur
      // Le déchiffrement se fait automatiquement via WebSocket lors de la réception
      const messages: DecryptedMessage[] = messagesData.map((msg: any) => 
        this.createDecryptedMessageStub(msg)
      );

      this.messageCache.set(conversationId, messages);
      return messages;
      
    } catch (error) {
      console.error('❌ Failed to get messages:', error);
      throw new Error('Failed to load messages');
    }
  }

  // 👥 Gestion des groupes
  async createGroup(request: CreateGroupRequest): Promise<Conversation> {
    try {
      const response = await apiClient.post('/messages/groups', {
        name: request.name,
        userIds: request.userIds
      });

      const groupData = response.data.data;
      
      const conversation: Conversation = {
        id: groupData.id,
        name: groupData.name,
        isGroup: true,
        participants: groupData.userConversations?.map((uc: any) => ({
          id: uc.user.id,
          username: uc.user.username,
          publicKey: uc.user.publicKey
        })) || [],
        unreadCount: 0,
        createdAt: groupData.createdAt
      };

      this.conversationCache.set(conversation.id, conversation);
      return conversation;
      
    } catch (error) {
      console.error('❌ Failed to create group:', error);
      throw new Error('Failed to create group');
    }
  }

  async addUserToGroup(conversationId: string, userId: string): Promise<void> {
    try {
      await apiClient.post(`/messages/groups/${conversationId}/members/${userId}`);
      
      // Invalider le cache de la conversation
      this.conversationCache.delete(conversationId);
      
    } catch (error) {
      console.error('❌ Failed to add user to group:', error);
      throw new Error('Failed to add user to group');
    }
  }

  async removeUserFromGroup(conversationId: string, userId: string): Promise<void> {
    try {
      await apiClient.delete(`/messages/groups/${conversationId}/members/${userId}`);
      
      // Invalider le cache
      this.conversationCache.delete(conversationId);
      
    } catch (error) {
      console.error('❌ Failed to remove user from group:', error);
      throw new Error('Failed to remove user from group');
    }
  }

  async leaveGroup(conversationId: string): Promise<void> {
    try {
      await apiClient.delete(`/messages/groups/${conversationId}/members`);
      
      // Supprimer du cache
      this.conversationCache.delete(conversationId);
      this.messageCache.delete(conversationId);
      
    } catch (error) {
      console.error('❌ Failed to leave group:', error);
      throw new Error('Failed to leave group');
    }
  }

  // 🔄 Gestion du cache et utilitaires
  convertToDecryptedMessage(encryptedMessage: E2EEMessage): DecryptedMessage { // private ?
    return {
      id: encryptedMessage.id,
      senderId: encryptedMessage.senderId,
      recipientId: encryptedMessage.recipientId,
      conversationId: encryptedMessage.conversationId,
      content: encryptedMessage.encryptedContent, // Déjà déchiffré par le WebSocketService
      timestamp: encryptedMessage.timestamp,
      isFromMe: encryptedMessage.senderId === this.getCurrentUserId(),
    };
  }

  public createDecryptedMessageStub(messageData: any): DecryptedMessage {
    return {
      id: messageData.id,
      senderId: messageData.senderId,
      recipientId: messageData.recipientId,
      conversationId: messageData.conversationId,
      content: '[Encrypted - Will decrypt when received via WebSocket]',
      timestamp: messageData.createdAt,
      isFromMe: messageData.senderId === this.getCurrentUserId(),
      readAt: messageData.readAt
    };
  }

  private addMessageToCache(message: DecryptedMessage): void {
    const conversationMessages = this.messageCache.get(message.conversationId) || [];
    conversationMessages.push(message);
    this.messageCache.set(message.conversationId, conversationMessages);
  }

  private updateConversationLastMessage(message: DecryptedMessage): void {
    const conversation = this.conversationCache.get(message.conversationId);
    if (conversation) {
      conversation.lastMessage = message;
      if (!message.isFromMe) {
        conversation.unreadCount++;
      }
    }
  }

  private getConversationName(conv: any): string {
    if (conv.name) return conv.name;
    
    const otherUser = conv.userConversations?.find((uc: any) => 
      uc.user.id !== this.getCurrentUserId()
    );
    
    return otherUser?.user.username || 'Unknown';
  }

  private getCurrentUserId(): string {
    // À récupérer depuis le contexte d'auth
    return 'current-user-id'; // Placeholder
  }

  // 🧹 Nettoyage
  clearCache(): void {
    this.messageCache.clear();
    this.conversationCache.clear();
  }

  lockSession(): void {
    webSocketService.lockSession();
    this.clearCache();
  }
}

export const messagingService = new MessagingE2EEService();
export default messagingService;