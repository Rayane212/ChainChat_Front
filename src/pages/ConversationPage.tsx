import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Send,
  Paperclip,
  Image,
  File,
  MessageSquare,
  Users,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: number;
  content: string;
  timestamp: string;
  sent: boolean;
  type: 'text' | 'image' | 'file';
  mediaUrl?: string;
  fileName?: string;
}

interface Contact {
  id: string;
  name: string;
  avatar: string;
  online: boolean;
  lastSeen?: string;
}

export default function ConversationPage() {
  const navigate = useNavigate();
  const { contactId } = useParams();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      content: "Hey! How's the new Solana project going?",
      timestamp: '10:30 AM',
      sent: false,
      type: 'text'
    },
    {
      id: 2,
      content: "Great! Just deployed the smart contract to devnet 🚀",
      timestamp: '10:32 AM',
      sent: true,
      type: 'text'
    },
    {
      id: 3,
      content: "Awesome! Can't wait to test it out. The UI looks amazing!",
      timestamp: '10:33 AM',
      sent: false,
      type: 'text'
    },
    {
      id: 4,
      content: "Thanks! I'll send you the link once it's ready for testing",
      timestamp: '10:35 AM',
      sent: true,
      type: 'text'
    },
    {
      id: 5,
      content: "Here's the mockup I was working on",
      timestamp: '10:36 AM',
      sent: false,
      type: 'image',
      mediaUrl: 'https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 6,
      content: "Perfect! The design looks clean and modern 👌",
      timestamp: '10:38 AM',
      sent: true,
      type: 'text'
    }
  ]);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Mock contact data
  const contact: Contact = {
    id: contactId || '1',
    name: 'Alice Johnson',
    avatar: 'AJ',
    online: true,
    lastSeen: 'last seen recently'
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage: Message = {
        id: messages.length + 1,
        content: message.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sent: true,
        type: 'text'
      };
      
      setMessages(prev => [...prev, newMessage]);
      setMessage('');
      
      // Auto-resize textarea
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const navigationItems = [
    { icon: MessageSquare, label: 'Chats', path: '/app/chat', badge: 3 },
    { icon: Users, label: 'Contacts', path: '/app/contacts', badge: 0 },
    { icon: Settings, label: 'Settings', path: '/app/settings', badge: 0 }
  ];

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Compact Header */}
      <div className="bg-surface border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/app/chat')}
              className="text-foreground-muted hover:text-foreground p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex flex-col items-center text-center">
            <h2 className="font-bold text-foreground text-lg">{contact.name}</h2>
            <p className="text-xs text-foreground-muted">
              {contact.online ? 'online' : contact.lastSeen}
            </p>
          </div>

          <Avatar className="w-10 h-10">
            <AvatarImage src="" />
            <AvatarFallback className="bg-purple-500/20 text-purple-400 font-semibold text-sm">
              {contact.avatar}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 px-4 py-2">
        <div className="space-y-3 pb-4">
          {messages.map((msg, index) => (
            <div
              key={msg.id}
              className={cn(
                "flex animate-in slide-in-from-bottom-2 duration-200",
                msg.sent ? 'justify-end' : 'justify-start'
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div
                className={cn(
                  "max-w-[280px] px-4 py-3 rounded-2xl transition-all duration-200 hover:scale-[1.02] cursor-pointer",
                  msg.sent 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-[#2C2D36] text-foreground-muted border border-purple-500/20'
                )}
                onClick={() => {
                  if (msg.type === 'image' && msg.mediaUrl) {
                    // Handle image preview
                    console.log('Open image preview:', msg.mediaUrl);
                  }
                }}
              >
                {msg.type === 'image' && msg.mediaUrl ? (
                  <div className="space-y-2">
                    <div className="relative overflow-hidden rounded-xl">
                      <img 
                        src={msg.mediaUrl} 
                        alt="Shared image"
                        className="w-full h-32 object-cover"
                      />
                      <div className="absolute inset-0 bg-black/10 hover:bg-black/20 transition-colors" />
                    </div>
                    {msg.content && (
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    )}
                  </div>
                ) : msg.type === 'file' ? (
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white/10 rounded-lg">
                      <File className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{msg.fileName}</p>
                      <p className="text-xs opacity-70">Document</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                )}
                
                <p className={cn(
                  "text-xs mt-2 text-right",
                  msg.sent ? 'text-white/70' : 'text-foreground-muted'
                )}>
                  {msg.timestamp}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="bg-surface border-t border-border p-4">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            className="text-foreground-muted hover:text-foreground p-2 shrink-0"
          >
            <Paperclip className="w-5 h-5" />
          </Button>

          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleTextareaChange}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="w-full min-h-[44px] max-h-[120px] px-4 py-2 pr-12 bg-[#1C1D26] border border-border rounded-full resize-none focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-foreground placeholder:text-foreground-muted text-sm leading-relaxed"
              rows={1}
            />
            
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim()}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-500/50 text-white rounded-full w-8 h-8 p-0 transition-all duration-200 hover:scale-110 disabled:hover:scale-100"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Bar */}
      <div className="bg-surface border-t border-border">
        <div className="flex items-center justify-around py-2">
          {navigationItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = item.path === '/app/chat'; // Current page logic
            
            return (
              <Button
                key={index}
                variant="ghost"
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex flex-col items-center space-y-1 py-3 px-4 transition-colors",
                  isActive 
                    ? "text-purple-400" 
                    : "text-foreground-muted hover:text-foreground"
                )}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {item.badge > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs h-4 w-4 p-0 flex items-center justify-center rounded-full">
                      {item.badge}
                    </Badge>
                  )}
                </div>
                <span className="text-xs font-medium">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}