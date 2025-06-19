import { useParams, Navigate } from 'react-router-dom'
import SettingView, { SettingViewType } from './SettingView'

const validSections: SettingViewType[] = ['profile', 'security', 'appearance', 'notifications']

export default function SettingRouter() {
  const { section } = useParams()

  const selected = (section || 'profile') as SettingViewType


  if (!validSections.includes(selected)) {
    return <Navigate to="/settings/profile" replace />
  }

  return <SettingView selected={selected} />
}
