import { MessageSquarePlus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ChatHeader() {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
      <div />
      <h2 className="text-lg font-semibold text-center text-foreground">Chats</h2>
      <Button variant="ghost" size="icon">
        <MessageSquarePlus className="w-5 h-5 text-muted-foreground" />
      </Button>
    </div>
  )
}
