import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { getPersonaById } from "@/lib/personas";
import { useChatStore } from "@/lib/store/chat-store";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatInput } from "@/components/chat-input";
import { useMemo, useCallback } from "react";
import { ChatCard } from "./chat-card";

export function SpaceDetailView() {
  const { personaId } = useParams<{ personaId: string }>();
  const navigate = useNavigate();
  const {deleteChat } = useChatStore();

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



