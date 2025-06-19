import ProfileSettings from '@/components/setting/ProfileSetting'

export type SettingViewType = 'profile' | 'security' | 'appearance' | 'notifications'

interface Props {
  selected: SettingViewType
}

export default function SettingView({ selected }: Props) {
  return (
    <main className="flex-1 bg-background overflow-y-auto h-full">
      {selected === 'profile' && <ProfileSettings />}
      {selected === 'security' && (
        <div className="p-6 text-muted-foreground">[🔐 Paramètres de sécurité bientôt]</div>
      )}
      {selected === 'appearance' && (
        <div className="p-6 text-muted-foreground">[🎨 Thème, dark mode, etc.]</div>
      )}
      {selected === 'notifications' && (
        <div className="p-6 text-muted-foreground">[🔔 Notifications et sons]</div>
      )}
    </main>
  )
}
