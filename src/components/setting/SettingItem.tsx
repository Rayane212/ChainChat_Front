import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SettingItemProps {
  icon?: React.ElementType
  label: string
  active?: boolean
  onClick?: () => void
}

export default function SettingItem({ icon: Icon, label, active, onClick }: SettingItemProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between px-4 py-4 transition-all duration-200 cursor-pointer group',
        active ? 'bg-purple-500/10' : 'bg-transparent'
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {Icon && (
          <div className={cn('flex items-center justify-center w-10 h-10 rounded-xl transition-colors duration-200 bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20')}>
            <Icon className="w-5 h-5" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className={cn('font-medium text-sm leading-tight text-foreground')}>{label}</h3>
        </div>
      </div>
      <div className="flex-shrink-0 ml-3">
        <ChevronRight className="w-5 h-5 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5" />
      </div>
    </div>
  )
}