import { Bell, Brush, Shield, User } from 'lucide-react'
import { SettingViewType } from './SettingView'

export interface SettingSection {
  title: string
  items: {
    label: string
    view: SettingViewType
    icon: React.ElementType
  }[]
}

export const settingSections: SettingSection[] = [
  {
    title: 'Général',
    items: [
      {
        label: 'Mon profil',
        view: 'profile',
        icon: User
      }
    ]
  },
  {
    title: 'Sécurité',
    items: [
      {
        label: 'Confidentialité & Sécurité',
        view: 'security',
        icon: Shield
      }
    ]
  },
  {
    title: 'Apparence',
    items: [
      {
        label: 'Apparence',
        view: 'appearance',
        icon: Brush
      }
    ]
  },
  {
    title: 'Notifications',
    items: [
      {
        label: 'Notifications',
        view: 'notifications',
        icon: Bell
      }
    ]
  }
]
