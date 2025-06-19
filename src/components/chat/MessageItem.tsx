import { cn } from '@/lib/utils'

interface MessageItemProps {
  fromMe: boolean
  content: string
  timestamp: string
}

export default function MessageItem({ fromMe, content, timestamp }: MessageItemProps) {
  return (
    <div className={cn(
      'flex flex-col space-y-1 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg',
      fromMe ? 'ml-auto items-end' : 'mr-auto items-start'
    )}>
      <div className={cn(
        'px-4 py-2 rounded-xl text-sm whitespace-pre-wrap',
        fromMe
          ? 'bg-purple-500 text-white rounded-br-sm'
          : 'bg-muted text-foreground rounded-bl-sm'
      )}>
        {content}
      </div>
      <span className="text-xs text-muted-foreground">{timestamp}</span>
    </div>
  )
}
