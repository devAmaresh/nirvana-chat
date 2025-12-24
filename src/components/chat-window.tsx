import { useEffect, useRef } from "react"
import { useChatStore } from "@/lib/chat-store"
import { MessageBubble } from "@/components/message-bubble"
import { MessageSquare } from "lucide-react"

export function ChatWindow() {
  const { chats, activeChatId, loading } = useChatStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const activeChat = chats.find((c) => c.id === activeChatId)
  const messages = activeChat?.messages || []

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  if (!activeChatId || messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center mb-8 shadow-xl ring-4 ring-blue-500/10">
          <MessageSquare className="w-10 h-10 text-blue-500" strokeWidth={2.5} />
        </div>
        <h2 className="text-3xl font-black text-zinc-900 dark:text-zinc-100 mb-3">Start a Conversation</h2>
        <p className="text-zinc-500/70 dark:text-zinc-400/70 max-w-md text-lg">
          Ask me anything and I'll help you find the answers.
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-white via-white to-white/20 dark:from-black dark:via-black dark:to-zinc-900/20">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-8">
          {messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              isLoading={loading && index === messages.length - 1 && message.role === "assistant"}
            />
          ))}
        </div>
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}
