import MessageItem from './MessageItem'

const mockMessages = [
  { id: 1, fromMe: false, content: 'Hey, are you free today?', timestamp: '10:01 AM' },
  { id: 2, fromMe: true, content: 'Yes, after 4PM. Want to chat on ChainChat?', timestamp: '10:03 AM' },
  { id: 3, fromMe: false, content: 'Perfect. I’ll text you later then!', timestamp: '10:04 AM' },
  { id: 4, fromMe: true, content: 'Alright, take care 🚀', timestamp: '10:05 AM' }
]

export default function MessageList({ chatId }: { chatId: string }) {
  return (
    <div className="flex flex-col space-y-4 pb-4">
      {mockMessages.map(msg => (
        <MessageItem
          key={msg.id}
          fromMe={msg.fromMe}
          content={msg.content}
          timestamp={msg.timestamp}
        />
      ))}
    </div>
  )
}
