import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { getPersonaById } from "@/lib/personas";
import { useChatStore } from "@/lib/chat-store";
import { ArrowLeft, Trash2, MessageSquare, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatInput } from "@/components/chat-input";
import { useMemo, useCallback, useEffect } from "react";

export function SpaceDetailView() {
  const { personaId } = useParams<{ personaId: string }>();
  const navigate = useNavigate();
  const { getChatsByPersona, deleteChat } = useChatStore();

  const persona = useMemo(
    () => (personaId ? getPersonaById(personaId) : null),
    [personaId]
  );
 
  const chats = useChatStore(state => state.chats);

const sortedChats = useMemo(() => {
  if (!personaId) return [];

  return chats
    .filter(c => c.personaId === personaId)
    .slice()
    .sort((a, b) => b.updatedAt - a.updatedAt);
}, [personaId, chats]);

  const handleDeleteChat = useCallback((e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    deleteChat(chatId);
  }, [deleteChat]);

  const handleChatClick = useCallback((chatId: string) => {
    navigate(`/c/${chatId}`);
  }, [navigate]);

  const handleMessageSent = useCallback((id: string) => {
    navigate(`/c/${id}`);
  }, [navigate]);

  if (!persona) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-zinc-950 dark:to-black text-gray-500 dark:text-zinc-400"
      >
        <MessageSquare className="h-16 w-16 mb-4 opacity-20" />
        <p className="text-lg font-medium">Space not found</p>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100 dark:from-black dark:via-zinc-950 dark:to-black text-gray-900 dark:text-zinc-100">
      {/* HEADER - Modern glass morphism */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-20 backdrop-blur-xl bg-white/60 dark:bg-black/40 dark:border-zinc-800/50 shadow-lg shadow-gray-200/20 dark:shadow-black/20"
      >
        <div className="max-w-4xl mx-auto px-6 py-5">
          <Button
            variant="ghost"
            onClick={() => navigate("/spaces")}
            className="mb-4 -ml-2 text-gray-600 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-gray-100 dark:hover:bg-zinc-800/50 transition-all group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Spaces
          </Button>
          
          <div className="flex items-start gap-4">
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="text-5xl"
            >
              {persona.emoji}
            </motion.div>
            
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-zinc-100 dark:to-zinc-400 bg-clip-text text-transparent">
                {persona.name}
              </h1>
              <p className="text-sm text-gray-600 dark:text-zinc-400 mt-2 leading-relaxed">
                {persona.description}
              </p>
            </div>
          </div>
        </div>
      </motion.header>

      {/* INPUT - Elevated design */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="relative z-10 px-6 pt-6"
      >
        <div className="max-w-4xl mx-auto">
          <ChatInput
            chatId={null}
            personaId={persona.id}
            onMessageSent={handleMessageSent}
            showFooter={false}
          />
        </div>
      </motion.div>

      {/* THREADS - Enhanced list with layout animations */}
      <div className="flex-1 overflow-y-auto px-6">
        <div className="max-w-4xl mx-auto py-8">
          <AnimatePresence mode="popLayout">
            {sortedChats.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <MessageSquare className="h-12 w-12 text-gray-300 dark:text-zinc-700 mb-4" />
                <p className="text-sm text-gray-500 dark:text-zinc-500 font-medium">
                  No conversations yet
                </p>
                <p className="text-xs text-gray-400 dark:text-zinc-600 mt-2">
                  Start a new chat to get going
                </p>
              </motion.div>
            ) : (
              <LayoutGroup>
                <div className="space-y-2">
                  {sortedChats.map((chat, index) => (
                    <ChatCard
                      key={chat.id}
                      chat={chat}
                      index={index}
                      onDelete={handleDeleteChat}
                      onClick={handleChatClick}
                    />
                  ))}
                </div>
              </LayoutGroup>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// Extracted component for better performance and reusability
interface ChatCardProps {
  chat: any;
  index: number;
  onDelete: (e: React.MouseEvent, chatId: string) => void;
  onClick: (chatId: string) => void;
}

function ChatCard({ chat, index, onDelete, onClick }: ChatCardProps) {
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
