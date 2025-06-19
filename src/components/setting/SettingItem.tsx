import { Switch } from '@/components/ui/switch'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Setting {
  id: string
  label: string
  description?: string
  type: 'toggle' | 'action'
  icon?: React.ElementType
  value?: boolean
  destructive?: boolean
  onToggle?: () => void
  onAction?: () => void
}

export default function SettingsItem({ setting }: { setting: Setting }) {
  const Icon = setting.icon

  return (
    <div
      className={cn(
        'flex items-center justify-between p-4 rounded-xl transition-all duration-200',
        setting.type === 'action'
          ? 'hover:bg-surface-hover cursor-pointer active:scale-[0.98]'
          : 'bg-transparent'
      )}
      onClick={setting.type === 'action' ? setting.onAction : undefined}
    >
      <div className="flex items-center space-x-3 flex-1">
        {Icon && (
          <div
            className={cn(
              'p-2 rounded-lg',
              setting.destructive
                ? 'bg-red-500/20 text-red-400'
                : 'bg-purple-500/20 text-purple-400'
            )}
          >
            <Icon className="w-4 h-4" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className={cn(
            'font-medium text-sm',
            setting.destructive ? 'text-red-400' : 'text-foreground'
          )}>
            {setting.label}
          </h3>
          {setting.description && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {setting.description}
            </p>
          )}
        </div>
      </div>

      {setting.type === 'toggle' && setting.onToggle && (
        <Switch
          checked={setting.value}
          onCheckedChange={setting.onToggle}
          className="data-[state=checked]:bg-purple-500"
        />
      )}

      {setting.type === 'action' && (
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      )}
    </div>
  )
}
