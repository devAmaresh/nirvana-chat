import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { useChatStore } from "@/lib/chat-store"
import { Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ChatInput() {
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

  const handleSubmit = async () => {
    const trimmedInput = input.trim()
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

  return (
    <div className="border-t border-zinc-200/30 dark:border-zinc-800/30 bg-white/60 dark:bg-black/60 backdrop-blur-2xl supports-backdrop-filter:bg-white/40 dark:supports-backdrop-filter:bg-black/40 px-3 py-2">
      <div className="max-w-4xl mx-auto">
        <div className="relative flex items-end gap-3 rounded-3xl border border-zinc-200/40 dark:border-zinc-800/40 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl shadow-2xl p-1.5">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Nirvana anything..."
            disabled={loading}
            rows={1}
            className="flex-1 leading-[38px] resize-none bg-transparent px-3 py-1 text-base placeholder:text-zinc-500/40 dark:placeholder:text-zinc-400/40 focus:outline-none disabled:opacity-50 max-h-50"
          />
          <Button 
            onClick={handleSubmit} 
            disabled={!input.trim() || loading} 
            size="icon" 
            className="hover:cursor-pointer h-12 w-12 shrink-0 shadow-2xl hover:shadow-[0_0_30px_rgba(76,158,245,0.5)] transition-all shimmer-effect hover:scale-110 active:scale-95 rounded-2xl"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" strokeWidth={2.5} /> : <Send className="h-5 w-5" strokeWidth={2.5} />}
            <span className="sr-only">Send message</span>
          </Button>
        </div>
        <p className="mt-2 text-center text-sm text-zinc-500/40 dark:text-zinc-400/40">
          Press <kbd className="rounded-lg bg-zinc-100/20 dark:bg-zinc-600/20 px-2 py-1 font-mono text-xs ring-1 ring-zinc-200/20 dark:ring-zinc-800/20">Enter</kbd> to send
        </p>
      </div>
    </div>
  )
}
