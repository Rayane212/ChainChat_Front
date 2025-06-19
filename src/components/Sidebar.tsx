import { useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import MenuBar from '@/components/MenuBar'
import ChatList from '@/components/chat/ChatList'
import ContactList from '@/components/contact/ContactList'
import SettingList from '@/components/setting/SettingList'
import ChatHeader from '@/components/chat/ChatHeader'
import ContactHeader from '@/components/contact/ContactHeader'
import SettingHeader from '@/components/setting/SettingHeader'
import SearchBar from '@/components/SearchBar'
import { SettingViewType } from '@/components/setting/SettingView'
import { useLocation, useNavigate } from 'react-router-dom'


type Section = 'chat' | 'contacts' | 'settings'

const mockChats = [
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
]



export default function Sidebar() {
  const [activeSection, setActiveSection] = useState<Section>('chat')
  const [selectedChat, setSelectedChat] = useState<string>('1')
  const [searchQuery, setSearchQuery] = useState('')
  const location = useLocation()
  const navigate = useNavigate()


  const selectedSetting: SettingViewType =
    (location.pathname.split('/')[2] as SettingViewType) || 'profile'
  

  const filteredChats = mockChats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const renderHeader = () => {
    if (activeSection === 'chat') return <ChatHeader />
    if (activeSection === 'contacts') return <ContactHeader />
    return <SettingHeader />
  }

  const renderContent = () => {
    if (activeSection === 'chat') {
      return (
        <div className="flex-1 min-h-0 overflow-hidden">
          <ChatList chats={filteredChats} selectedId={selectedChat} onSelect={setSelectedChat} />
        </div>
      )
    }

    if (activeSection === 'contacts') {
      return (
        <ScrollArea className="flex-1 min-h-0">
          <ContactList />
        </ScrollArea>
      )
    }

    return (
      <ScrollArea className="flex-1 min-h-0">
        <SettingList
          selected={selectedSetting}
          onSelect={(view) => navigate(`/settings/${view}`)}
        />
      </ScrollArea>
    )
  }

  const searchPlaceholders = {
    chat: 'Search conversations...',
    contacts: 'Search contacts...',
    settings: 'Search settings...'
  }

  return (
    <div className="w-80 h-full bg-surface border-r border-border flex flex-col overflow-hidden">
      <div className="flex-shrink-0">
        {renderHeader()}
      </div>

      <div className="flex-shrink-0">
        <SearchBar
          placeholder={searchPlaceholders[activeSection]}
          value={searchQuery}
          onChange={setSearchQuery}
        />
      </div>

      {renderContent()}

      <div className="flex-shrink-0">
        <MenuBar
          active={activeSection}
          onSelect={(id) => setActiveSection(id as Section)}
        />
      </div>
    </div>
  )
}