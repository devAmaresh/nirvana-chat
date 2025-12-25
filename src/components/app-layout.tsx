import { useState, useEffect } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { useChatStore } from "@/lib/chat-store"
import { Sidebar } from "@/components/sidebar"
import { ChatWindow } from "@/components/chat-window"
import { ChatInput } from "@/components/chat-input"
import { ThemeToggle } from "@/components/theme-toggle"
import { SpacesView } from "@/components/spaces-view"
import { SpaceDetailView } from "@/components/space-detail-view"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LandingView } from "./landing-view"


export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { hydrateFromLocalStorage, error, getChat, chats } = useChatStore()
  const { chatId, personaId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()


  useEffect(() => {
    hydrateFromLocalStorage()
  }, [hydrateFromLocalStorage])


  // Validate chat exists, redirect if not
  useEffect(() => {
    if (chatId && chats.length > 0) {
      const chat = getChat(chatId)
      if (!chat) {
        navigate('/', { replace: true })
      }
    }
  }, [chatId, chats, getChat, navigate])


  // Determine which view to show
  const renderContent = () => {
    if (location.pathname === '/spaces') {
      return <SpacesView />
    }
    
    if (location.pathname.startsWith('/spaces/') && personaId) {
      return <SpaceDetailView />
    }
    
    if (chatId) {
      return (
        <>
          <ChatWindow chatId={chatId} />
          <ChatInput chatId={chatId} />
        </>
      )
    }
    
    return <LandingView />
  }


  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-black">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />


      <div className="flex flex-1 flex-col min-w-0">
        {/* Header */}
        <header className="flex-shrink-0 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-3xl">
          <div className="flex items-center justify-between px-4 py-2">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <h2 className="text-lg font-black bg-gradient-to-r from-emerald-600 to-green-600 dark:from-emerald-400 dark:to-green-400 bg-clip-text text-transparent tracking-tight">
                Nirvana
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
            </div>
          </div>
        </header>


        {/* Error Banner */}
        {error && (
          <div className="bg-red-500/10 border-b border-red-500/20 px-4 py-3">
            <p className="text-sm text-red-500 dark:text-red-400 text-center font-medium">{error}</p>
          </div>
        )}


        {/* Main Content */}
        {renderContent()}
      </div>
    </div>
  )
}
