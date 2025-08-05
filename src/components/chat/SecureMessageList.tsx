import { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useMessaging } from '@/hooks/useMessaging';
import { useE2EE } from '@/hooks/useE2EE';
import { DecryptedMessage } from '@/services/messaging.service';
import { Lock, LockOpen, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface SecureMessageListProps {
  conversationId: string;
  className?: string;
}

export default function SecureMessageList({ conversationId, className }: SecureMessageListProps) {
  const { isSessionUnlocked } = useE2EE();
  const { getMessages, loadMessages } = useMessaging();
  const scrollRef = useRef<HTMLDivElement>(null);

  const messages = getMessages(conversationId);

  // Charger les messages au montage
  useEffect(() => {
    if (conversationId && isSessionUnlocked) {
      loadMessages(conversationId);
    }
  }, [conversationId, isSessionUnlocked, loadMessages]);

  // Auto-scroll vers le bas
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const formatMessageTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return format(date, 'HH:mm');
    } else if (diffInHours < 24 * 7) {
      return format(date, 'EEE HH:mm');
    } else {
      return format(date, 'dd/MM HH:mm');
    }
  };

  const MessageBubble = ({ message }: { message: DecryptedMessage }) => {
    const isFromMe = message.isFromMe;
    const isEncrypted = message.content !== '[Encrypted - Will decrypt when received via WebSocket]';

    return (
      <div className={cn(
        "flex animate-in slide-in-from-bottom-2 duration-200 mb-4",
        isFromMe ? 'justify-end' : 'justify-start'
      )}>
        {!isFromMe && (
          <Avatar className="w-8 h-8 mr-2 mt-1">
            <AvatarImage src="" />
            <AvatarFallback className="bg-purple-500/20 text-purple-400 text-xs">
              {message.senderName?.slice(0, 2).toUpperCase() || 'UN'}
            </AvatarFallback>
          </Avatar>
        )}

        <div className={cn(
          "max-w-[320px] group",
          isFromMe ? 'items-end' : 'items-start'
        )}>
          {!isFromMe && (
            <div className="text-xs text-foreground-muted mb-1">
              {message.senderName || 'Unknown'}
            </div>
          )}

          <div className={cn(
            "px-4 py-3 rounded-2xl transition-all duration-200 hover:scale-[1.02] cursor-pointer relative",
            isFromMe 
              ? 'bg-purple-500 text-white rounded-br-md' 
              : 'bg-surface border border-purple-500/20 text-foreground rounded-bl-md'
          )}>
            {/* Security indicator */}
            <div className="absolute top-1 right-1">
              {isEncrypted ? (
                <div title="Decrypted">
                  <LockOpen className="w-2 h-2 text-green-400 opacity-60" />
                </div>
              ) : (
                <div title="Encrypted">
                  <Lock className="w-2 h-2 text-yellow-400 opacity-60" />
                </div>
              )}
            </div>

            {isEncrypted ? (
              <p className="text-sm leading-relaxed whitespace-pre-wrap pr-4">{message.content}</p>
            ) : (
              <div className="flex items-center space-x-2 pr-4">
                <EyeOff className="w-4 h-4 text-foreground-muted" />
                <span className="text-sm text-foreground-muted italic">
                  {isSessionUnlocked ? 'Decrypting...' : 'Unlock keys to view'}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between mt-2">
              <p className={cn(
                "text-xs",
                isFromMe ? 'text-white/70' : 'text-foreground-muted'
              )}>
                {formatMessageTime(message.timestamp)}
              </p>

              {isFromMe && (
                <div className="flex items-center space-x-1">
                  {message.readAt ? (
                    <Badge variant="outline" className="text-xs px-1 py-0 h-4 border-white/20 text-white/70">
                      Read
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs px-1 py-0 h-4 border-white/20 text-white/70">
                      Sent
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <ScrollArea 
      className={cn("flex-1 px-4 py-2", className)}
      ref={scrollRef}
    >
      <div className="space-y-1 pb-4">
        {!isSessionUnlocked && (
          <div className="text-center py-8">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-yellow-500/10 text-yellow-400 rounded-full text-sm">
              <Lock className="w-4 h-4" />
              <span>Unlock your keys to view encrypted messages</span>
            </div>
          </div>
        )}

        {messages.length === 0 && isSessionUnlocked ? (
          <div className="text-center py-8 text-foreground-muted">
            <div className="inline-flex items-center space-x-2 text-sm">
              <LockOpen className="w-4 h-4 text-green-400" />
              <span>Start a secure conversation</span>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))
        )}
      </div>
    </ScrollArea>
  );
}