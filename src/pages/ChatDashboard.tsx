import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Phone, 
  Video,
  MoreVertical, 
  Shield,
  Users,
  Plus,
  Paperclip
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ChatDashboard() {
  const navigate = useNavigate();
  const [selectedChat, setSelectedChat] = useState(0);
  const [message, setMessage] = useState('');

  const chats = [
    { 
      id: 1, 
      name: 'Solana Builders', 
      type: 'group',
      lastMessage: 'New DeFi protocol launching soon!', 
      time: '2m ago', 
      unread: 3,
      avatar: 'SB',
      online: true
    },
    { 
      id: 2, 
      name: 'Alice Johnson', 
      type: 'direct',
      lastMessage: 'Thanks for the help with the smart contract', 
      time: '15m ago', 
      unread: 0,
      avatar: 'AJ',
      online: true
    },
    { 
      id: 3, 
      name: 'Dev Team', 
      type: 'group',
      lastMessage: 'Meeting at 3 PM tomorrow', 
      time: '1h ago', 
      unread: 1,
      avatar: 'DT',
      online: false
    },
    { 
      id: 4, 
      name: 'Bob Smith', 
      type: 'direct',
      lastMessage: 'See you at the conference!', 
      time: '2h ago', 
      unread: 0,
      avatar: 'BS',
      online: false
    },
  ];

  const messages = [
    { id: 1, sender: 'Alice Johnson', content: 'Hey! How\'s the new Solana project going?', time: '10:30 AM', sent: false },
    { id: 2, sender: 'You', content: 'Great! Just deployed the smart contract to devnet 🚀', time: '10:32 AM', sent: true },
    { id: 3, sender: 'Alice Johnson', content: 'Awesome! Can\'t wait to test it out. The UI looks amazing!', time: '10:33 AM', sent: false },
    { id: 4, sender: 'You', content: 'Thanks! I\'ll send you the link once it\'s ready for testing', time: '10:35 AM', sent: true },
  ];

  const handleSendMessage = () => {
    if (message.trim()) {
      // Handle sending message
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleChatClick = (chatIndex: number) => {
    setSelectedChat(chatIndex);
    // On mobile, navigate to conversation page
    if (window.innerWidth < 1024) {
      navigate(`/conversation/${chats[chatIndex].id}`);
    }
  };

  return (
    <div className="h-full flex">
      {/* Chat List - Hidden on mobile, shown in sidebar */}
      <div className="hidden lg:flex lg:w-80 lg:flex-col bg-surface border-r border-border">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Messages</h2>
            <Button size="sm" className="bg-purple-500 hover:bg-purple-600 text-white">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1 p-3">
          <div className="space-y-2 w-fit ">
            {chats.map((chat, index) => (
              <div
                key={chat.id}
                className={`p-4 cursor-pointer transition-colors rounded-xl ${
                  selectedChat === index 
                    ? 'bg-purple-500/20 border border-purple-500/30' 
                    : 'hover:bg-muted'
                }`}
                onClick={() => handleChatClick(index)}
              >
                <div className="flex items-start space-x-3 ">
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-purple-500/20 text-purple-400 font-semibold">
                        {chat.avatar}
                      </AvatarFallback>
                    </Avatar>
                    {chat.online && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-surface rounded-full"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-foreground truncate">{chat.name}</h3>
                        {chat.type === 'group' && (
                          <Users className="w-3 h-3 text-foreground-muted" />
                        )}
                      </div>
                      <span className="text-xs text-foreground-muted">{chat.time}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-foreground-muted truncate">{chat.lastMessage}</p>
                      {chat.unread > 0 && (
                        <Badge className="bg-purple-500 text-white text-xs h-5 px-2">
                          {chat.unread}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area - Desktop with Mobile Styling */}
      <div className="hidden lg:flex lg:flex-1 lg:flex-col">
        {/* Compact Header */}
        <div className="bg-surface border-b border-border px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src="" />
                <AvatarFallback className="bg-purple-500/20 text-purple-400 font-semibold">
                  {chats[selectedChat]?.avatar}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-bold text-foreground flex items-center space-x-2">
                  <span>{chats[selectedChat]?.name}</span>
                  <Shield className="w-4 h-4 text-green-500" />
                </h2>
                <p className="text-sm text-foreground-muted">
                  {chats[selectedChat]?.type === 'group' ? '12 members' : 'Online'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="text-foreground-muted hover:text-foreground p-2">
                <Phone className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-foreground-muted hover:text-foreground p-2">
                <Video className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-foreground-muted hover:text-foreground p-2">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages Area with Mobile Styling */}
        <ScrollArea className="flex-1 px-4 py-2">
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
                    "max-w-[320px] px-4 py-3 rounded-2xl transition-all duration-200 hover:scale-[1.02] cursor-pointer",
                    msg.sent 
                      ? 'bg-purple-500 text-white' 
                      : 'bg-[#2C2D36] text-foreground border border-purple-500/20'
                  )}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  <p className={cn(
                    "text-xs mt-2 text-right",
                    msg.sent ? 'text-white/70' : 'text-foreground-muted'
                  )}>
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Input Area with Mobile Styling */}
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
                value={message}
                onChange={(e) => setMessage(e.target.value)}
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
      </div>

      {/* Mobile Chat List */}
      <div className="lg:hidden flex-1 bg-background">
        <div className="p-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground">Messages</h2>
            <Button size="sm" className="bg-purple-500 hover:bg-purple-600 text-white rounded-xl">
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-3">
            {chats.map((chat, index) => (
              <div
                key={chat.id}
                className="p-4 bg-surface border border-border rounded-2xl cursor-pointer transition-all hover:border-purple-500/30 active:scale-[0.98]"
                onClick={() => handleChatClick(index)}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-purple-500/20 text-purple-400 font-semibold">
                        {chat.avatar}
                      </AvatarFallback>
                    </Avatar>
                    {chat.online && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-surface rounded-full"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-foreground">{chat.name}</h3>
                        {chat.type === 'group' && (
                          <Users className="w-4 h-4 text-foreground-muted" />
                        )}
                      </div>
                      <span className="text-xs text-foreground-muted">{chat.time}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-foreground-muted truncate">{chat.lastMessage}</p>
                      {chat.unread > 0 && (
                        <Badge className="bg-purple-500 text-white text-xs h-5 px-2 rounded-full">
                          {chat.unread}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}