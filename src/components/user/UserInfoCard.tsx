import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

interface Props {
  name: string
  username: string
  avatarUrl?: string
}

export default function UserInfoCard({ name, username, avatarUrl }: Props) {
  return (
    <div className="flex items-center space-x-3">
      <Avatar className="w-10 h-10">
        <AvatarImage src={avatarUrl} alt={name} />
        <AvatarFallback>
          {name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .slice(0, 2)
            .toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="font-medium text-foreground truncate">{name}</p>
        <p className="text-sm text-muted-foreground truncate">@{username}</p>
      </div>
    </div>
  )
}
