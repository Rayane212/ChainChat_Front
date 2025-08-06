import { useNavigate, useLocation } from 'react-router-dom'
import { settingSections } from './setting-config'
import { SettingViewType } from './SettingView'
import SettingItem from './SettingItem'
import UserInfoCard from '@/components/user/UserInfoCard'
import { LogOut } from 'lucide-react';
import * as authService from '@/services/auth.service';


interface Props {
  selected: SettingViewType
  onSelect?: (view: SettingViewType) => void
}

export default function SettingList({ selected, onSelect }: Props) {
  const navigate = useNavigate()
  const location = useLocation()

  const handleClick = (view: SettingViewType) => {
    if (onSelect) {
      onSelect(view)
    } else {
      navigate(`/settings/${view}`)
    }
  }

  return (
    <div className="h-full flex flex-col px-4 py-6 space-y-6">
      <UserInfoCard name="Rayane212" username="Ryan_212" />

      {settingSections.map((section) => (
        <div key={section.title}>
          <h4 className="text-xs text-muted-foreground uppercase font-medium mb-2">
            {section.title}
          </h4>
          <div className="space-y-1">
            {section.items.map((item) => (
              <SettingItem
                key={item.view}
                icon={item.icon}
                label={item.label}
                active={selected === item.view}
                onClick={() => handleClick(item.view)}
              />
            ))}
          </div>
        </div>
      ))}
      <div className="mt-auto">
        <div className="flex items-center justify-between px-4 py-4 cursor-pointer hover:bg-purple-500/10 transition-colors duration-200 rounded-lg"
          onClick={() => {
            authService.logout()
            navigate('/login')
          }}
        >
          <div className="flex items-center gap-3">
            <LogOut className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm text-foreground">Logout</span>
          </div>
        </div>
      </div>
    </div>
  )
}
