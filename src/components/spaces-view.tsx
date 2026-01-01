import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { getAllPersonas, deletePersona, encodePersonaToUrl } from "@/lib/personas"
import { useChatStore } from "@/lib/store/chat-store"
import { Search, Plus, Clock, Pencil, Trash2, MoreHorizontal, Share2, Check, AlertTriangle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CreatePersonaModal } from "@/components/create-persona-modal"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function SpacesView() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingPersona, setEditingPersona] = useState<string | null>(null)
  const [templatePersona, setTemplatePersona] = useState<string | null>(null)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [copiedPersonaId, setCopiedPersonaId] = useState<string | null>(null)
  const [deletingPersona, setDeletingPersona] = useState<{ id: string; name: string } | null>(null)
  const navigate = useNavigate()
  const { getChatsByPersona } = useChatStore()

  const allPersonas = getAllPersonas()
  
  const filteredPersonas = allPersonas.filter(persona => {
    if (persona.id === 'general') return false
    const matchesSearch = persona.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         persona.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const handlePersonaClick = (personaId: string) => {
    navigate(`/spaces/${personaId}`)
  }

  const handleTemplateClick = (personaId: string) => {
    setTemplatePersona(personaId)
  }

  const handleEditPersona = (e: React.MouseEvent, personaId: string) => {
    e.stopPropagation()
    setEditingPersona(personaId)
    setActiveMenu(null)
  }

  const handleDeletePersona = (e: React.MouseEvent, personaId: string) => {
    e.stopPropagation()
    const persona = allPersonas.find(p => p.id === personaId)
    if (persona) {
      setDeletingPersona({ id: personaId, name: persona.name })
      setActiveMenu(null)
    }
  }

  const confirmDelete = () => {
    if (deletingPersona) {
      deletePersona(deletingPersona.id)
      setDeletingPersona(null)
    }
  }

  const handleSharePersona = async (e: React.MouseEvent, personaId: string) => {
    e.stopPropagation()
    const persona = allPersonas.find(p => p.id === personaId)
    if (!persona) return

    const encoded = encodePersonaToUrl(persona)
    const shareUrl = `${window.location.origin}/spaces/create?data=${encoded}`
    
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopiedPersonaId(personaId)
      setActiveMenu(null)
      
      setTimeout(() => {
        setCopiedPersonaId(null)
      }, 2000)
    } catch (error) {
      console.error('Failed to copy link:', error)
    }
  }

  const getLastUsed = (personaId: string) => {
    const chats = getChatsByPersona(personaId)
    if (chats.length === 0) return null
    const latest = chats.reduce((latest, chat) => 
      chat.updatedAt > latest.updatedAt ? chat : latest
    )
    return new Date(latest.updatedAt)
  }

  const formatDate = (date: Date | null) => {
    if (!date) return "Never"
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const months = Math.floor(days / 30)

    if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
    return "Today"
  }

  const userSpaces = filteredPersonas.filter(p => p.isCustom || p.id.startsWith('custom-'))
  const templateSpaces = filteredPersonas.filter(p => !p.isCustom && !p.id.startsWith('custom-'))

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className="flex-1 overflow-y-auto bg-white dark:bg-zinc-950">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                Spaces
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Create and manage your AI assistants
              </p>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white gap-2 h-9 text-sm"
            >
              <Plus className="h-4 w-4" />
              New Space
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search spaces..."
              className="w-full pl-10 pr-10 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
              >
                <X className="h-3.5 w-3.5 text-zinc-400" />
              </button>
            )}
          </div>
        </motion.div>

        {userSpaces.length > 0 && (
          <div className="mb-10">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3 px-1">
              My Spaces {searchQuery && `(${userSpaces.length})`}
            </h2>
            <motion.div 
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
            >
              {userSpaces.map((persona) => {
                const chatCount = getChatsByPersona(persona.id).length
                const lastUsed = getLastUsed(persona.id)
                const isCopied = copiedPersonaId === persona.id
                
                return (
                  <motion.div
                    key={persona.id}
                    variants={item}
                    className="group relative"
                  >
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handlePersonaClick(persona.id)}
                      className="w-full bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 text-left"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xl">
                          {persona.emoji || "✏️"}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setActiveMenu(activeMenu === persona.id ? null : persona.id)
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-all"
                        >
                          <MoreHorizontal className="h-4 w-4 text-zinc-400" />
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1">
                          {persona.name}
                        </h3>
                        
                        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatDate(lastUsed)}</span>
                          </div>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <span>{chatCount} chat{chatCount !== 1 ? 's' : ''}</span>
                          </div>
                        </div>
                      </div>
                    </motion.button>

                    {isCopied && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-emerald-500 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5 whitespace-nowrap z-20"
                      >
                        <Check className="h-3 w-3" />
                        Link copied!
                      </motion.div>
                    )}

                    {activeMenu === persona.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="absolute right-4 top-14 z-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg overflow-hidden min-w-[140px]"
                      >
                        <button
                          onClick={(e) => handleSharePersona(e, persona.id)}
                          className="w-full px-3 py-2 text-left text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2"
                        >
                          <Share2 className="h-3.5 w-3.5" />
                          Share
                        </button>
                        <button
                          onClick={(e) => handleEditPersona(e, persona.id)}
                          className="w-full px-3 py-2 text-left text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={(e) => handleDeletePersona(e, persona.id)}
                          className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </motion.div>
                    )}
                  </motion.div>
                )
              })}
            </motion.div>
          </div>
        )}

        {templateSpaces.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3 px-1">
              Templates {searchQuery && `(${templateSpaces.length})`}
            </h2>
            <motion.div 
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
            >
              {templateSpaces.map((persona) => {
                return (
                  <motion.button
                    key={persona.id}
                    variants={item}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleTemplateClick(persona.id)}
                    className="group relative bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 hover:shadow-md hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all duration-200 text-left"
                  >
                    <div className="mb-3">
                      <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xl">
                        {persona.emoji}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1">
                        {persona.name}
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                        {persona.description}
                      </p>
                    </div>

                    <div className="mt-3 text-xs text-emerald-600 dark:text-emerald-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Click to customize →
                    </div>
                  </motion.button>
                )
              })}
            </motion.div>
          </div>
        )}

        {filteredPersonas.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="text-center py-20"
          >
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-zinc-100 dark:bg-zinc-900 mb-4">
              <Search className="h-6 w-6 text-zinc-400" />
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
              {searchQuery ? `No spaces found matching "${searchQuery}"` : "No spaces yet. Create your first space!"}
            </p>
            {searchQuery ? (
              <Button
                onClick={() => setSearchQuery("")}
                variant="outline"
                className="gap-2 h-9 text-sm"
              >
                Clear Search
              </Button>
            ) : (
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-emerald-500 hover:bg-emerald-600 text-white gap-2 h-9 text-sm"
              >
                <Plus className="h-4 w-4" />
                Create Space
              </Button>
            )}
          </motion.div>
        )}
      </div>

      <CreatePersonaModal
        open={showCreateModal || editingPersona !== null || templatePersona !== null}
        onOpenChange={(open) => {
          if (!open) {
            setShowCreateModal(false)
            setEditingPersona(null)
            setTemplatePersona(null)
          }
        }}
        editPersonaId={editingPersona}
        templatePersonaId={templatePersona}
        onPersonaCreated={(personaId) => {
          setShowCreateModal(false)
          setEditingPersona(null)
          setTemplatePersona(null)
          navigate(`/spaces/${personaId}`)
        }}
      />

      <AlertDialog open={!!deletingPersona} onOpenChange={(open) => !open && setDeletingPersona(null)}>
        <AlertDialogContent className="bg-white dark:bg-zinc-900">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Delete Space?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-semibold text-zinc-900 dark:text-zinc-100">"{deletingPersona?.name}"</span>? This will permanently remove the space and all associated chats. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600 focus:ring-red-500"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
