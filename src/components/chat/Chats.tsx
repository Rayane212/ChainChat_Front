import { useState } from "react"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import ChatList from "@/components/chat/ChatList"
import { MessageSquare, Search } from "lucide-react"
// import mockChats from "./mock-chats.json" // optionnel

export default function Chats() {
  const [query, setQuery] = useState("")
  const [selectedId, setSelectedId] = useState("")

  // const filtered = mockChats.filter(c =>
  //   c.name.toLowerCase().includes(query.toLowerCase()) ||
  //   c.lastMessage.toLowerCase().includes(query.toLowerCase())
  // )

  return (
    <div className="w-80 h-full bg-surface border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center space-x-2 mb-4">
          <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500">
            <MessageSquare className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-lg font-bold text-purple-400">ChainChat</h1>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 rounded-xl bg-background/50 border-border"
          />
        </div>
      </div>

      {/* Chat list */}
      <ScrollArea className="flex-1 py-2">
        <ChatList chats={[]} selectedId={selectedId} onSelect={setSelectedId} />
      </ScrollArea>
    </div>
  )
}
