import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthProvider';
import webSocketService, { E2EEMessage } from '@/services/websocket.service';
import messagingService, { DecryptedMessage } from '@/services/messaging.service';
import { toast } from 'sonner';

export interface E2EEState {
  isSessionUnlocked: boolean;
  isConnected: boolean;
  publicKey: string | null;
  hasKeys: boolean;
}

export function useE2EE() {
  const { user } = useAuth();
  const [state, setState] = useState<E2EEState>({
    isSessionUnlocked: false,
    isConnected: false,
    publicKey: null,
    hasKeys: false
  });
  const [isInitializing, setIsInitializing] = useState(false);
  const [lastMessages, setLastMessages] = useState<DecryptedMessage[]>([]);

  // 🔑 Initialisation des clés utilisateur
  const initializeKeys = useCallback(async (password: string): Promise<boolean> => {
    if (!user?.id) {
      toast.error('User not authenticated');
      return false;
    }

    setIsInitializing(true);

    try {
      // 1. Initialiser/charger les clés E2EE
      const keyInfo = await messagingService.initializeUserKeys(user.id, password);
      
      // 2. Connecter WebSocket
      const wsInfo = await fetch('/api/ws-info', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
      }).then(res => res.json());
      
      await webSocketService.connect(wsInfo.data.wsUrl, wsInfo.data.token);

      // 3. Mettre à jour l'état
      setState({
        isSessionUnlocked: true,
        isConnected: webSocketService.isConnected(),
        publicKey: keyInfo.publicKey,
        hasKeys: true
      });

      toast.success('🔓 E2EE session unlocked successfully');
      return true;

    } catch (error) {
      console.error('❌ Failed to initialize E2EE:', error);
      toast.error('Failed to unlock encryption keys');
      return false;
    } finally {
      setIsInitializing(false);
    }
  }, [user?.id]);

  // 🔒 Verrouillage de session
  const lockSession = useCallback(() => {
    webSocketService.lockSession();
    webSocketService.disconnect();
    messagingService.clearCache();
    
    setState({
      isSessionUnlocked: false,
      isConnected: false,
      publicKey: null,
      hasKeys: state.hasKeys // Garder l'info que les clés existent
    });

    toast.info('🔒 Session locked');
  }, [state.hasKeys]);

  // 🔄 Régénération des clés
  const regenerateKeys = useCallback(async (password: string): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      setIsInitializing(true);
      
      const keyInfo = await messagingService.regenerateKeys(user.id, password);
      
      setState(prev => ({
        ...prev,
        publicKey: keyInfo.publicKey
      }));

      toast.success('🔑 Encryption keys regenerated successfully');
      return true;

    } catch (error) {
      console.error('❌ Failed to regenerate keys:', error);
      toast.error('Failed to regenerate keys');
      return false;
    } finally {
      setIsInitializing(false);
    }
  }, [user?.id]);

  // 📨 Listeners pour les messages entrants
  useEffect(() => {
    const handleNewMessage = (encryptedMessage: E2EEMessage) => {
      const decryptedMessage = messagingService.convertToDecryptedMessage(encryptedMessage);
      setLastMessages(prev => [decryptedMessage, ...prev.slice(0, 9)]); // Garder les 10 derniers
      
      // Notification toast pour nouveau message
      if (!decryptedMessage.isFromMe) {
        toast.info(`💬 New message from ${decryptedMessage.senderName || 'Unknown'}`, {
          description: decryptedMessage.content.substring(0, 50) + (decryptedMessage.content.length > 50 ? '...' : '')
        });
      }
    };

    const handleConnectionChange = (connected: boolean) => {
      setState(prev => ({ ...prev, isConnected: connected }));
      
      if (connected) {
        toast.success('🔌 Connected to messaging service');
      } else {
        toast.warning('🔌 Disconnected from messaging service');
      }
    };

    // Enregistrer les listeners
    webSocketService.onMessage(handleNewMessage);
    webSocketService.onConnectionChange(handleConnectionChange);

    // Cleanup sera géré par le service
    return () => {
      // Les listeners sont persistants dans le service
    };
  }, []);

  // 🔄 Vérification de l'état au montage
  useEffect(() => {
    setState(prev => ({
      ...prev,
      isSessionUnlocked: webSocketService.isSessionUnlocked(),
      isConnected: webSocketService.isConnected()
    }));
  }, []);

  return {
    ...state,
    isInitializing,
    lastMessages,
    initializeKeys,
    lockSession,
    regenerateKeys
  };
}

