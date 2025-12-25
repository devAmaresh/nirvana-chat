import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { getPersonaById } from "@/lib/personas"
import { useChatStore } from "@/lib/chat-store"
import { ArrowLeft, MoreHorizontal, Clock, MessageSquare, History } from "lucide-react"
import { Button } from "@/components/ui/button"


export function SpaceDetailView() {
  const { personaId } = useParams<{ personaId: string }>()
  const navigate = useNavigate()
  const { getChatsByPersona, deleteChat, createNewChat } = useChatStore()
  const [activeMenu, setActiveMenu] = useState<string | null>(null)

  const persona = personaId ? getPersonaById(personaId) : null
  const chats = personaId ? getChatsByPersona(personaId) : []

  if (!persona) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-black">
        <div className="text-center">
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">Space not found</p>
          <Button 
            onClick={() => navigate('/spaces')} 
            variant="outline"
            className="h-9 text-sm"
          >
            Back to Spaces
          </Button>
        </div>
      </div>
    )
  }

  const handleDeleteChat = (chatId: string) => {
    deleteChat(chatId)
    setActiveMenu(null)
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const month = date.toLocaleDateString('en-US', { month: 'short' })
    const day = date.getDate()
    const year = date.getFullYear()
    return `${month} ${day}, ${year}`
  }

  const getPreview = (chat: any) => {
    if (chat.messages.length === 0) return "No messages yet"
    const lastMessage = chat.messages[chat.messages.length - 1]
    return lastMessage.content.substring(0, 150) + (lastMessage.content.length > 150 ? '...' : '')
  }

  const getUserInitial = () => {
    return "A"
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-zinc-950">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="border-b border-zinc-800 px-6 py-4"
      >
        <div className="max-w-3xl mx-auto">
          <div className="mb-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/spaces')}
              className="gap-2 hover:bg-zinc-900 -ml-3 h-8 text-sm text-zinc-400 hover:text-zinc-100"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Spaces
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-zinc-900 flex items-center justify-center text-2xl shrink-0">
              {persona.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-semibold text-zinc-100">
                {persona.name}
              </h1>
              <p className="text-sm text-zinc-500 mt-0.5 line-clamp-1">
                {persona.description}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Section Header */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="px-6 py-3"
      >
        <div className="max-w-3xl mx-auto flex items-center gap-2">
          <History className="h-4 w-4 text-zinc-500" />
          <h2 className="text-sm font-medium text-zinc-300">
            My threads
          </h2>
        </div>
      </motion.div>

      {/* Threads List */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-4">
          {chats.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="text-center py-20"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-zinc-900 mb-4">
                <MessageSquare className="h-6 w-6 text-zinc-600" />
              </div>
              <p className="text-sm text-zinc-500 mb-4">
                No threads yet in this space
              </p>
              <Button
                onClick={() => {
                  const chatId = createNewChat(persona.id)
                  navigate(`/c/${chatId}`)
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white h-9 text-sm"
              >
                Start a thread
              </Button>
            </motion.div>
          ) : (
            <motion.div 
              variants={container}
              initial="hidden"
              animate="show"
              className="space-y-0"
            >
              {chats
                .sort((a, b) => b.updatedAt - a.updatedAt)
                .map((chat, _index) => (
                  <motion.div
                    key={chat.id}
                    variants={item}
                    className="group relative border-b border-zinc-800/50 last:border-b-0"
                  >
                    <motion.button
                      whileHover={{ backgroundColor: "rgba(24, 24, 27, 0.5)" }}
                      onClick={() => navigate(`/c/${chat.id}`)}
                      className="w-full flex items-start gap-3 px-4 py-4 transition-colors text-left"
                    >
                      {/* Avatar */}
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xs shrink-0 mt-0.5">
                        {getUserInitial()}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <h3 className="text-[15px] font-medium text-zinc-100 line-clamp-1 leading-tight">
                            {chat.title}
                          </h3>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setActiveMenu(activeMenu === chat.id ? null : chat.id)
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-zinc-800 rounded transition-all shrink-0"
                          >
                            <MoreHorizontal className="h-4 w-4 text-zinc-500" />
                          </button>
                        </div>
                        
                        <p className="text-sm text-zinc-500 line-clamp-2 mb-2 leading-relaxed">
                          {getPreview(chat)}
                        </p>
                        
                        <div className="flex items-center gap-1.5 text-xs text-zinc-600">
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(chat.updatedAt)}</span>
                        </div>
                      </div>
                    </motion.button>

                    {/* Delete Menu */}
                    <AnimatePresence>
                      {activeMenu === chat.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-4 top-14 z-10 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl overflow-hidden min-w-[140px]"
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteChat(chat.id)
                            }}
                            className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-red-950/30 transition-colors"
                          >
                            Delete thread
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
