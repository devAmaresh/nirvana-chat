import { useNavigate } from "react-router-dom"
import { useChatStore } from "@/lib/chat-store"
import { Code, FileText, Lightbulb, Zap, ArrowRight, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { ChatInput } from "./chat-input"

const suggestions = [
  {
    icon: Lightbulb,
    title: "Brainstorm",
    description: "Creative ideas & solutions",
    prompt: "Help me brainstorm creative ideas for a new mobile app",
    gradient: "from-amber-500 to-orange-600",
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-500",
  },
  {
    icon: Code,
    title: "Code",
    description: "Write & debug code",
    prompt: "Write a Python function to sort a list of dictionaries by a specific key",
    gradient: "from-blue-500 to-cyan-600",
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-500",
  },
  {
    icon: FileText,
    title: "Analyze",
    description: "Extract key insights",
    prompt: "Summarize the key points of effective time management techniques",
    gradient: "from-emerald-500 to-teal-600",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-500",
  },
  {
    icon: Zap,
    title: "Discover",
    description: "Get instant answers",
    prompt: "Explain quantum computing in simple terms",
    gradient: "from-violet-500 to-purple-600",
    iconBg: "bg-violet-500/10",
    iconColor: "text-violet-500",
  },
]

export function LandingView() {
  const navigate = useNavigate()
  const { createNewChat, activePersonaId, sendMessage } = useChatStore()

  const handleMessageSent = (chatId: string) => {
    navigate(`/c/${chatId}`)
  }

  const handleSuggestionClick = async (prompt: string) => {
    const chatId = createNewChat(activePersonaId)
    navigate(`/c/${chatId}`)
    
    // Send message immediately after navigation
    setTimeout(() => {
      sendMessage(chatId, prompt)
    }, 100)
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-6 overflow-y-auto">
      <div className="flex w-full max-w-4xl flex-col items-center space-y-10">
        {/* Hero Section - Compact & Modern */}
        <div className="text-center space-y-3 w-full">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-zinc-100 to-zinc-50 dark:from-zinc-900 dark:to-zinc-800 border border-zinc-200 dark:border-zinc-700 mb-4">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Powered by Gemini 2.5 Flash</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Nirvana Chat
          </h1>
          
        </div>

        {/* Input Area - Cleaner */}
        <div className="w-full max-w-3xl">
          <ChatInput chatId={null} onMessageSent={handleMessageSent}/>  
        </div>

        {/* Suggestions Grid - Modern Cards */}
        <div className="w-full max-w-3xl">
          <p className="text-center text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-5 uppercase tracking-wide">
            Try asking about
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.title}
                onClick={() => handleSuggestionClick(suggestion.prompt)}
                className={cn(
                  "group relative flex flex-col gap-3 rounded-2xl p-4 text-left transition-all duration-300",
                  "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800",
                  "hover:border-zinc-300 dark:hover:border-zinc-700",
                  "hover:shadow-lg hover:-translate-y-0.5",
                  "active:translate-y-0 active:scale-[0.98]"
                )}
              >
                {/* Icon */}
                <div className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300",
                  "group-hover:scale-110",
                  suggestion.iconBg
                )}>
                  <suggestion.icon className={cn("h-5 w-5", suggestion.iconColor)} strokeWidth={2} />
                </div>
                
                {/* Content */}
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {suggestion.title}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    {suggestion.description}
                  </p>
                </div>

                {/* Hover Indicator */}
                <ArrowRight className={cn(
                  "absolute bottom-4 right-4 h-3.5 w-3.5 opacity-0 transition-all duration-300",
                  "group-hover:opacity-100 group-hover:translate-x-0.5",
                  suggestion.iconColor
                )} />
              </button>
            ))}
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-xs text-zinc-400 dark:text-zinc-600 text-center max-w-md">
          Start a conversation or choose a suggestion above to begin
        </p>
      </div>
    </div>
  )
}
