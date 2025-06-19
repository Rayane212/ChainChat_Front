import { useState } from 'react'
import { Paperclip, Smile, Send } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface ChatInputProps {
  chatId: string
}

export default function ChatInput({ chatId }: ChatInputProps) {
  const [message, setMessage] = useState('')

  const handleSend = () => {
    if (!message.trim()) return
    console.log(`[chat ${chatId}] →`, message)
    setMessage('')
  }

  return (
    <div className="flex items-center gap-2 w-full">
      {/* Attachment */}
      <Button variant="ghost" size="icon">
        <Paperclip className="w-5 h-5 text-muted-foreground" />
      </Button>

      {/* Emoji */}
      <Button variant="ghost" size="icon">
        <Smile className="w-5 h-5 text-muted-foreground" />
      </Button>

      {/* Input */}
      <Input
        type="text"
        placeholder="Write a message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSend()
        }}
        className="flex-1 rounded-xl"
      />

      {/* Send */}
      <Button onClick={handleSend} size="icon" className="bg-purple-500 hover:bg-purple-600 text-white">
        <Send className="w-4 h-4" />
      </Button>
    </div>
  )
}
