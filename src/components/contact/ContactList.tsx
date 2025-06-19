import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import ContactItem from './ContactItem'
import { Search, Filter, UserPlus, Users, Wifi, WifiOff } from 'lucide-react'


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
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const filtered = mockContacts.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.username.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const online = filtered.filter((c) => c.isOnline)
  const offline = filtered.filter((c) => !c.isOnline)

  return (
    <div className="w-80 h-full bg-surface border-r border-border flex flex-col">
      

      {/* Scrollable Contact List */}
      <ScrollArea className="flex-1 py-2">
        {online.length > 0 && (
          <div className="mb-4">
            <div className="px-4 py-2 flex items-center space-x-2">
              <Wifi className="w-3 h-3 text-green-500" />
              <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Online ({online.length})
              </h2>
            </div>
            <div className="space-y-1">
              {online.map((c) => (
                <ContactItem key={c.id} {...c} selected={c.id === selectedId} onClick={() => setSelectedId(c.id)} />
              ))}
            </div>
          </div>
        )}

        {offline.length > 0 && (
          <div>
            <div className="px-4 py-2 flex items-center space-x-2">
              <WifiOff className="w-3 h-3 text-muted-foreground" />
              <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Recently Active ({offline.length})
              </h2>
            </div>
            <div className="space-y-1">
              {offline.map((c) => (
                <ContactItem key={c.id} {...c} selected={c.id === selectedId} onClick={() => setSelectedId(c.id)} />
              ))}
            </div>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-muted-foreground text-sm">
            No contacts found.
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
