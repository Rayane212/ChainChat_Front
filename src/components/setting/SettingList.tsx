import { useNavigate, useLocation } from 'react-router-dom'
import { settingSections } from './setting-config'
import { SettingViewType } from './SettingView'
import SettingItem from './SettingItem'
import UserInfoCard from '@/components/user/UserInfoCard'

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
    </div>
  )
}
