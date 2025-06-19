import { ArrowLeft, MoreVertical } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

interface MessageHeaderProps {
  chatId: string
  name?: string
  avatar?: string
  isOnline?: boolean
}

export default function MessageHeader({
  chatId,
  name = 'Solana Builder',
  avatar = '',
  isOnline = true
}: MessageHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-border px-4 py-3">
      {/* 📱 Mobile : flèche + titre centré + avatar à droite */}
      <div className="flex lg:hidden items-center space-x-3">
        <Button variant="ghost" size="icon">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Button>
        <div className="flex-1 text-center">
          <h2 className="text-base font-semibold text-foreground">{name}</h2>
          <p className="text-xs text-muted-foreground">
            {isOnline ? (
              <span className="text-green-500">Online</span>
            ) : (
              'Offline'
            )}
          </p>
        </div>
      </div>

      <div className="lg:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            // ⏳ futur : ouvrir profil + médias
          }}
        >
          <Avatar className="w-8 h-8">
            <AvatarImage src={avatar} />
            <AvatarFallback className="bg-purple-500/20 text-purple-400">
              {name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </div>

      {/* 🖥️ Desktop : avatar + titre à gauche, menu à droite */}
      <div className="hidden lg:flex flex-1 items-center justify-between">
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={avatar} />
            <AvatarFallback className="bg-purple-500/20 text-purple-400">
              {name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-base font-semibold text-foreground">{name}</h2>
            <p className="text-xs text-muted-foreground">
              {isOnline ? (
                <span className="text-green-500">Online</span>
              ) : (
                'Offline'
              )}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon">
          <MoreVertical className="w-5 h-5 text-muted-foreground" />
        </Button>
      </div>
    </div>
  )
}
