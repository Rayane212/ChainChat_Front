import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useMessaging } from '@/hooks/useMessaging';
import { useE2EE } from '@/hooks/useE2EE';
import { Send, Paperclip, Lock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface SecureChatInputProps {
  conversationId: string;
  recipientId?: string;
  isGroup?: boolean;
  placeholder?: string;
  onMessageSent?: () => void;
}

export default function SecureChatInput({ 
  conversationId, 
  recipientId, 
  isGroup = false,
  placeholder = "Type your message...",
  onMessageSent 
}: SecureChatInputProps) {
  const { isSessionUnlocked } = useE2EE();
  const { sendMessage, sendGroupMessage } = useMessaging();
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;
    
    if (!isSessionUnlocked) {
      toast.error('🔒 Session locked - please unlock your keys first');
      return;
    }

    try {
      setIsSending(true);
      
      if (isGroup) {
        await sendGroupMessage(conversationId, message.trim());
      } else if (recipientId) {
        await sendMessage(recipientId, message.trim(), conversationId);
      } else {
        throw new Error('No recipient specified');
      }

      setMessage('');
      onMessageSent?.();
      
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = message.trim().length > 0 && isSessionUnlocked && !isSending;

  return (
    <div className="border-t border-border p-4 bg-surface/50">
      <div className="flex items-end space-x-3">
        {/* Attachment button */}
        <Button
          variant="ghost"
          size="sm"
          className="text-foreground-muted hover:text-foreground p-2 shrink-0"
          disabled={!isSessionUnlocked}
        >
          <Paperclip className="w-5 h-5" />
        </Button>

        {/* Message input */}
        <div className="flex-1 relative">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isSessionUnlocked ? placeholder : "🔒 Unlock your keys to send messages"}
            disabled={!isSessionUnlocked}
            className="min-h-[44px] max-h-[120px] px-4 py-2 pr-12 bg-background/50 border-border rounded-2xl resize-none focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-foreground placeholder:text-foreground-muted text-sm leading-relaxed"
            rows={1}
          />
          
          {/* Security indicator */}
          {isSessionUnlocked && (
            <div className="absolute right-12 top-1/2 transform -translate-y-1/2" title="End-to-end encrypted">
              <Lock className="w-3 h-3 text-green-400" />
            </div>
          )}

          {/* Send button */}
          <Button
            onClick={handleSend}
            disabled={!canSend}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-500/50 text-white rounded-full w-8 h-8 p-0 transition-all duration-200 hover:scale-110 disabled:hover:scale-100"
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {!isSessionUnlocked && (
        <div className="mt-2 text-xs text-yellow-400 flex items-center space-x-1">
          <Lock className="w-3 h-3" />
          <span>Messages are end-to-end encrypted. Unlock your keys to participate.</span>
        </div>
      )}
    </div>
  );
}



