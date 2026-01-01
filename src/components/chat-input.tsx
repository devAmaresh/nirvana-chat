import type React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import { useChatStore, type MessageImage } from "@/lib/store/chat-store";
import { Send, Square, ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
  const [images, setImages] = useState<MessageImage[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const wordCount = input.trim() ? input.trim().split(/\s+/).length : 0;

  const isTooLong = wordCount > 10000;

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    // Check if adding these images would exceed the limit
    const remainingSlots = 3 - images.length;
    if (remainingSlots === 0) {
      toast.error("Maximum 3 images allowed");
      return;
    }

    const newImages: MessageImage[] = [];
    let filesProcessed = 0;

    for (let i = 0; i < files.length && filesProcessed < remainingSlots; i++) {
      const file = files[i];

      // Check if it's an image
      if (!file.type.startsWith("image/")) {
        toast.warning(`${file.name} is not an image file`);
        continue;
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`);
        continue;
      }

      try {
        const base64 = await fileToBase64(file);
        newImages.push({
          data: base64,
          mimeType: file.type,
        });
        filesProcessed++;
      } catch (error) {
        console.error("Error reading file:", error);
        toast.error(`Failed to read ${file.name}`);
      }
    }

    if (files.length > remainingSlots) {
      toast.warning(
        `Only ${remainingSlots} image${
          remainingSlots !== 1 ? "s" : ""
        } can be added (3 max)`
      );
    }

    setImages((prev) => [...prev, ...newImages]);
  };

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = (reader.result as string).split(",")[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Handle paste event for images
  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    const imageItems: DataTransferItem[] = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image/")) {
        imageItems.push(items[i]);
      }
    }

    if (imageItems.length === 0) return;

    // Check if adding these images would exceed the limit
    const remainingSlots = 3 - images.length;
    if (remainingSlots === 0) {
      e.preventDefault();
      toast.error("Maximum 3 images allowed");
      return;
    }

    e.preventDefault();

    const newImages: MessageImage[] = [];
    let itemsProcessed = 0;

    for (const item of imageItems) {
      if (itemsProcessed >= remainingSlots) break;

      const file = item.getAsFile();
      if (!file) continue;

      try {
        const base64 = await fileToBase64(file);
        newImages.push({
          data: base64,
          mimeType: file.type,
        });
        itemsProcessed++;
      } catch (error) {
        console.error("Error reading pasted image:", error);
        toast.error("Failed to read pasted image");
      }
    }

    if (imageItems.length > remainingSlots) {
      toast.warning(
        `Only ${remainingSlots} image${
          remainingSlots !== 1 ? "s" : ""
        } can be added (3 max)`
      );
    }

    setImages((prev) => [...prev, ...newImages]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const trimmedInput = input.trim();
    if ((!trimmedInput && images.length === 0) || loading) return;

    if (isTooLong) {
      toast.error(
        `Message too long (${wordCount.toLocaleString()} words). Maximum is 10,000 words.`
      );
      return;
    }

    const imagesToSend = [...images];
    setInput("");
    setImages([]);

    // If no chatId, create a new chat first
    let targetChatId = chatId;
    if (!targetChatId) {
      targetChatId = createNewChat(personaId);
      if (onMessageSent) {
        onMessageSent(targetChatId);
      }
    }

    await sendMessage(
      targetChatId,
      trimmedInput,
      imagesToSend.length > 0 ? imagesToSend : undefined
    );
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
        {images.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={`data:${image.mimeType};base64,${image.data}`}
                  alt={`Upload ${index + 1}`}
                  className="h-14 w-14 object-cover rounded-2xl border-2 border-emerald-500/20 dark:border-emerald-500/30 shadow-lg"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center rounded-full bg-zinc-500 hover:bg-zinc-600 text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove image"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="relative flex items-end gap-0 rounded-4xl border border-emerald-500/20 dark:border-emerald-500/20 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl shadow-2xl shadow-emerald-500/10 p-1.5">
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleFileSelect(e.target.files)}
            accept="image/*"
            multiple
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            size="icon"
            variant="ghost"
            className="h-12 w-12 shrink-0 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all hover:scale-110 active:scale-95 rounded-4xl"
            title="Upload image"
          >
            <ImagePlus className="h-5 w-5" strokeWidth={2.5} />
            <span className="sr-only">Upload image</span>
          </Button>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder="Ask anything..."
            disabled={loading}
            rows={1}
            className="flex-1 leading-[38px] resize-none bg-transparent px-2 py-1 text-base placeholder:text-zinc-500/40 dark:placeholder:text-zinc-400/40 focus:outline-none disabled:opacity-50 max-h-50"
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
              disabled={!input.trim() && images.length === 0 || isTooLong}
              size="icon"
              className="h-12 w-12 shrink-0 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 shadow-2xl hover:shadow-emerald-500/50 transition-all shimmer-effect hover:scale-110 active:scale-95 rounded-4xl disabled:opacity-50 disabled:cursor-not-allowed ml-1"
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
            for new line <span className="mx-1 text-zinc-500/40">·</span>
            <kbd
              className="mx-1 rounded-md bg-emerald-500/10 px-2 py-1 font-mono text-[11px] 
                  ring-1 ring-emerald-500/20 text-emerald-400 dark:text-emerald-500"
            >
              Ctrl + V
            </kbd>
            to paste images
          </p>
        )}
      </div>
    </div>
  );
}
