import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { cn } from "@/lib/utils"

interface CopyButtonProps {
  text: string
  className?: string
}

export function CopyButton({ text, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  return (
    <button
      onClick={handleCopy}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all",
        "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100",
        "bg-zinc-100/60 dark:bg-zinc-800/60 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/80 shadow-lg backdrop-blur-sm",
        "ring-1 ring-zinc-200/30 dark:ring-zinc-800/30 hover:ring-zinc-200/50 dark:hover:ring-zinc-800/50",
        copied && "text-emerald-500 dark:text-emerald-400 ring-emerald-500/40 bg-emerald-500/10",
        className,
      )}
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" strokeWidth={2.5} />
          <span>Copy</span>
        </>
      )}
    </button>
  )
}
