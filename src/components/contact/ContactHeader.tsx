import { Filter, UserRoundPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ContactHeader() {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
      <Button variant="ghost" size="icon">
        <Filter className="w-5 h-5 text-muted-foreground" />
      </Button>
      <h2 className="text-lg font-semibold text-center text-foreground">Contacts</h2>
      <Button variant="ghost" size="icon">
        <UserRoundPlus className="w-5 h-5 text-muted-foreground" />
      </Button>
    </div>
  )
}
