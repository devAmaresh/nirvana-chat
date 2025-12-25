import { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useChatStore } from "@/lib/chat-store"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Search, MessageSquare, Calendar, Clock } from "lucide-react"

interface SearchModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const { chats } = useChatStore()
  const navigate = useNavigate()

  /* ---------------------------------------------
     1. GROUP ALL CHATS BY DATE
  ---------------------------------------------- */
  const groupedChats = useMemo(() => {
    const today: typeof chats = []
    const yesterday: typeof chats = []
    const older: typeof chats = []

    const now = new Date()
    const y = new Date(now)
    y.setDate(y.getDate() - 1)

    chats.forEach(chat => {
      const d = new Date(chat.updatedAt)
      if (d.toDateString() === now.toDateString()) today.push(chat)
      else if (d.toDateString() === y.toDateString()) yesterday.push(chat)
      else older.push(chat)
    })

    return { today, yesterday, older }
  }, [chats])

  /* ---------------------------------------------
     2. APPLY SEARCH OR LIMIT
  ---------------------------------------------- */
  const displayGroups = useMemo(() => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return {
        today: groupedChats.today.filter(c => c.title.toLowerCase().includes(q)),
        yesterday: groupedChats.yesterday.filter(c => c.title.toLowerCase().includes(q)),
        older: groupedChats.older.filter(c => c.title.toLowerCase().includes(q)),
      }
    }

    // No search → show recent (limit per group)
    return {
      today: groupedChats.today.slice(0, 2),
      yesterday: groupedChats.yesterday.slice(0, 2),
      older: groupedChats.older.slice(0, 1),
    }
  }, [searchQuery, groupedChats])

  const hasResults =
    displayGroups.today.length > 0 ||
    displayGroups.yesterday.length > 0 ||
    displayGroups.older.length > 0

  const handleSelectChat = (chatId: string) => {
    navigate(`/c/${chatId}`)
    onOpenChange(false)
    setSearchQuery("")
  }

  useEffect(() => {
    if (!open) setSearchQuery("")
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
        <DialogHeader className="px-4 pt-4 pb-0">
          <DialogTitle className="sr-only">Search chats</DialogTitle>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chats..."
              autoFocus
              className="h-12 pl-10 pr-4 text-base border-0 border-b border-zinc-200 dark:border-zinc-800 rounded-none focus-visible:ring-0 bg-transparent"
            />
          </div>
        </DialogHeader>

        <div className="max-h-[420px] overflow-y-auto p-2">
          {chats.length === 0 ? (
            <EmptyState
              icon={<MessageSquare />}
              title="No chats yet"
              subtitle="Start a conversation to see it here"
            />
          ) : !hasResults ? (
            <EmptyState
              icon={<Search />}
              title="No results found"
              subtitle="Try searching with different keywords"
            />
          ) : (
            <div className="space-y-4">
              {!searchQuery && (
                <SectionLabel icon={<Clock className="h-3 w-3" />} label="Recent Chats" />
              )}

              <ChatSection
                label="Today"
                chats={displayGroups.today}
                onSelect={handleSelectChat}
              />

              <ChatSection
                label="Yesterday"
                chats={displayGroups.yesterday}
                onSelect={handleSelectChat}
              />

              <ChatSection
                label="Older"
                chats={displayGroups.older}
                onSelect={handleSelectChat}
                showDate
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* ---------------------------------------------
   REUSABLE UI COMPONENTS
---------------------------------------------- */

function SectionLabel({
  icon,
  label,
}: {
  icon: React.ReactNode
  label: string
}) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
      {icon}
      {label}
    </div>
  )
}

function ChatSection({
  label,
  chats,
  onSelect,
  showDate,
}: {
  label: string
  chats: any[]
  onSelect: (id: string) => void
  showDate?: boolean
}) {
  if (chats.length === 0) return null

  return (
    <div>
      <SectionLabel icon={<Calendar className="h-3 w-3" />} label={label} />
      <div className="space-y-1">
        {chats.map(chat => (
          <button
            key={chat.id}
            onClick={() => onSelect(chat.id)}
            className="w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {chat.title}
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">
                {showDate
                  ? new Date(chat.updatedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : new Date(chat.updatedAt).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function EmptyState({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center px-4">
      <div className="mb-3 flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 h-12 w-12">
        {icon}
      </div>
      <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
        {title}
      </p>
      <p className="text-xs text-zinc-500 mt-1">
        {subtitle}
      </p>
    </div>
  )
}
