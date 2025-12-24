import type { Message } from "@/lib/chat-store";
import { cn } from "@/lib/utils";
import { CopyButton } from "@/components/copy-button";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { Brain } from "lucide-react";

interface MessageBubbleProps {
  message: Message;
  isLoading?: boolean;
}

export function MessageBubble({ message, isLoading }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const showLoading = isLoading && !message.content;

  return (
    <div
      className={cn(
        "group flex gap-3 animate-message-in",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      {!isUser && (
        <div
          className="
      flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl

      bg-white/30 backdrop-blur-lg
      border border-white/40
      shadow-md

      dark:bg-white/10
      dark:border-white/20
      dark:shadow-lg
    "
        >
          <Brain
            className="h-5 w-5 text-slate-800 dark:text-white"
            strokeWidth={2.5}
          />
        </div>
      )}

      {/* Message Content */}
      <div
        className={cn(
          "flex flex-col gap-2",
          isUser 
            ? "items-end min-w-0 max-w-[75%]" 
            : "items-start w-full max-w-[90%]"
        )}
      >
        {!isUser && (
          <span className="px-1 text-sm font-bold text-zinc-900/80 dark:text-zinc-100/80">
            Nirvana AI
          </span>
        )}
        <div
          className={cn(
            "relative w-full",
            isUser
              ? "rounded-2xl bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border-zinc-200/50 dark:border-zinc-800/50 shadow-lg px-5 py-4 backdrop-blur-xl border transition-all"
              : "overflow-x-auto"
          )}
        >
          {showLoading ? (
            <div className="flex items-center gap-3 py-2">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-blue-500 [animation-delay:-0.3s]" />
                <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-blue-500 [animation-delay:-0.15s]" />
                <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-blue-500" />
              </div>
              <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                Thinking...
              </span>
            </div>
          ) : isUser ? (
            <p className="whitespace-pre-wrap break-words text-left leading-relaxed text-zinc-900/90 dark:text-zinc-100/90">
              {message.content}
            </p>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-full text-left prose-headings:font-bold prose-a:text-blue-400 dark:prose-a:text-blue-400 prose-code:text-blue-400 break-words">
              <MarkdownRenderer content={message.content} />
            </div>
          )}
        </div>

        {/* Copy Button for Assistant Messages */}
        {!isUser && message.content && !showLoading && (
          <div className="mt-2 opacity-0 transition-opacity group-hover:opacity-100">
            <CopyButton text={message.content} />
          </div>
        )}
      </div>
    </div>
  );
}
