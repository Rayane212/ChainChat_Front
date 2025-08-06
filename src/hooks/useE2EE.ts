import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthProvider';
import webSocketService, { E2EEMessage } from '@/services/websocket.service';
import messagingService, { DecryptedMessage } from '@/services/messaging.service';
import { NativeKeyManager } from '@/E2E/keyManager';
import { toast } from 'sonner';
import * as authService from '@/services/auth.service';

export interface E2EEState {
  isSessionUnlocked: boolean;
  isConnected: boolean;
  publicKey: string | null;
  hasKeys: boolean;
  keysStatus: 'unknown' | 'none' | 'exists' | 'unlocked';
}

export function useE2EE() {
  const { user } = useAuth();
  const [state, setState] = useState<E2EEState>({
    isSessionUnlocked: false,
    isConnected: false,
    publicKey: null,
    hasKeys: false,
    keysStatus: 'unknown'
  });
  const [isInitializing, setIsInitializing] = useState(false);
  const [lastMessages, setLastMessages] = useState<DecryptedMessage[]>([]);
  const [keyManager] = useState(new NativeKeyManager());

  // 🔍 Vérifier l'état des clés quand l'utilisateur change
  useEffect(() => {
    const checkKeysStatus = async () => {
      if (!user?.id) {
        setState(prev => ({ ...prev, keysStatus: 'unknown', hasKeys: false }));
        return;
      }

      try {
        const keysInfo = await keyManager.hasKeys(user.id.toString());
        if (keysInfo.hasPublic && keysInfo.hasPrivate) {
          setState(prev => ({ 
            ...prev, 
            hasKeys: true, 
            keysStatus: 'exists',
            publicKey: null // On récupère la clé publique seulement après déverrouillage
          }));
        } else {
          setState(prev => ({ 
            ...prev, 
            hasKeys: false, 
            keysStatus: 'none',
            publicKey: null
          }));
        }
      } catch (error) {
        console.error('❌ Failed to check keys status:', error);
        setState(prev => ({ ...prev, keysStatus: 'unknown', hasKeys: false }));
      }
    };

    checkKeysStatus();
  }, [user?.id, keyManager]);

  // 🔑 Créer des clés pour la première fois
  const createKeys = useCallback(async (password: string): Promise<boolean> => {
    if (!user?.id) {
      toast.error('User not authenticated');
      return false;
    }

    setIsInitializing(true);

    try {
      // 1. Initialiser les clés (génération + stockage)
      const keyInfo = await messagingService.initializeUserKeys(user.id.toString(), password);
      
      // 2. Connecter WebSocket avec info depuis le backend
      // const wsInfoResponse = await fetch(`${import.meta.env.VITE_API_URL}/ws-info`, {
      //   headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
      // });
      
      // if (!wsInfoResponse.ok) {
      //   throw new Error('Failed to get WebSocket info');
      // }
      
      // const wsInfo = await wsInfoResponse.json();
      console.log(" url", `${import.meta.env.BASE_WEBSOCKET_URL.toString()}`);
      await webSocketService.connect(`${import.meta.env.BASE_WEBSOCKET_URL.toString()}`, `${localStorage.getItem('accessToken')}`);

      // 3. Mettre à jour l'état
      setState({
        isSessionUnlocked: true,
        isConnected: webSocketService.isConnected(),
        publicKey: keyInfo.publicKey,
        hasKeys: true,
        keysStatus: 'unlocked'
      });

      toast.success('🔑 Encryption keys created and session unlocked!');
      return true;

    } catch (error) {
      console.error('❌ Failed to create keys:', error);
      toast.error('Failed to create encryption keys: ' + (error as Error).message);
      return false;
    } finally {
      setIsInitializing(false);
    }
  }, [user?.id]);

  // 🔓 Déverrouiller des clés existantes
  const unlockKeys = useCallback(async (password: string): Promise<boolean> => {
    if (!user?.id) {
      toast.error('User not authenticated');
      return false;
    }

    setIsInitializing(true);

    try {
      // 1. Déverrouiller la session (sans créer de nouvelles clés)
      await webSocketService.unlockSession(password, user.id);
      
      // 2. Récupérer la clé publique
      const publicKey = await keyManager.getPublicKey(user.id);
      
      // 3. Connecter WebSocket
      // const wsInfoResponse = await fetch(`${import.meta.env.VITE_API_URL}/ws-info`, {
      //   headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
      // });
      
      // if (!wsInfoResponse.ok) {
      //   throw new Error('Failed to get WebSocket info');
      // }
      
      // const wsInfo = await wsInfoResponse.json();
      console.log(" url", `${import.meta.env.BASE_WEBSOCKET_URL}`);
      await webSocketService.connect(`${import.meta.env.BASE_WEBSOCKET_URL.toString()}`, `${localStorage.getItem('accessToken')}`);

      // 4. Mettre à jour l'état
      setState({
        isSessionUnlocked: true,
        isConnected: webSocketService.isConnected(),
        publicKey,
        hasKeys: true,
        keysStatus: 'unlocked'
      });

      toast.success('🔓 Session unlocked successfully!');
      return true;

    } catch (error) {
      console.error('❌ Failed to unlock keys:', error);
      toast.error('Invalid password or corrupted keys');
      return false;
    } finally {
      setIsInitializing(false);
    }
  }, [user?.id, keyManager]);

  // 🔒 Verrouillage de session
  const lockSession = useCallback(() => {
    webSocketService.lockSession();
    webSocketService.disconnect();
    messagingService.clearCache();
    
    setState(prev => ({
      ...prev,
      isSessionUnlocked: false,
      isConnected: false,
      publicKey: null,
      keysStatus: prev.hasKeys ? 'exists' : 'none'
    }));

    toast.info('🔒 Session locked');
  }, []);

  // 🔄 Régénération des clés
  const regenerateKeys = useCallback(async (password: string): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      setIsInitializing(true);
      
      const keyInfo = await messagingService.regenerateKeys(user.id, password);
      
      setState(prev => ({
        ...prev,
        publicKey: keyInfo.publicKey,
        hasKeys: true,
        keysStatus: 'unlocked'
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
      setLastMessages(prev => [decryptedMessage, ...prev.slice(0, 9)]);
      
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

    webSocketService.onMessage(handleNewMessage);
    webSocketService.onConnectionChange(handleConnectionChange);

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
    // Actions selon l'état
    createKeys,      // Première fois - génération
    unlockKeys,      // Clés existantes - déverrouillage
    lockSession,
    regenerateKeys,
    // Méthode unifiée (deprecated - utiliser createKeys ou unlockKeys)
    initializeKeys: state.hasKeys ? unlockKeys : createKeys
  };
}