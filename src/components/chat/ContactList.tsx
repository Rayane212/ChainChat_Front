import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  Filter, 
  UserPlus, 
  Users,
  Clock,
  Wifi,
  WifiOff
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Contact {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen: string;
  isVerified?: boolean;
  avatarColor: string;
}

const mockContacts: Contact[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    username: '@alice_dev',
    avatar: 'AJ',
    isOnline: true,
    lastSeen: 'online',
    isVerified: true,
    avatarColor: 'from-purple-500 to-pink-500'
  },
  {
    id: '2',
    name: 'Bob Smith',
    username: '@bob_crypto',
    avatar: 'BS',
    isOnline: false,
    lastSeen: 'last seen 2 hours ago',
    avatarColor: 'from-blue-500 to-cyan-500'
  },
  {
    id: '3',
    name: 'Sarah Wilson',
    username: '@sarah_nft',
    avatar: 'SW',
    isOnline: false,
    lastSeen: 'last seen yesterday',
    avatarColor: 'from-green-500 to-emerald-500'
  },
  {
    id: '4',
    name: 'David Chen',
    username: '@david_sol',
    avatar: 'DC',
    isOnline: true,
    lastSeen: 'online',
    avatarColor: 'from-orange-500 to-red-500'
  },
  {
    id: '5',
    name: 'Emma Rodriguez',
    username: '@emma_defi',
    avatar: 'ER',
    isOnline: false,
    lastSeen: 'last seen 5 minutes ago',
    avatarColor: 'from-violet-500 to-purple-500'
  },
  {
    id: '6',
    name: 'Michael Brown',
    username: '@mike_web3',
    avatar: 'MB',
    isOnline: false,
    lastSeen: 'last seen 1 hour ago',
    avatarColor: 'from-teal-500 to-blue-500'
  },
  {
    id: '7',
    name: 'Lisa Zhang',
    username: '@lisa_blockchain',
    avatar: 'LZ',
    isOnline: true,
    lastSeen: 'online',
    isVerified: true,
    avatarColor: 'from-pink-500 to-rose-500'
  },
  {
    id: '8',
    name: 'Alex Turner',
    username: '@alex_smart',
    avatar: 'AT',
    isOnline: false,
    lastSeen: 'last seen 3 days ago',
    avatarColor: 'from-indigo-500 to-blue-500'
  }
];

export default function ContactList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContact, setSelectedContact] = useState<string | null>(null);

  const filteredContacts = mockContacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onlineContacts = filteredContacts.filter(contact => contact.isOnline);
  const offlineContacts = filteredContacts.filter(contact => !contact.isOnline);

  const ContactItem = ({ contact }: { contact: Contact }) => (
    <div
      className={cn(
        "group flex items-center space-x-3 p-3 mx-2 rounded-xl cursor-pointer transition-all duration-200",
        selectedContact === contact.id
          ? "bg-purple-500/20 border border-purple-500/30"
          : "hover:bg-surface-hover active:scale-[0.98]"
      )}
      onClick={() => setSelectedContact(contact.id)}
    >
      <div className="relative">
        <Avatar className="w-12 h-12">
          <AvatarImage src="" />
          <AvatarFallback className={cn(
            "font-semibold text-white bg-gradient-to-br",
            contact.avatarColor
          )}>
            {contact.avatar}
          </AvatarFallback>
        </Avatar>
        
        {contact.isOnline && (
          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-background rounded-full" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-1">
          <h3 className={cn(
            "font-semibold truncate text-sm",
            selectedContact === contact.id ? "text-purple-300" : "text-foreground"
          )}>
            {contact.name}
          </h3>
          {contact.isVerified && (
            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-1">
          {contact.isOnline ? (
            <Wifi className="w-3 h-3 text-green-500 flex-shrink-0" />
          ) : (
            <Clock className="w-3 h-3 text-foreground-muted flex-shrink-0" />
          )}
          <p className="text-xs text-foreground-muted truncate">
            {contact.lastSeen}
          </p>
        </div>
        
        <p className="text-xs text-purple-400 truncate mt-0.5">
          {contact.username}
        </p>
      </div>
    </div>
  );

  return (
    <div className="w-80 h-full bg-surface border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500">
              <Users className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-bold text-foreground">Contacts</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              size="sm" 
              variant="ghost"
              className="text-foreground-muted hover:text-foreground hover:bg-surface-hover rounded-lg"
            >
              <Filter className="w-4 h-4" />
            </Button>
            <Button 
              size="sm" 
              className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30 rounded-lg"
            >
              <UserPlus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground-muted" />
          <Input
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background/50 border-border focus:border-purple-500/50 focus:ring-purple-500/20 rounded-xl"
          />
        </div>
      </div>

      {/* Contact List */}
      <ScrollArea className="flex-1">
        <div className="py-2">
          {/* Online Contacts */}
          {onlineContacts.length > 0 && (
            <div className="mb-4">
              <div className="px-4 py-2 flex items-center space-x-2">
                <Wifi className="w-3 h-3 text-green-500" />
                <h2 className="text-xs font-medium text-foreground-muted uppercase tracking-wider">
                  Online ({onlineContacts.length})
                </h2>
              </div>
              <div className="space-y-1">
                {onlineContacts.map((contact) => (
                  <ContactItem key={contact.id} contact={contact} />
                ))}
              </div>
            </div>
          )}

          {/* Offline Contacts */}
          {offlineContacts.length > 0 && (
            <div>
              <div className="px-4 py-2 flex items-center space-x-2">
                <WifiOff className="w-3 h-3 text-foreground-muted" />
                <h2 className="text-xs font-medium text-foreground-muted uppercase tracking-wider">
                  Recently Active ({offlineContacts.length})
                </h2>
              </div>
              <div className="space-y-1">
                {offlineContacts.map((contact) => (
                  <ContactItem key={contact.id} contact={contact} />
                ))}
              </div>
            </div>
          )}

          {filteredContacts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <Users className="w-12 h-12 text-foreground-muted mb-3" />
              <p className="text-foreground-muted text-center">
                {searchQuery ? 'No contacts found' : 'No contacts yet'}
              </p>
              <Button 
                className="mt-4 bg-purple-500 hover:bg-purple-600 text-white rounded-xl"
                size="sm"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add Contact
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}