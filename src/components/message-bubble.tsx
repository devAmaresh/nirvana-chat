import { useState } from "react"
import type { Message } from "@/lib/chat-store"
import { useChatStore } from "@/lib/chat-store"
import { cn } from "@/lib/utils"
import { CopyButton } from "@/components/copy-button"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import { Brain, RefreshCw, Edit2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MessageBubbleProps {
  chatId: string
  message: Message
  isLoading?: boolean
  isLastMessage?: boolean
  isLastUserMessage?: boolean
}

export function MessageBubble({ 
  chatId, 
  message, 
  isLoading, 
  isLastMessage, 
  isLastUserMessage 
}: MessageBubbleProps) {
  const isUser = message.role === "user"
  const showLoading = isLoading && !message.content
  const { regenerateLastMessage, editMessage, loading } = useChatStore()
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(message.content)

  const handleRegenerate = () => {
    if (!loading) {
      regenerateLastMessage(chatId)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
    setEditedContent(message.content)
  }

  const handleSaveEdit = async () => {
    if (editedContent.trim() && editedContent !== message.content) {
      setIsEditing(false)
      await editMessage(chatId, message.id, editedContent.trim())
    } else {
      setIsEditing(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditedContent(message.content)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSaveEdit()
    }
    if (e.key === "Escape") {
      handleCancelEdit()
    }
  }

  return (
    <div
      className={cn(
        "group flex gap-3 animate-message-in",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      {!isUser && (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 border border-emerald-500/30 shadow-lg shadow-emerald-500/20 backdrop-blur-lg">
          <Brain className="h-5 w-5 text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />
        </div>
      )}

      {/* Message Content */}
      <div
        className={cn(
          "flex flex-col gap-2",
          isUser 
            ? isEditing 
              ? "items-end w-full max-w-[75%]" // Full width when editing
              : "items-end max-w-[75%]" // Natural width when not editing
            : "items-start w-full max-w-[90%]"
        )}
      >
        {!isUser && (
          <span className="px-1 text-sm font-bold text-emerald-600 dark:text-emerald-400">
            AI Assistant
          </span>
        )}
        
        {/* Message or Edit Mode */}
        {isUser && isEditing ? (
          // Edit Mode - Full width
          <div className="w-full space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="relative rounded-tl-2xl rounded-b-2xl bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/30 dark:border-emerald-500/40 shadow-lg backdrop-blur-xl p-1">
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                onKeyDown={handleKeyDown}
                className={cn(
                  "w-full min-h-[120px] bg-transparent rounded-xl px-4 py-3",
                  "text-[15px] leading-relaxed text-zinc-900 dark:text-zinc-100",
                  "focus:outline-none",
                  "placeholder:text-zinc-400 dark:placeholder:text-zinc-500",
                  "resize-none"
                )}
                placeholder="Edit your message..."
                autoFocus
              />
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2">
              <Button
                onClick={handleCancelEdit}
                size="sm"
                variant="ghost"
                className="h-8 px-3 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveEdit}
                size="sm"
                disabled={loading || !editedContent.trim()}
                className={cn(
                  "h-8 px-4 text-xs",
                  "bg-gradient-to-r from-emerald-500 to-green-500",
                  "hover:from-emerald-600 hover:to-green-600",
                  "text-white font-medium shadow-lg shadow-emerald-500/20",
                  "transition-all duration-200",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                Done
              </Button>
            </div>
          </div>
        ) : (
          // Normal Message Display - Natural width
          <div
            className={cn(
              "relative transition-all duration-300",
              isUser
                ? "rounded-tl-2xl rounded-b-2xl bg-gradient-to-r from-emerald-500/10 to-green-500/10 text-zinc-900 dark:text-zinc-100 border-emerald-500/30 dark:border-emerald-500/40 shadow-lg px-5 py-3 backdrop-blur-xl border"
                : "w-full overflow-x-auto"
            )}
          >
            {showLoading ? (
              <div className="flex items-center gap-3 py-2">
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-emerald-500 [animation-delay:-0.3s]" />
                  <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-emerald-500 [animation-delay:-0.15s]" />
                  <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-emerald-500" />
                </div>
                <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  Thinking...
                </span>
              </div>
            ) : isUser ? (
              <p className="whitespace-pre-wrap break-words text-left leading-relaxed text-zinc-900/90 dark:text-zinc-100/90">
                {message.content}
              </p>
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-full text-left prose-headings:font-bold prose-a:text-emerald-500 dark:prose-a:text-emerald-400 prose-code:text-emerald-500 break-words">
                <MarkdownRenderer content={message.content} />
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        {!showLoading && !isEditing && (
          <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
            {!isUser && message.content && (
              <>
                <CopyButton text={message.content} />
                {isLastMessage && !loading && (
                  <Button
                    onClick={handleRegenerate}
                    size="sm"
                    variant="ghost"
                    className="h-8 gap-1 text-xs hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Regenerate
                  </Button>
                )}
              </>
            )}
            {isUser && isLastUserMessage && !loading && (
              <Button
                onClick={handleEdit}
                size="sm"
                variant="ghost"
                className="h-8 gap-1.5 text-xs hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all"
              >
                <Edit2 className="h-3 w-3" />
                Edit
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
