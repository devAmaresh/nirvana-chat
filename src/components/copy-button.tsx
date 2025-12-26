import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./ui/button"

interface CopyButtonProps {
  text: string
  className?: string
  place?: "top" | "right" | "bottom" | "left"
}

export function CopyButton({ text, className,place="bottom" }: CopyButtonProps) {
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
    <>
     <Button
          size="sm"
          variant="ghost"
          onClick={handleCopy}
          data-tooltip-id="copy-tooltip"
          data-tooltip-content={copied ? "Copied!" : "Copy to clipboard"}
          data-tooltip-place={place}
          className={cn(
            "h-8 gap-1 text-xs hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 text-zinc-500 dark:text-zinc-400",
            className
          )}
          >
      {copied ? (
        <>
          <Check className="h-3 w-3" />
        </>
      ) : (
        <>
          <Copy className="h-3 w-3"/>
        </>
      )}
      
    </Button>
      </>
  )
}
