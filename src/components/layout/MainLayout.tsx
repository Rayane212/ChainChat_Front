import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import UnlockKeysDialog from '@/components/crypto/UnlockKeysDialog';
import { useE2EE } from '@/hooks/useE2EE';
import { useAuth } from '@/context/AuthProvider';
import { toast } from 'sonner';

export default function MainLayout() {
  const { user, isAuthenticated } = useAuth();
  const { isSessionUnlocked, hasKeys, keysStatus, isInitializing } = useE2EE();
  const [showUnlockDialog, setShowUnlockDialog] = useState(false);

  // ✅ NOUVEAU : Vérifier l'état E2EE avec le nouveau système
  useEffect(() => {
    if (isAuthenticated && user && !isInitializing) {
      // Ouvrir le dialog si l'utilisateur doit créer ou déverrouiller des clés
      if (keysStatus === 'none' || keysStatus === 'exists') {
        // Délai pour laisser l'interface se charger
        const timer = setTimeout(() => {
          setShowUnlockDialog(true);
        }, 1000);

        return () => clearTimeout(timer);
      }
    }
  }, [isAuthenticated, user, keysStatus, isInitializing]);

  // Callback quand les clés sont créées ou déverrouillées avec succès
  const handleKeysUnlocked = () => {
    setShowUnlockDialog(false);
    
    // Toast de bienvenue adapté selon le cas
    if (keysStatus === 'none') {
      toast.success('🔑 Encryption keys created successfully!', {
        description: 'Your account is now secured with end-to-end encryption.'
      });
    } else {
      toast.success('🔓 Session unlocked successfully!', {
        description: 'End-to-end encryption is now active.'
      });
    }
  };

  // Callback si l'utilisateur ferme le dialog sans agir
  const handleDialogClose = (open: boolean) => {
    setShowUnlockDialog(open);
    
    if (!open && !isSessionUnlocked) {
      // Avertir selon le cas
      if (keysStatus === 'none') {
        toast.warning('🔑 Encryption keys not created', {
          description: 'You will not be able to send or receive encrypted messages until you create your keys.'
        });
      } else {
        toast.warning('🔒 Session remains locked', {
          description: 'You can view conversations but cannot send messages until you unlock your keys.'
        });
      }
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 border-r border-border bg-surface flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Outlet />
      </div>

      {/* Dialog de déverrouillage des clés E2EE */}
      <UnlockKeysDialog
        open={showUnlockDialog}
        onOpenChange={handleDialogClose}
        onSuccess={handleKeysUnlocked}
      />
    </div>
  );
}