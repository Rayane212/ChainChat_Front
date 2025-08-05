// src/components/chat/SecureChatHeader.tsx
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { E2EEStatusBadge } from '@/components/crypto/E2EEStatusBadge';
import { useMessaging } from '@/hooks/useMessaging';
import { ArrowLeft, MoreVertical, Users, Phone, Video } from 'lucide-react';

interface SecureChatHeaderProps {
  conversationId: string;
  onBack?: () => void;
}

export default function SecureChatHeader({ conversationId, onBack }: SecureChatHeaderProps) {
  const { getConversation } = useMessaging();
  const conversation = getConversation(conversationId);

  if (!conversation) {
    return (
      <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-surface">
        <div className="flex items-center space-x-3">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack} className="lg:hidden">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <div className="animate-pulse bg-muted h-10 w-10 rounded-full" />
          <div className="space-y-1">
            <div className="animate-pulse bg-muted h-4 w-24 rounded" />
            <div className="animate-pulse bg-muted h-3 w-16 rounded" />
          </div>
        </div>
      </div>
    );
  }

  const displayName = conversation.isGroup 
    ? conversation.name 
    : conversation.participants.find(p => p.id !== 'current-user-id')?.username || 'Unknown';

  const statusText = conversation.isGroup 
    ? `${conversation.participants.length} members`
    : 'Online'; // À améliorer avec le statut réel

  return (
    <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-surface">
      <div className="flex items-center space-x-3">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack} className="lg:hidden">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        )}

        <div className="relative">
          <Avatar className="w-10 h-10">
            <AvatarImage src="" />
            <AvatarFallback className="bg-purple-500/20 text-purple-400 font-semibold">
              {conversation.isGroup ? (
                <Users className="w-5 h-5" />
              ) : (
                (displayName || 'UN').slice(0, 2).toUpperCase()
              )}
            </AvatarFallback>
          </Avatar>
          
          {!conversation.isGroup && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-surface rounded-full" />
          )}
        </div>

        <div className="min-w-0">
          <div className="flex items-center space-x-2">
            <h2 className="font-semibold text-foreground text-sm truncate">
              {displayName}
            </h2>
            <E2EEStatusBadge />
          </div>
          <p className="text-xs text-foreground-muted">
            {statusText}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-1">
        <Button variant="ghost" size="icon" className="text-foreground-muted hover:text-foreground">
          <Phone className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="text-foreground-muted hover:text-foreground">
          <Video className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="text-foreground-muted hover:text-foreground">
          <MoreVertical className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}