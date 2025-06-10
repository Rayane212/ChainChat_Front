import React, { useState } from 'react'
import { Send, Paperclip } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface ChatInputProps {
  onSendMessage: (content: string) => void
  placeholder?: string
  disabled?: boolean
}

export function ChatInput({ 
  onSendMessage, 
  placeholder = "Tapez votre message...",
  disabled = false 
}: ChatInputProps) {
  const [message, setMessage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !disabled) {
      onSendMessage(message.trim())
      setMessage('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-2 p-4 border-t">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="shrink-0"
        disabled={disabled}
      >
        <Paperclip className="h-4 w-4" />
      </Button>
      
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1"
      />
      
      <Button
        type="submit"
        variant="gradient"
        size="icon"
        className="shrink-0"
        disabled={!message.trim() || disabled}
      >
        <Send className="h-4 w-4" />
      </Button>
    </form>
  )
}