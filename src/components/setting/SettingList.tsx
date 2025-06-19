// components/chat/SettingsList.tsx
import { useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent } from '@/components/ui/card'
import { User, Trash2, Download, LogOut, Settings as SettingsIcon, Bell, Volume2, Moon, Shield, Lock, Eye, Globe, MessageSquare, Keyboard, Palette, Smartphone } from 'lucide-react'
import SettingsItem from '@/components/setting/SettingItem'

const settingsGroups = [
  {
    title: 'General',
    icon: SettingsIcon,
    settings: [
      {
        id: 'notifications',
        label: 'Notifications',
        description: 'Receive push notifications',
        type: 'toggle',
        value: true,
        icon: Bell
      },
      {
        id: 'sound',
        label: 'Sound Effects',
        description: 'Play sounds for messages',
        type: 'toggle',
        value: true,
        icon: Volume2
      },
      {
        id: 'dark_mode',
        label: 'Dark Mode',
        description: 'Use dark theme',
        type: 'toggle',
        value: true,
        icon: Moon
      }
    ]
  },
  {
    title: 'Privacy',
    icon: Shield,
    settings: [
      {
        id: 'encryption',
        label: 'E2E Encryption',
        description: 'Encrypt all messages',
        type: 'toggle',
        value: true,
        icon: Lock
      },
      {
        id: 'read_receipts',
        label: 'Read Receipts',
        description: 'Show read status',
        type: 'toggle',
        value: false,
        icon: Eye
      },
      {
        id: 'last_seen',
        label: 'Last Seen',
        description: 'Show your last activity',
        type: 'toggle',
        value: false,
        icon: Globe
      }
    ]
  },
  {
    title: 'Interface',
    icon: Palette,
    settings: [
      {
        id: 'compact_mode',
        label: 'Compact Mode',
        description: 'Use smaller layout',
        type: 'toggle',
        value: false,
        icon: Smartphone
      }
    ]
  }
] as const

const accountActions = [
  {
    id: 'clear_cache',
    label: 'Clear Cache',
    description: 'Free up space',
    type: 'action',
    icon: Trash2
  },
  {
    id: 'export_data',
    label: 'Export Data',
    description: 'Download your chats',
    type: 'action',
    icon: Download
  },
  {
    id: 'logout',
    label: 'Sign Out',
    description: 'Exit your session',
    type: 'action',
    icon: LogOut,
    destructive: true
  }
] as const

export default function SettingsList() {
  const [values, setValues] = useState<Record<string, boolean>>({
    notifications: true,
    sound: true,
    dark_mode: true,
    encryption: true,
    read_receipts: false,
    last_seen: false,
    compact_mode: false
  })

  const handleToggle = (id: string) => {
    setValues((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleAction = (id: string) => {
    console.log(`Action: ${id}`)
  }

  return (
    <div className="w-80 h-full bg-surface border-r border-border flex flex-col">
      <ScrollArea className="flex-1 p-4 space-y-6">
        {settingsGroups.map((group) => (
          <div key={group.title}>
            <div className="flex items-center space-x-2 mb-3">
              <group.icon className="w-4 h-4 text-purple-400" />
              <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {group.title}
              </h2>
            </div>
            <Card className="bg-background/30 border-border">
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {group.settings.map((s) => (
                    <SettingsItem
                      key={s.id}
                      setting={{
                        ...s,
                        value: values[s.id],
                        onToggle: () => handleToggle(s.id)
                      }}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ))}

        <div>
          <div className="flex items-center space-x-2 mb-3">
            <User className="w-4 h-4 text-purple-400" />
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Account
            </h2>
          </div>
          <Card className="bg-background/30 border-border">
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {accountActions.map((a) => (
                  <SettingsItem
                    key={a.id}
                    setting={{
                      ...a,
                      onAction: () => handleAction(a.id)
                    }}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  )
}
