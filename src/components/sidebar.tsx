import type React from "react"
import { useChatStore } from "@/lib/chat-store"
import { cn } from "@/lib/utils"
import { Plus, MessageSquare, Trash2, X, Sparkles, Heart } from "lucide-react"

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { chats, activeChatId, showLandingView, setActiveChat, deleteChat, showLanding } = useChatStore()

  const handleNewChat = () => {
    showLandingView()
    onClose()
  }

  const handleSelectChat = (id: string) => {
    setActiveChat(id)
    onClose()
  }

  const handleDeleteChat = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    deleteChat(id)
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden" onClick={onClose} />}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-full w-64 flex-col bg-zinc-50 dark:bg-zinc-900 backdrop-blur-xl supports-[backdrop-filter]:bg-zinc-50/90 dark:supports-[backdrop-filter]:bg-zinc-900/90 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-3">
          
            <span className="text-xl font-black text-zinc-900 dark:text-zinc-100">Nirvana</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-zinc-500 dark:text-zinc-400 transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 hover:scale-110 lg:hidden"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close sidebar</span>
          </button>
        </div>

        {/* New Chat Button */}
        <div className="px-4 pb-4">
          <button
            onClick={handleNewChat}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-lg bg-blue-500/80 px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-blue-500/90 hover:shadow-xl",
            )}
          >
            <Plus className="h-5 w-5" strokeWidth={2.5} />
            New Chat
          </button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1">
          {chats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100/20 dark:bg-zinc-800/20 ring-1 ring-zinc-200/30 dark:ring-zinc-800/30">
                <MessageSquare className="h-7 w-7 text-zinc-500/50 dark:text-zinc-400/50" strokeWidth={2} />
              </div>
              <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400">No chats yet</p>
              <p className="text-xs text-zinc-500/50 dark:text-zinc-400/50 mt-1">Start a conversation</p>
            </div>
          ) : (
            <>
              {chats.map((chat, index) => (
                <button
                  key={chat.id}
                  onClick={() => handleSelectChat(chat.id)}
                  style={{ animationDelay: `${index * 50}ms` }}
                  className={cn(
                    "animate-fade-in-up group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all",
                    activeChatId === chat.id && !showLanding
                      ? "bg-zinc-100/80 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 shadow-lg ring-1 ring-blue-500/20"
                      : "text-zinc-900/80 dark:text-zinc-100/80 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100 hover:shadow-md",
                  )}
                >
                  <MessageSquare className="h-4 w-4 shrink-0 opacity-50" strokeWidth={2} />
                  <span className="flex-1 truncate text-sm font-semibold">{chat.title}</span>
                  <button
                    onClick={(e) => handleDeleteChat(e, chat.id)}
                    className="rounded-xl p-1.5 opacity-0 transition-all hover:bg-red-500/20 hover:text-red-500 dark:hover:text-red-400 group-hover:opacity-100 hover:scale-110"
                    aria-label="Delete chat"
                  >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={2.5} />
                  </button>
                </button>
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-6 border-zinc-200 dark:border-zinc-800">
          <p className="text-center text-xs text-muted-foreground/60">
            Powered by{"  "}
           AI
          </p>
        </div>
      </aside>
    </>
  )
}
