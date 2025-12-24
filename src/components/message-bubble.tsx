import type { Message } from "@/lib/chat-store";
import { cn } from "@/lib/utils";
import { CopyButton } from "@/components/copy-button";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { User, Sparkles } from "lucide-react";

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
        "group flex gap-5 animate-message-in",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      {!isUser && (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-500 shadow-xl ring-2 ring-blue-500/30">
          <Sparkles className="h-5 w-5 text-white" strokeWidth={2.5} />
        </div>
      )}

      {/* Message Content */}
      <div
        className={cn(
          "flex min-w-0 max-w-[75%] flex-col gap-2",
          isUser ? "items-end" : "items-start"
        )}
      >
        {!isUser && (
          <span className="px-1 text-sm font-bold text-zinc-900/80 dark:text-zinc-100/80">
            Nirvana AI
          </span>
        )}
        <div
          className={cn(
            "relative overflow-hidden rounded-2xl ",
            isUser
              ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border-zinc-200/50 dark:border-zinc-800/50 shadow-lg px-5 py-4 backdrop-blur-xl border transition-all"
              : ""
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
            <div className="prose prose-sm dark:prose-invert max-w-none text-left prose-headings:font-bold prose-a:text-blue-400 dark:prose-a:text-blue-400 prose-code:text-blue-400">
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
