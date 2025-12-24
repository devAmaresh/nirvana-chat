import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { useChatStore } from "@/lib/chat-store"
import { Send, Loader2, Sparkles, Code, FileText, Lightbulb, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

const suggestions = [
  {
    icon: Lightbulb,
    title: "Brainstorm",
    subtitle: "Creative Solutions",
    description: "Generate innovative ideas and creative solutions for any challenge",
    prompt: "Help me brainstorm creative ideas for a new mobile app",
    gradient: "from-amber-500 via-orange-500 to-amber-600",
    bgGradient: "from-amber-500/10 via-orange-500/5 to-transparent",
    iconColor: "text-amber-400",
    accentColor: "amber",
  },
  {
    icon: Code,
    title: "Code",
    subtitle: "Any Language",
    description: "Write, debug, and optimize code across all programming languages",
    prompt: "Write a Python function to sort a list of dictionaries by a specific key",
    gradient: "from-blue-500 via-cyan-500 to-blue-600",
    bgGradient: "from-blue-500/10 via-cyan-500/5 to-transparent",
    iconColor: "text-blue-400",
    accentColor: "blue",
  },
  {
    icon: FileText,
    title: "Analyze",
    subtitle: "Deep Insights",
    description: "Summarize documents and extract key insights from complex text",
    prompt: "Summarize the key points of effective time management techniques",
    gradient: "from-emerald-500 via-teal-500 to-emerald-600",
    bgGradient: "from-emerald-500/10 via-teal-500/5 to-transparent",
    iconColor: "text-emerald-400",
    accentColor: "emerald",
  },
  {
    icon: Zap,
    title: "Discover",
    subtitle: "Instant Answers",
    description: "Get quick, accurate answers to any question you can imagine",
    prompt: "Explain quantum computing in simple terms",
    gradient: "from-violet-500 via-purple-500 to-violet-600",
    bgGradient: "from-violet-500/10 via-purple-500/5 to-transparent",
    iconColor: "text-violet-400",
    accentColor: "violet",
  },
]

export function LandingView() {
  const [input, setInput] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { sendMessage, loading } = useChatStore()

  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = "auto"
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
    }
  }, [])

  useEffect(() => {
    adjustHeight()
  }, [input, adjustHeight])

  const handleSubmit = async (message?: string) => {
    const trimmedInput = (message || input).trim()
    if (!trimmedInput || loading) return

    setInput("")
    await sendMessage(trimmedInput)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleSuggestionClick = (prompt: string) => {
    handleSubmit(prompt)
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-4 md:p-8 overflow-y-auto">
      <div className="flex w-full max-w-5xl flex-col items-center space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-6 w-full">
          <div className="space-y-3">
            <h1 className="text-5xl font-black tracking-tight bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-900/70 dark:from-zinc-100 dark:via-zinc-100 dark:to-zinc-100/70 bg-clip-text text-transparent">
              Nirvana Chat
            </h1>
            <p className="text-md text-zinc-500 dark:text-zinc-400 font-medium max-w-2xl mx-auto">
              Powered by Google Gemini 2.5. Experience AI conversations like never before.
            </p>
          </div>
        </div>

        {/* Input Area */}
        <div className="w-full max-w-3xl">
          <div
            className={cn(
              "input-glow relative overflow-visible rounded-3xl bg-card/50 backdrop-blur-xl shadow-2xl border border-border/50 transition-all",
              "focus-within:shadow-[0_0_40px_rgba(76,158,245,0.25)] focus-within:border-primary/50",
            )}
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="What do you want to know?"
              disabled={loading}
              rows={1}
              className="max-h-[200px] min-h-[70px] w-full resize-none bg-transparent px-6 py-5 pr-16 text-lg placeholder:text-muted-foreground/60 focus:outline-none disabled:opacity-50"
              autoFocus
            />
            <button
              onClick={() => handleSubmit()}
              disabled={!input.trim() || loading}
              className={cn(
                "absolute bottom-4 right-4 flex h-12 w-12 items-center justify-center rounded-2xl transition-all",
                "bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-500 text-white shadow-xl shimmer-effect",
                "hover:shadow-[0_0_30px_rgba(76,158,245,0.5)] hover:scale-110 active:scale-95",
                "disabled:opacity-40 disabled:shadow-lg disabled:cursor-not-allowed disabled:hover:scale-100",
              )}
            >
              {loading ? <Loader2 className="h-6 w-6 animate-spin" strokeWidth={2.5} /> : <Send className="h-6 w-6" strokeWidth={2.5} />}
              <span className="sr-only">Send message</span>
            </button>
          </div>
          <p className="mt-4 text-center text-sm text-muted-foreground/70">
            Press <kbd className="rounded-lg bg-muted/50 px-2 py-1 font-mono text-xs ring-1 ring-border/30">Enter</kbd> to send
          </p>
        </div>

        {/* Suggestions Grid */}
        <div className="w-full max-w-5xl">
          <h2 className="text-center text-base font-semibold text-muted-foreground mb-6 uppercase tracking-wider">
            What can I help you with?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion.title}
                onClick={() => handleSuggestionClick(suggestion.prompt)}
                disabled={loading}
                style={{ animationDelay: `${index * 100}ms` }}
                className={cn(
                  "group relative flex flex-col gap-4 rounded-2xl p-6 text-left transition-all overflow-hidden",
                  "bg-card/30 backdrop-blur-sm border border-border/50 shadow-lg",
                  "hover:shadow-2xl hover:scale-[1.02] hover:border-border active:scale-[0.98]",
                  "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
                  "animate-fade-in-up"
                )}
              >
                {/* Background Gradient */}
                <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500", suggestion.bgGradient)} />
                
                {/* Icon */}
                <div className="relative">
                  <div className={cn(
                    "flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg transition-all",
                    "group-hover:scale-110 group-hover:shadow-2xl",
                    suggestion.gradient,
                  )}>
                    <suggestion.icon className="h-7 w-7 text-white drop-shadow-lg" strokeWidth={2.5} />
                  </div>
                </div>
                
                {/* Content */}
                <div className="relative space-y-2">
                  <div>
                    <h3 className="text-lg font-bold text-foreground group-hover:text-foreground/90">
                      {suggestion.title}
                    </h3>
                    <p className={cn("text-sm font-semibold", suggestion.iconColor)}>
                      {suggestion.subtitle}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground/80 leading-relaxed">
                    {suggestion.description}
                  </p>
                </div>

                {/* Hover Arrow */}
                <div className="relative mt-auto opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className={cn("flex items-center gap-2 text-sm font-semibold", suggestion.iconColor)}>
                    <span>Try it</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
