import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface Props {
  placeholder: string
  value: string
  onChange: (val: string) => void
}

export default function SearchBar({ placeholder, value, onChange }: Props) {
  return (
    <div className="relative px-4 py-2 border-b border-border">
      <Search className="absolute left-7 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 w-full bg-background/50 border-border focus:border-purple-500/50 focus:ring-purple-500/20 rounded-xl"
      />
    </div>
  )
}
