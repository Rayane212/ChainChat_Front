import { io, Socket } from 'socket.io-client';
import { encryptMessage, decryptMessage, deriveSharedSecret, decryptGroupSharedSecret } from '@/E2E/encryption';
import { SodiumKeyManager, SessionManager } from '@/E2E/keyManager';

export interface E2EEMessage {
  id: string;
  senderId: string;
  recipientId?: string;
  conversationId: string;
  encryptedContent: string;
  nonce: string;
  signature?: string;
  timestamp: string;
}

export interface PublicKeyResponse {
  userId: string;
  publicKey: string;
}

class WebSocketE2EEService {
  private socket: Socket | null = null;
  private sessionManager: SessionManager;
  private keyManager: SodiumKeyManager;
  private messageHandlers: Array<(message: E2EEMessage) => void> = [];
  private connectionHandlers: Array<(connected: boolean) => void> = [];
  private publicKeyCache: Map<string, string> = new Map();

  constructor() {
    this.sessionManager = new SessionManager();
    this.keyManager = new SodiumKeyManager();
  }

  async connect(wsUrl: string, token: string): Promise<void> {
    if (this.socket?.connected) return;

    this.socket = io(wsUrl, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.setupEventHandlers();
    
    return new Promise((resolve, reject) => {
      this.socket!.on('connect', () => {
        console.log('✅ WebSocket connected');
        this.notifyConnectionHandlers(true);
        resolve();
      });

      this.socket!.on('connect_error', (error) => {
        console.error('❌ WebSocket connection error:', error);
        this.notifyConnectionHandlers(false);
        reject(error);
      });
    });
  }

  private setupEventHandlers(): void {
    if (!this.socket) return;

    // Réception de message chiffré
    this.socket.on('messageReceived', async (data: E2EEMessage) => {
      try {
        const decryptedMessage = await this.decryptReceivedMessage(data);
        if (decryptedMessage) {
          this.notifyMessageHandlers(decryptedMessage);
        }
      } catch (error) {
        console.error('❌ Failed to decrypt received message:', error);
      }
    });

    // Réception de clé publique
    this.socket.on('publicKey', (data: PublicKeyResponse) => {
      this.publicKeyCache.set(data.userId, data.publicKey);
    });

    // Gestion des déconnexions
    this.socket.on('disconnect', () => {
      console.log('🔌 WebSocket disconnected');
      this.notifyConnectionHandlers(false);
    });

    this.socket.on('error', (error) => {
      console.error('❌ WebSocket error:', error);
    });
  }

  async sendMessage(recipientId: string, content: string, conversationId: string): Promise<void> {
    if (!this.socket?.connected) {
      throw new Error('WebSocket not connected');
    }

    const keys = this.sessionManager.getKeys();
    if (!keys) {
      throw new Error('User session locked - please unlock your keys first');
    }

    try {
      // 1. Obtenir la clé publique du destinataire
      const recipientPublicKey = await this.getPublicKey(recipientId);
      
      // 2. Dériver la clé partagée
      const sharedSecret = await deriveSharedSecret(keys.privateKey, recipientPublicKey);
      
      // 3. Chiffrer le message
      const encryptedMessage = await encryptMessage(content, sharedSecret);
      
      // 4. Préparer le payload (SANS clé privée!)
      const messagePayload = {
        recipientId,
        conversationId,
        content: encryptedMessage.ciphertext,
        nonce: encryptedMessage.nonce,
        // ✅ Pas de clé privée envoyée!
      };

      // 5. Envoyer via WebSocket
      this.socket.emit('sendMessage', JSON.stringify(messagePayload));
      
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      throw error;
    }
  }

  async sendGroupMessage(conversationId: string, content: string): Promise<void> {
    if (!this.socket?.connected) {
      throw new Error('WebSocket not connected');
    }

    const keys = this.sessionManager.getKeys();
    if (!keys) {
      throw new Error('User session locked');
    }

    try {
      // 1. Obtenir la clé de groupe (déjà chiffrée pour nous)
      const groupSharedSecret = await this.getGroupSharedSecret(conversationId, keys.privateKey, keys.publicKey);
      
      // 2. Chiffrer le message avec la clé de groupe
      const encryptedMessage = await encryptMessage(content, groupSharedSecret);
      
      // 3. Envoyer (le serveur redistribuera)
      const messagePayload = {
        conversationId,
        content: encryptedMessage.ciphertext,
        nonce: encryptedMessage.nonce,
        isGroup: true
      };

      this.socket.emit('sendMessage', JSON.stringify(messagePayload));
      
    } catch (error) {
      console.error('❌ Failed to send group message:', error);
      throw error;
    }
  }

  private async decryptReceivedMessage(encryptedMessage: E2EEMessage): Promise<E2EEMessage | null> {
    const keys = this.sessionManager.getKeys();
    if (!keys) {
      console.warn('⚠️ Cannot decrypt message - user session locked');
      return null;
    }

    try {
      // 1. Obtenir la clé publique de l'expéditeur
      const senderPublicKey = await this.getPublicKey(encryptedMessage.senderId);
      
      // 2. Dériver la clé partagée
      const sharedSecret = await deriveSharedSecret(keys.privateKey, senderPublicKey);
      
      // 3. Déchiffrer le contenu
      const decryptedContent = await decryptMessage(
        encryptedMessage.encryptedContent,
        encryptedMessage.nonce,
        sharedSecret
      );

      if (!decryptedContent) {
        throw new Error('Failed to decrypt message content');
      }

      // 4. Retourner le message déchiffré
      return {
        ...encryptedMessage,
        encryptedContent: decryptedContent, // Maintenant c'est le contenu en clair
      };

    } catch (error) {
      console.error('❌ Failed to decrypt message:', error);
      return null;
    }
  }

  private async getPublicKey(userId: string): Promise<string> {
    // 1. Vérifier le cache
    if (this.publicKeyCache.has(userId)) {
      return this.publicKeyCache.get(userId)!;
    }

    // 2. Demander au serveur (via API REST)
    try {
      const response = await fetch(`/api/users/${userId}/public-key`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      const data = await response.json();
      const publicKey = data.data.publicKey;
      
      this.publicKeyCache.set(userId, publicKey);
      return publicKey;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to get public key for user ${userId}: ${errorMessage}`);
    }
  }

  private async getGroupSharedSecret(conversationId: string, privateKey: string, publicKey: string): Promise<string> {
    try {
      // Récupérer la clé de groupe chiffrée depuis l'API
      const response = await fetch(`/api/groups/${conversationId}/shared-secret`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      const data = await response.json();
      const encryptedSharedSecret = data.data.encryptedSharedSecret;
      
      // Déchiffrer avec nos clés
      return await decryptGroupSharedSecret(encryptedSharedSecret, privateKey, publicKey);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to get group shared secret: ${errorMessage}`);
    }
  }

  // 📝 Event handlers
  onMessage(handler: (message: E2EEMessage) => void): void {
    this.messageHandlers.push(handler);
  }

  onConnectionChange(handler: (connected: boolean) => void): void {
    this.connectionHandlers.push(handler);
  }

  private notifyMessageHandlers(message: E2EEMessage): void {
    this.messageHandlers.forEach(handler => handler(message));
  }

  private notifyConnectionHandlers(connected: boolean): void {
    this.connectionHandlers.forEach(handler => handler(connected));
  }

  // 🔌 Connection management
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.publicKeyCache.clear();
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  // 🔑 Session management
  async unlockSession(password: string, userId: string): Promise<void> {
    try {
      await this.sessionManager.unlock(password, userId);
      console.log('🔓 Session unlocked successfully');
    } catch (error) {
      console.error('❌ Failed to unlock session:', error);
      throw new Error('Invalid password or corrupted keys');
    }
  }

  lockSession(): void {
    this.sessionManager.lock();
    console.log('🔒 Session locked');
  }

  isSessionUnlocked(): boolean {
    return this.sessionManager.isUnlocked();
  }
}

export const webSocketService = new WebSocketE2EEService();
export default webSocketService;