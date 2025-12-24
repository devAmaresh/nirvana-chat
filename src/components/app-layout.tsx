import { useState, useEffect } from "react"
import { useChatStore } from "@/lib/chat-store"
import { Sidebar } from "@/components/sidebar"
import { ChatWindow } from "@/components/chat-window"
import { ChatInput } from "@/components/chat-input"
import { LandingView } from "@/components/landing-view"
import { ThemeToggle } from "@/components/theme-toggle"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { hydrateFromLocalStorage, error, showLanding } = useChatStore()

  useEffect(() => {
    hydrateFromLocalStorage()
  }, [hydrateFromLocalStorage])

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-black">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between gap-3 border-b border-zinc-200/30 dark:border-zinc-800/30 px-6 pt-4 pb-2 bg-white/60 dark:bg-black/60 backdrop-blur-2xl supports-backdrop-filter:bg-white/40 dark:supports-backdrop-filter:bg-black/40">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="lg:hidden hover:scale-105 rounded-xl" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open sidebar</span>
            </Button>
            <h2 className="text-lg font-black text-zinc-900 dark:text-zinc-100 tracking-tight">Nirvana</h2>
          </div>
          <ThemeToggle />
        </header>

        {/* Error Banner */}
        {error && (
          <div className="bg-red-500/10 border-b border-red-500/20 px-4 py-3">
            <p className="text-sm text-red-500 dark:text-red-400 text-center font-medium">{error}</p>
          </div>
        )}

        {showLanding ? (
          <LandingView />
        ) : (
          <>
            <ChatWindow />
            <ChatInput />
          </>
        )}
      </div>
    </div>
  )
}
