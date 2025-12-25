import type React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import { useChatStore } from "@/lib/chat-store";
import { Send, Square } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
  chatId: string | null;
  personaId?: string;
  onMessageSent?: (chatId: string) => void;
  showFooter?: boolean;
}

export function ChatInput({
  chatId,
  personaId,
  onMessageSent,
  showFooter = true,
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { sendMessage, loading, stopGeneration, createNewChat } =
    useChatStore();

  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [input, adjustHeight]);

  const handleSubmit = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || loading) return;

    setInput("");

    // If no chatId, create a new chat first
    let targetChatId = chatId;
    if (!targetChatId) {
      targetChatId = createNewChat(personaId);
      if (onMessageSent) {
        onMessageSent(targetChatId);
      }
    }

    await sendMessage(targetChatId, trimmedInput);
  };

  const handleStop = () => {
    stopGeneration();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-zinc-200/30 dark:border-zinc-800/30 bg-white/60 dark:bg-black/60 backdrop-blur-2xl supports-backdrop-filter:bg-white/40 dark:supports-backdrop-filter:bg-black/40 px-3 py-2">
      <div className="max-w-4xl mx-auto">
        <div className="relative flex items-end gap-3 rounded-4xl border border-emerald-500/20 dark:border-emerald-500/20 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl shadow-2xl shadow-emerald-500/10 p-1.5">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything..."
            disabled={loading}
            rows={1}
            className="flex-1 leading-[38px] resize-none bg-transparent px-3 py-1 text-base placeholder:text-zinc-500/40 dark:placeholder:text-zinc-400/40 focus:outline-none disabled:opacity-50 max-h-50"
          />
          {loading ? (
            <Button
              onClick={handleStop}
              size="icon"
              variant="ghost"
              className="h-12 w-12 shrink-0 hover:bg-red-500/20 hover:text-red-500 transition-all hover:scale-110 active:scale-95 rounded-4xl"
              title="Stop generation"
            >
              <Square className="h-5 w-5 fill-current" strokeWidth={2.5} />
              <span className="sr-only">Stop generation</span>
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!input.trim()}
              size="icon"
              className="h-12 w-12 shrink-0 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 shadow-2xl hover:shadow-emerald-500/50 transition-all shimmer-effect hover:scale-110 active:scale-95 rounded-4xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-5 w-5" strokeWidth={2.5} />
              <span className="sr-only">Send message</span>
            </Button>
          )}
        </div>
        {showFooter && (
        <p className="mt-2 text-center text-xs text-zinc-500/50 dark:text-zinc-400/40 hidden md:block">
          Press{" "}
          <kbd
            className="mx-1 rounded-md bg-emerald-500/10 px-2 py-1 font-mono text-[11px] 
                  ring-1 ring-emerald-500/20 text-emerald-400 dark:text-emerald-500"
          >
            Enter
          </kbd>
          to send <span className="mx-1 text-zinc-500/40">·</span>
          <kbd
            className="mx-1 rounded-md bg-emerald-500/10 px-2 py-1 font-mono text-[11px] 
                  ring-1 ring-emerald-500/20 text-emerald-400 dark:text-emerald-500"
          >
            Shift + Enter
          </kbd>
          for new line
        </p>
        )}
      </div>
    </div>
  );
}
