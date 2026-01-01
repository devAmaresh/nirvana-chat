import { motion } from "framer-motion";
import { Clock, Trash2 } from "lucide-react";
interface ChatCardProps {
  chat: any;
  index: number;
  onDelete: (e: React.MouseEvent, chatId: string) => void;
  onClick: (chatId: string) => void;
}

export function ChatCard({ chat, index, onDelete, onClick }: ChatCardProps) {
  const formatDate = (ts: number) => {
    const d = new Date(ts);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));

    if (diff === 0) return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    if (diff === 1) return "Yesterday";
    if (diff < 7) return d.toLocaleDateString("en-US", { weekday: "short" });
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getPreview = () => {
    if (!chat.messages.length) return "No messages yet";
    const last = chat.messages.at(-1).content;
    return last.length > 120 ? last.slice(0, 120) + "…" : last;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100, transition: { duration: 0.2 } }}
      transition={{ 
        delay: index * 0.03,
        layout: { type: "spring", stiffness: 300, damping: 30 }
      }}
      className="group relative"
    >
      <motion.button
        onClick={() => onClick(chat.id)}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="w-full text-left px-5 py-4 rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-zinc-900/50 dark:to-zinc-900/30 border border-gray-200 dark:border-zinc-800/50 hover:border-gray-300 dark:hover:border-zinc-700/50 hover:bg-gray-50 dark:hover:bg-zinc-900/60 transition-all shadow-sm hover:shadow-md hover:shadow-gray-200/50 dark:hover:shadow-black/20"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold truncate text-gray-900 dark:text-zinc-100 mb-1.5">
              {chat.title}
            </p>
            <p className="text-xs text-gray-500 dark:text-zinc-500 line-clamp-2 leading-relaxed">
              {getPreview()}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-zinc-500">
              <Clock className="h-3.5 w-3.5" />
              {formatDate(chat.updatedAt)}
            </div>
            
            <motion.button
              onClick={(e) => onDelete(e, chat.id)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-red-500/10 text-gray-500 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400"
              aria-label="Delete chat"
            >
              <Trash2 className="h-4 w-4" />
            </motion.button>
          </div>
        </div>
      </motion.button>
    </motion.div>
  );
}