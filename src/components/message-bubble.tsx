import { useState, useRef } from "react";
import type { Message, MessageImage } from "@/lib/chat-store";
import { useChatStore } from "@/lib/chat-store";
import { cn } from "@/lib/utils";
import { CopyButton } from "@/components/copy-button";
import { DownloadButton } from "@/components/downloadButton";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { Brain, RefreshCw, Pencil, ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip } from "react-tooltip";
import { tooltipStyle } from "@/lib/tootlipStyle";
import { toast } from "sonner";

interface MessageBubbleProps {
  chatId: string;
  message: Message;
  isLoading?: boolean;
  isLastMessage?: boolean;
  isLastUserMessage?: boolean;
}

export function MessageBubble({
  chatId,
  message,
  isLoading,
  isLastMessage,
  isLastUserMessage,
}: MessageBubbleProps) {
  const isUser = message.role === "user";
  const showLoading = isLoading && !message.content;
  const { regenerateLastMessage, editMessage, loading } = useChatStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);
  const [editedImages, setEditedImages] = useState<MessageImage[]>(
    message.images || []
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRegenerate = () => {
    if (!loading) {
      regenerateLastMessage(chatId);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedContent(message.content);
    setEditedImages(message.images || []);
  };

  const handleSaveEdit = async () => {
    if (
      (editedContent.trim() || editedImages.length > 0) &&
      (editedContent !== message.content ||
        JSON.stringify(editedImages) !== JSON.stringify(message.images))
    ) {
      setIsEditing(false);
      await editMessage(
        chatId,
        message.id,
        editedContent.trim(),
        editedImages.length > 0 ? editedImages : undefined
      );
    } else {
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedContent(message.content);
    setEditedImages(message.images || []);
  };

  // Handle file selection for edit mode
  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    // Check if adding these images would exceed the limit
    const remainingSlots = 3 - editedImages.length;
    if (remainingSlots === 0) {
      toast.error('Maximum 3 images allowed');
      return;
    }

    const newImages: MessageImage[] = [];
    let filesProcessed = 0;

    for (let i = 0; i < files.length && filesProcessed < remainingSlots; i++) {
      const file = files[i];

      if (!file.type.startsWith("image/")) {
        toast.warning(`${file.name} is not an image file`);
        continue;
      }
      if (file.size > 20 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 20MB)`);
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
      toast.warning(`Only ${remainingSlots} image${remainingSlots !== 1 ? 's' : ''} can be added (3 max)`);
    }

    setEditedImages((prev) => [...prev, ...newImages]);
  };

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

  const removeEditedImage = (index: number) => {
    setEditedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSaveEdit();
    }
    if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  return (
    <>
      <div
        className={cn(
          "group flex gap-3 animate-message-in",
          isUser ? "flex-row-reverse" : "flex-row"
        )}
      >
        
        {!isUser && (
          <div className="hidden lg:flex h-10 w-10 shrink-0 items-center justify-center rounded-4xl bg-emerald-500/20 border border-emerald-500/10">
            <Brain
              className="h-5 w-5 text-emerald-600 dark:text-emerald-500"
              strokeWidth={1.5}
            />
          </div>
        )}

        
        <div
          className={cn(
            "flex flex-col gap-2",
            isUser
              ? isEditing
                ? "items-end w-full max-w-[75%]"
                : "items-end max-w-[75%]"
              : "items-start w-full md:max-w-[90%] max-w-full"
          )}
        >
          
          {isUser && isEditing ? (
            <div className="w-full space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
              {editedImages.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {editedImages.map((image, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={`data:${image.mimeType};base64,${image.data}`}
                        alt={`Edit ${idx + 1}`}
                        className="h-14 w-14 object-cover rounded-2xl border-2 border-emerald-500/20 dark:border-emerald-500/30 shadow-lg"
                      />
                      <button
                        onClick={() => removeEditedImage(idx)}
                        className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center rounded-full bg-zinc-500 hover:bg-zinc-600 text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Remove image"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="relative rounded-tl-2xl rounded-b-2xl bg-emerald-500/10 border border-emerald-500/30 dark:border-emerald-500/20 shadow-lg backdrop-blur-xl p-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => handleFileSelect(e.target.files)}
                  accept="image/*"
                  multiple
                  className="hidden"
                />
                <div className="flex items-start gap-2 p-2">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 shrink-0 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400"
                    title="Add image"
                  >
                    <ImagePlus className="h-4 w-4" />
                  </Button>
                  <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className={cn(
                      "flex-1 min-h-[80px] bg-transparent rounded-xl px-2 py-1",
                      "text-[15px] leading-relaxed text-zinc-900 dark:text-zinc-100",
                      "focus:outline-none",
                      "placeholder:text-zinc-400 dark:placeholder:text-zinc-500",
                      "resize-none"
                    )}
                    placeholder="Edit your message..."
                    autoFocus
                  />
                </div>
              </div>

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
                  disabled={
                    loading ||
                    (!editedContent.trim() && editedImages.length === 0)
                  }
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
            <>
              {isUser && (
                <>
                  {message.images && message.images.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {message.images.map((image, idx) => (
                        <img
                          key={idx}
                          src={`data:${image.mimeType};base64,${image.data}`}
                          alt={`Uploaded ${idx + 1}`}
                          className="w-14 h-14 rounded-2xl border border-emerald-500/20 shadow-lg object-fill"
                        />
                      ))}
                    </div>
                  )}
                </>
              )}

              <div
                className={cn(
                  "relative transition-all duration-300",
                  isUser
                    ? "rounded-tl-4xl rounded-tr-xl rounded-b-4xl bg-gradient-to-r from-emerald-500/10 to-green-500/10 text-zinc-900 dark:text-zinc-100 border-emerald-500/30 dark:border-emerald-500/10 shadow-lg px-5 py-3 backdrop-blur-xl border"
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
                  <div className="space-y-3">
                    {message.content && (
                      <p className="whitespace-pre-wrap break-words text-left leading-relaxed text-zinc-900/90 dark:text-zinc-100/90">
                        {message.content}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="prose prose-sm dark:prose-invert max-w-full text-left prose-headings:font-bold prose-a:text-emerald-500 dark:prose-a:text-emerald-400 prose-code:text-emerald-500 break-words">
                    <MarkdownRenderer content={message.content} />
                  </div>
                )}
              </div>
            </>
          )}

          
          {!showLoading && !isEditing && (
            <div className="flex gap-0">
              {!isUser && message.content && (
                <>
                  <CopyButton text={message.content} />
                  <DownloadButton content={message.content} />
                  {isLastMessage && !loading && (
                    <>
                      <Button
                        onClick={handleRegenerate}
                        size="sm"
                        variant="ghost"
                        data-tooltip-id="regenerate-tooltip"
                        data-tooltip-content="Regenerate"
                        data-tooltip-place="bottom"
                        className="h-8 gap-1 text-xs hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 text-zinc-500 dark:text-zinc-400"
                      >
                        <RefreshCw className="h-3 w-3" />
                      </Button>
                      <Tooltip id="regenerate-tooltip" style={tooltipStyle} />
                    </>
                  )}
                </>
              )}
              {isUser && isLastUserMessage && !loading && (
                <>
                  <Button
                    onClick={handleEdit}
                    size="sm"
                    variant="ghost"
                    data-tooltip-id="edit-tooltip"
                    data-tooltip-content="Edit"
                    data-tooltip-place="bottom"
                    className="opacity-0 group-hover:opacity-100 -mt-1 h-8 gap-1.5 text-xs hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-200"
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Tooltip
                    id="edit-tooltip"
                    place="bottom"
                    style={tooltipStyle}
                  />
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
