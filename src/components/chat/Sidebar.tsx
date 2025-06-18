import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  Pin, 
  VolumeX, 
  Users, 
  Shield,
  MessageSquare,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Chat {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
  isOnline: boolean;
  isGroup: boolean;
  isVerified?: boolean;
}

const mockChats: Chat[] = [
  {
    id: '1',
    name: 'Solana Builders',
    lastMessage: 'New DeFi protocol launching soon! 🚀',
    timestamp: '2m',
    unreadCount: 3,
    isPinned: true,
    isMuted: false,
    isOnline: true,
    isGroup: true,
    isVerified: true
  },
  {
    id: '2',
    name: 'Alice Johnson',
    avatar: 'AJ',
    lastMessage: 'Thanks for the smart contract review',
    timestamp: '15m',
    unreadCount: 0,
    isPinned: true,
    isMuted: false,
    isOnline: true,
    isGroup: false
  },
  {
    id: '3',
    name: 'Dev Team',
    avatar: 'DT',
    lastMessage: 'Meeting at 3 PM tomorrow',
    timestamp: '1h',
    unreadCount: 1,
    isPinned: false,
    isMuted: false,
    isOnline: false,
    isGroup: true
  },
  {
    id: '4',
    name: 'Bob Smith',
    avatar: 'BS',
    lastMessage: 'See you at the conference!',
    timestamp: '2h',
    unreadCount: 0,
    isPinned: false,
    isMuted: true,
    isOnline: false,
    isGroup: false
  },
  {
    id: '5',
    name: 'NFT Collectors',
    avatar: 'NC',
    lastMessage: 'Check out this new collection',
    timestamp: '3h',
    unreadCount: 12,
    isPinned: false,
    isMuted: false,
    isOnline: true,
    isGroup: true
  },
  {
    id: '6',
    name: 'Sarah Wilson',
    avatar: 'SW',
    lastMessage: 'The audit report looks good',
    timestamp: '5h',
    unreadCount: 0,
    isPinned: false,
    isMuted: false,
    isOnline: false,
    isGroup: false
  }
];

export default function Sidebar() {
  const [selectedChat, setSelectedChat] = useState<string>('1');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChats = mockChats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedChats = filteredChats.filter(chat => chat.isPinned);
  const regularChats = filteredChats.filter(chat => !chat.isPinned);

  const ChatItem = ({ chat }: { chat: Chat }) => (
    <div
      className={cn(
        "group relative flex items-center space-x-3 p-3 mx-2 rounded-xl cursor-pointer transition-all duration-200",
        selectedChat === chat.id
          ? "bg-purple-500/20 border border-purple-500/30"
          : "hover:bg-surface-hover active:scale-[0.98]"
      )}
      onClick={() => setSelectedChat(chat.id)}
    >
      <div className="relative">
        <Avatar className="w-12 h-12">
          <AvatarImage src={chat.avatar ? undefined : ""} />
          <AvatarFallback className={cn(
            "font-semibold text-sm",
            chat.isGroup 
              ? "bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-blue-400"
              : "bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-purple-400"
          )}>
            {chat.avatar || (chat.isGroup ? <Users className="w-5 h-5" /> : chat.name.slice(0, 2).toUpperCase())}
          </AvatarFallback>
        </Avatar>
        
        {chat.isOnline && !chat.isGroup && (
          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-background rounded-full" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center space-x-1.5">
            <h3 className={cn(
              "font-semibold truncate text-sm",
              selectedChat === chat.id ? "text-purple-300" : "text-foreground"
            )}>
              {chat.name}
            </h3>
            {chat.isVerified && (
              <Shield className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
            )}
            {chat.isPinned && (
              <Pin className="w-3 h-3 text-foreground-muted flex-shrink-0" />
            )}
            {chat.isMuted && (
              <VolumeX className="w-3 h-3 text-foreground-muted flex-shrink-0" />
            )}
          </div>
          <span className="text-xs text-foreground-muted flex-shrink-0">
            {chat.timestamp}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <p className="text-xs text-foreground-muted truncate pr-2">
            {chat.lastMessage}
          </p>
          {chat.unreadCount > 0 && (
            <Badge className="bg-purple-500 hover:bg-purple-500 text-white text-xs h-5 min-w-[20px] px-1.5 rounded-full flex-shrink-0">
              {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-80 h-full bg-surface border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-bold text-foreground">ChainChat</h1>
          </div>
          <Button 
            size="sm" 
            className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30 rounded-lg"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground-muted" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background/50 border-border focus:border-purple-500/50 focus:ring-purple-500/20 rounded-xl"
          />
        </div>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1">
        <div className="py-2">
          {/* Pinned Chats */}
          {pinnedChats.length > 0 && (
            <div className="mb-2">
              <div className="px-4 py-2">
                <h2 className="text-xs font-medium text-foreground-muted uppercase tracking-wider">
                  Pinned
                </h2>
              </div>
              <div className="space-y-1">
                {pinnedChats.map((chat) => (
                  <ChatItem key={chat.id} chat={chat} />
                ))}
              </div>
            </div>
          )}

          {/* Regular Chats */}
          {regularChats.length > 0 && (
            <div>
              {pinnedChats.length > 0 && (
                <div className="px-4 py-2">
                  <h2 className="text-xs font-medium text-foreground-muted uppercase tracking-wider">
                    All Chats
                  </h2>
                </div>
              )}
              <div className="space-y-1">
                {regularChats.map((chat) => (
                  <ChatItem key={chat.id} chat={chat} />
                ))}
              </div>
            </div>
          )}

          {filteredChats.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <MessageSquare className="w-12 h-12 text-foreground-muted mb-3" />
              <p className="text-foreground-muted text-center">
                {searchQuery ? 'No conversations found' : 'No conversations yet'}
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}