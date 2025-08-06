import apiClient from '@/api/apiClient';
import webSocketService, { E2EEMessage } from './websocket.service';
import { generateKeyPair } from '@/E2E/encryption';
import { NativeKeyManager } from '@/E2E/keyManager';

export interface DecryptedMessage {
  id: string;
  senderId: string;
  senderName?: string;
  recipientId?: string;
  conversationId: string;
  content: string;
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
  private keyManager: NativeKeyManager;
  private messageCache: Map<string, DecryptedMessage[]> = new Map();
  private conversationCache: Map<string, Conversation> = new Map();
  private currentUserId: string | null = null;

  constructor() {
    this.keyManager = new NativeKeyManager();
    this.setupWebSocketHandlers();
    this.initializeCurrentUser();
  }

  // ✅ FIX : Récupérer le vrai userId depuis localStorage/JWT
  private initializeCurrentUser() {
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        // Décoder le JWT pour récupérer l'ID utilisateur
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.currentUserId = payload.id || payload.sub;
      }
    } catch (error) {
      console.warn('Could not extract user ID from token:', error);
    }
  }

  private setupWebSocketHandlers(): void {
    webSocketService.onMessage((encryptedMessage: E2EEMessage) => {
      const decryptedMessage = this.convertToDecryptedMessage(encryptedMessage);
      this.addMessageToCache(decryptedMessage);
      this.updateConversationLastMessage(decryptedMessage);
    });
  }

  // 🔑 Gestion des clés E2EE
  async initializeUserKeys(userId: string, password: string): Promise<{ publicKey: string; privateKey: string }> {
    // ✅ DEBUG : Vérifier les paramètres reçus
    console.log('🔑 messagingService.initializeUserKeys called with:', {
      userId,
      passwordType: typeof password,
      passwordLength: password?.length,
      passwordValue: password // ⚠️ À supprimer en production
    });

    try {
      // Validation des paramètres
      if (!userId || typeof userId !== 'string') {
        throw new Error('Invalid user ID');
      }

      if (!password || typeof password !== 'string' || password.trim().length === 0) {
        throw new Error('Invalid password provided');
      }

      const trimmedPassword = password.trim();
      
      console.log('🔍 After trim:', {
        originalPassword: password,
        trimmedPassword: trimmedPassword,
        trimmedType: typeof trimmedPassword,
        trimmedLength: trimmedPassword?.length
      });

      // Vérifier si les clés existent déjà
      const hasKeys = await this.keyManager.hasKeys(userId);
      
      if (hasKeys.hasPrivate && hasKeys.hasPublic) {
        // Clés existantes - déverrouiller la session
        console.log('🔓 Keys exist, unlocking session...');
        await webSocketService.unlockSession(trimmedPassword, userId);
        const publicKey = await this.keyManager.getPublicKey(userId);
        
        return {
          publicKey,
          privateKey: '[PROTECTED]' // Ne jamais exposer la clé privée
        };
      }

      // Test préalable de generateKeyPair
      console.log('🧪 Testing generateKeyPair function...');
      try {
        const testResult = await generateKeyPair();
        console.log('✅ GenerateKeyPair test successful:', {
          hasPublicKey: !!testResult?.publicKey,
          hasPrivateKey: !!testResult?.privateKey,
          publicKeyLength: testResult?.publicKey?.length,
          privateKeyLength: testResult?.privateKey?.length
        });
      } catch (testError) {
        console.error('❌ GenerateKeyPair test failed:', testError);
        throw new Error('generateKeyPair function is not working: ' + (testError instanceof Error ? testError.message : String(testError)));
      }

      // Générer de nouvelles clés
      console.log('🔑 Generating new keys...');
      const { publicKey, privateKey } = await generateKeyPair();
      console.log('✅ Keys generated, storing...');
      
      // Stocker les clés de manière sécurisée
      await this.keyManager.storePrivateKey(privateKey, trimmedPassword, userId);
      console.log('✅ Private key stored');
      
      await this.keyManager.storePublicKey(publicKey, userId);
      console.log('✅ Public key stored');
      
      // Déverrouiller la session
      await webSocketService.unlockSession(trimmedPassword, userId);
      console.log('✅ Session unlocked');
      
      // Envoyer la clé publique au serveur
      await this.registerPublicKey(publicKey);
      console.log('✅ Public key registered with server');
      
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
      await this.keyManager.deleteUserKeys(userId);
      
      const { publicKey, privateKey } = await generateKeyPair();
      
      await this.keyManager.storePrivateKey(privateKey, password, userId);
      await this.keyManager.storePublicKey(publicKey, userId);
      await webSocketService.unlockSession(password, userId);
      await this.registerPublicKey(publicKey);
      
      return { publicKey };
      
    } catch (error) {
      console.error('❌ Failed to regenerate keys:', error);
      throw new Error('Failed to regenerate encryption keys');
    }
  }

  // ✅ FIX : Endpoint correct pour votre backend
  private async registerPublicKey(publicKey: string): Promise<void> {
    try {
      // Utiliser l'endpoint de votre messaging service
      await apiClient.post('/messages/public-key', {
        publicKey
      });
    } catch (error) {
      console.error('❌ Failed to register public key:', error);
      // Ne pas bloquer si l'endpoint n'existe pas encore
      console.warn('Public key registration endpoint may not be implemented yet');
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

    const finalConversationId = conversationId || this.generateConversationId(recipientId);
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

  // 📋 Gestion des conversations - ✅ FIX : Endpoints alignés
  async getConversations(): Promise<Conversation[]> {
    try {
      // Utiliser l'endpoint de votre backend
      const response = await apiClient.get('/messages');
      const conversationsData = response.data.data || response.data;

      const conversations: Conversation[] = conversationsData.map((conv: any) => ({
        id: conv.id,
        name: conv.name || this.getConversationName(conv),
        isGroup: conv.isGroup || false,
        participants: conv.userConversations?.map((uc: any) => ({
          id: uc.user.id,
          username: uc.user.username,
          publicKey: uc.user.publicKey
        })) || [],
        lastMessage: conv.messages?.[0] ? this.createDecryptedMessageStub(conv.messages[0]) : undefined,
        unreadCount: 0,
        createdAt: conv.createdAt || new Date().toISOString()
      }));

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
    if (this.messageCache.has(conversationId)) {
      return this.messageCache.get(conversationId)!;
    }

    try {
      // ✅ FIX : Endpoint correct
      const response = await apiClient.get(`/messages/conversations/${conversationId}/messages`);
      const messagesData = response.data.data || response.data;

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

      const groupData = response.data.data || response.data;
      
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

  // 🔄 Utilitaires
  convertToDecryptedMessage(encryptedMessage: E2EEMessage): DecryptedMessage {
    return {
      id: encryptedMessage.id,
      senderId: encryptedMessage.senderId,
      recipientId: encryptedMessage.recipientId,
      conversationId: encryptedMessage.conversationId,
      content: encryptedMessage.encryptedContent,
      timestamp: encryptedMessage.timestamp,
      isFromMe: encryptedMessage.senderId === this.getCurrentUserId(),
    };
  }

  createDecryptedMessageStub(messageData: any): DecryptedMessage {
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

  private generateConversationId(recipientId: string): string {
    const currentUserId = this.getCurrentUserId();
    return [recipientId, currentUserId].sort().join('-');
  }

  // ✅ FIX : getCurrentUserId() avec logging d'erreurs amélioré
  private getCurrentUserId(): string {
    if (this.currentUserId) {
      return this.currentUserId;
    }

    // Fallback : essayer de récupérer depuis le token
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.currentUserId = payload.id || payload.sub;
        
        if (this.currentUserId) {
          console.log('✅ User ID recovered from token:', this.currentUserId);
          return this.currentUserId;
        }
      }
    } catch (error) {
      console.error('❌ Could not extract user ID from token:', error);
    }

    console.warn('⚠️ Using fallback user ID - this may cause issues');
    return 'unknown';
  }

  // 🔄 Mise à jour de l'ID utilisateur (appelé après login)
  updateCurrentUserId(userId: string): void {
    this.currentUserId = userId;
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