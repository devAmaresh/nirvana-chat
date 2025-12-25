import { useEffect, useRef } from "react"
import { useChatStore } from "@/lib/chat-store"
import { MessageBubble } from "@/components/message-bubble"
import { MessageSquare } from "lucide-react"

interface ChatWindowProps {
  chatId: string
}

export function ChatWindow({ chatId }: ChatWindowProps) {
  const { getChat, loading } = useChatStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const activeChat = getChat(chatId)
  const messages = activeChat?.messages || []

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [messages])

  if (!activeChat || messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center mb-8 shadow-xl ring-4 ring-emerald-500/10">
          <MessageSquare className="w-10 h-10 text-emerald-500" strokeWidth={2.5} />
        </div>
        <h2 className="text-3xl font-black text-zinc-900 dark:text-zinc-100 mb-3">Start a Conversation</h2>
        <p className="text-zinc-500/70 dark:text-zinc-400/70 max-w-md text-lg">
          Ask me anything and I'll help you find the answers.
        </p>
      </div>
    )
  }

  // Find last user message index
  let lastUserMessageIndex = -1
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === 'user') {
      lastUserMessageIndex = i
      break
    }
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-white via-white to-white/20 dark:from-black dark:via-black dark:to-zinc-900/20">
      <div className="max-w-4xl mx-auto px-6 py-8 pb-24">
        <div className="space-y-2">
          {messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              chatId={chatId}
              message={message}
              isLoading={loading && index === messages.length - 1 && message.role === "assistant"}
              isLastMessage={index === messages.length - 1}
              isLastUserMessage={index === lastUserMessageIndex}
            />
          ))}
        </div>
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}
