import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Settings as SettingsIcon,
  User,
  Shield,
  Bell,
  Palette,
  Globe,
  Keyboard,
  Volume2,
  Moon,
  Smartphone,
  Lock,
  Eye,
  MessageSquare,
  Download,
  Trash2,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SettingGroup {
  title: string;
  icon: React.ElementType;
  settings: Setting[];
}

interface Setting {
  id: string;
  label: string;
  description?: string;
  type: 'toggle' | 'action' | 'navigation';
  value?: boolean;
  icon?: React.ElementType;
  destructive?: boolean;
}

const mockSettingsGroups: SettingGroup[] = [
  {
    title: 'General',
    icon: SettingsIcon,
    settings: [
      {
        id: 'notifications',
        label: 'Notifications',
        description: 'Receive push notifications for new messages',
        type: 'toggle',
        value: true,
        icon: Bell
      },
      {
        id: 'sound',
        label: 'Sound Effects',
        description: 'Play sounds for messages and calls',
        type: 'toggle',
        value: true,
        icon: Volume2
      },
      {
        id: 'dark_mode',
        label: 'Dark Mode',
        description: 'Use dark theme optimized for low-light',
        type: 'toggle',
        value: true,
        icon: Moon
      }
    ]
  },
  {
    title: 'Privacy & Security',
    icon: Shield,
    settings: [
      {
        id: 'encryption',
        label: 'End-to-End Encryption',
        description: 'Encrypt all messages with blockchain security',
        type: 'toggle',
        value: true,
        icon: Lock
      },
      {
        id: 'read_receipts',
        label: 'Read Receipts',
        description: 'Show when you\'ve read messages',
        type: 'toggle',
        value: false,
        icon: Eye
      },
      {
        id: 'last_seen',
        label: 'Last Seen',
        description: 'Show when you were last online',
        type: 'toggle',
        value: false,
        icon: Globe
      }
    ]
  },
  {
    title: 'Chat Settings',
    icon: MessageSquare,
    settings: [
      {
        id: 'auto_download',
        label: 'Auto-Download Media',
        description: 'Automatically download photos and videos',
        type: 'toggle',
        value: false,
        icon: Download
      },
      {
        id: 'typing_indicators',
        label: 'Typing Indicators',
        description: 'Show when someone is typing',
        type: 'toggle',
        value: true,
        icon: Keyboard
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
        description: 'Use smaller chat bubbles and spacing',
        type: 'toggle',
        value: false,
        icon: Smartphone
      }
    ]
  }
];

const accountActions: Setting[] = [
  {
    id: 'clear_cache',
    label: 'Clear Cache',
    description: 'Free up storage space',
    type: 'action',
    icon: Trash2
  },
  {
    id: 'export_data',
    label: 'Export Data',
    description: 'Download your chat history',
    type: 'action',
    icon: Download
  },
  {
    id: 'logout',
    label: 'Sign Out',
    description: 'Sign out of your account',
    type: 'action',
    icon: LogOut,
    destructive: true
  }
];

export default function Settings() {
  const [settingValues, setSettingValues] = useState<Record<string, boolean>>({
    notifications: true,
    sound: true,
    dark_mode: true,
    encryption: true,
    read_receipts: false,
    last_seen: false,
    auto_download: false,
    typing_indicators: true,
    compact_mode: false
  });

  const handleToggle = (settingId: string) => {
    setSettingValues(prev => ({
      ...prev,
      [settingId]: !prev[settingId]
    }));
  };

  const handleAction = (actionId: string) => {
    console.log(`Action triggered: ${actionId}`);
    // Handle actions like logout, clear cache, etc.
  };

  const SettingItem = ({ setting, groupIcon }: { setting: Setting; groupIcon?: React.ElementType }) => {
    const IconComponent = setting.icon || groupIcon;
    
    return (
      <div className={cn(
        "flex items-center justify-between p-4 rounded-xl transition-all duration-200",
        setting.type === 'action' 
          ? "hover:bg-surface-hover cursor-pointer active:scale-[0.98]"
          : "bg-transparent"
      )}
      onClick={setting.type === 'action' ? () => handleAction(setting.id) : undefined}
      >
        <div className="flex items-center space-x-3 flex-1">
          {IconComponent && (
            <div className={cn(
              "p-2 rounded-lg",
              setting.destructive 
                ? "bg-red-500/20 text-red-400"
                : "bg-purple-500/20 text-purple-400"
            )}>
              <IconComponent className="w-4 h-4" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className={cn(
              "font-medium text-sm",
              setting.destructive ? "text-red-400" : "text-foreground"
            )}>
              {setting.label}
            </h3>
            {setting.description && (
              <p className="text-xs text-foreground-muted mt-0.5">
                {setting.description}
              </p>
            )}
          </div>
        </div>

        {setting.type === 'toggle' && (
          <Switch
            checked={settingValues[setting.id] || false}
            onCheckedChange={() => handleToggle(setting.id)}
            className="data-[state=checked]:bg-purple-500"
          />
        )}

        {setting.type === 'action' && (
          <ChevronRight className="w-4 h-4 text-foreground-muted" />
        )}
      </div>
    );
  };

  return (
    <div className="w-80 h-full bg-surface border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center space-x-2 mb-4">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
            <SettingsIcon className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-lg font-bold text-foreground">Settings</h1>
        </div>

        {/* User Profile Card */}
        <Card className="bg-background/50 border-border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src="" />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold">
                  JD
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground">John Doe</h3>
                <p className="text-xs text-foreground-muted">@johndoe</p>
                <p className="text-xs text-green-400">Online</p>
              </div>
              <Button 
                size="sm" 
                variant="ghost"
                className="text-foreground-muted hover:text-foreground"
              >
                <User className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {mockSettingsGroups.map((group, groupIndex) => (
            <div key={groupIndex}>
              <div className="flex items-center space-x-2 mb-3">
                <group.icon className="w-4 h-4 text-purple-400" />
                <h2 className="text-xs font-medium text-foreground-muted uppercase tracking-wider">
                  {group.title}
                </h2>
              </div>
              
              <Card className="bg-background/30 border-border">
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {group.settings.map((setting, settingIndex) => (
                      <SettingItem 
                        key={setting.id} 
                        setting={setting} 
                        groupIcon={group.icon}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}

          {/* Account Actions */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <User className="w-4 h-4 text-purple-400" />
              <h2 className="text-xs font-medium text-foreground-muted uppercase tracking-wider">
                Account
              </h2>
            </div>
            
            <Card className="bg-background/30 border-border">
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {accountActions.map((action) => (
                    <SettingItem key={action.id} setting={action} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}