import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Plus, Sparkles, Save, Copy } from "lucide-react"
import { addCustomPersona, updatePersona, getPersonaById } from "@/lib/personas"

interface CreatePersonaModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPersonaCreated?: (personaId: string) => void
  editPersonaId?: string | null
  templatePersonaId?: string | null
}

const emojiOptions = ["🤖", "💻", "🏗️", "🔍", "📄", "🎨", "⚙️", "🚀", "💡", "🎯", "🔥", "⭐", "✨", "🌟", "💫", "🎪", "🎭", "🎬", "🎤", "🎧"]

export function CreatePersonaModal({ open, onOpenChange, onPersonaCreated, editPersonaId, templatePersonaId }: CreatePersonaModalProps) {
  const [name, setName] = useState("")
  const [emoji, setEmoji] = useState("🤖")
  const [description, setDescription] = useState("")
  const [systemPrompt, setSystemPrompt] = useState("")

  const isEditing = !!editPersonaId
  const isTemplate = !!templatePersonaId

  // Load persona data when editing or using template
  useEffect(() => {
    if (editPersonaId) {
      const persona = getPersonaById(editPersonaId)
      if (persona) {
        setName(persona.name)
        setEmoji(persona.emoji)
        setDescription(persona.description)
        setSystemPrompt(persona.systemPrompt)
      }
    } else if (templatePersonaId) {
      const persona = getPersonaById(templatePersonaId)
      if (persona) {
        setName(persona.name)
        setEmoji(persona.emoji)
        setDescription(persona.description)
        setSystemPrompt(persona.systemPrompt)
      }
    } else {
      // Reset form for new persona
      setName("")
      setEmoji("🤖")
      setDescription("")
      setSystemPrompt("")
    }
  }, [editPersonaId, templatePersonaId, open])

  const handleSubmit = () => {
    if (!name.trim() || !systemPrompt.trim()) return

    if (isEditing && editPersonaId) {
      // Update existing persona
      updatePersona(editPersonaId, {
        name: name.trim(),
        emoji,
        description: description.trim() || `Custom ${name} assistant`,
        systemPrompt: systemPrompt.trim(),
      })

      if (onPersonaCreated) {
        onPersonaCreated(editPersonaId)
      }
    } else {
      // Create new persona (from scratch or template)
      const newPersona = addCustomPersona({
        name: name.trim(),
        emoji,
        description: description.trim() || `Custom ${name} assistant`,
        systemPrompt: systemPrompt.trim(),
        id: "custom-" + `custom-${Date.now().toString()+ Math.random().toString(36).substring(2, 8)}`
      })
      
      if (onPersonaCreated) {
        onPersonaCreated(newPersona.id)
      }
    }

    // Reset form
    setName("")
    setEmoji("🤖")
    setDescription("")
    setSystemPrompt("")
    
    onOpenChange(false)
  }

  const getTitle = () => {
    if (isEditing) return 'Edit Space'
    if (isTemplate) return 'Customize Template'
    return 'Create Custom Space'
  }

  const getDescription = () => {
    if (isEditing) return 'Update your AI assistant settings'
    if (isTemplate) return 'Customize this template to create your own space'
    return 'Design your own AI assistant with custom instructions and personality'
  }

  const getIcon = () => {
    if (isEditing) return <Save className="h-6 w-6 text-emerald-500" />
    if (isTemplate) return <Copy className="h-6 w-6 text-emerald-500" />
    return <Sparkles className="h-6 w-6 text-emerald-500" />
  }

  const getButtonText = () => {
    if (isEditing) return 'Save Changes'
    if (isTemplate) return 'Create from Template'
    return 'Create Space'
  }

  const getButtonIcon = () => {
    if (isEditing) return <Save className="h-4 w-4" />
    if (isTemplate) return <Copy className="h-4 w-4" />
    return <Plus className="h-4 w-4" />
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col bg-white dark:bg-zinc-900">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center gap-2">
            {getIcon()}
            <DialogTitle>{getTitle()}</DialogTitle>
          </div>
          <DialogDescription>
            {getDescription()}
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 px-2 bg-white dark:bg-zinc-900">
          <div className="space-y-5 mt-4">
            <div>
              <label className="block text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                Space Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Python Expert, Marketing Guru"
                className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                Choose Icon
              </label>
              <div className="grid grid-cols-10 gap-2">
                {emojiOptions.map((emojiOption) => (
                  <button
                    key={emojiOption}
                    type="button"
                    onClick={() => setEmoji(emojiOption)}
                    className={`text-lg hover:cursor-pointer py-1 rounded-lg transition-all hover:scale-110 ${
                      emoji === emojiOption
                        ? "bg-emerald-500/20 ring-2 ring-emerald-500/50"
                        : "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                    }`}
                  >
                    {emojiOption}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this space"
                className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                System Instructions <span className="text-red-400">*</span>
              </label>
              <textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="You are a [role]. You help users with [task]. Your responses should be [style]..."
                rows={8}
                className="w-full px-4 py-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
              />
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Define how this AI should behave, its expertise, and response style
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex-shrink-0 bg-white dark:bg-zinc-900">
          <Button
            onClick={handleSubmit}
            disabled={!name.trim() || !systemPrompt.trim()}
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white gap-2 h-10"
          >
            {getButtonIcon()}
            {getButtonText()}
          </Button>
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="px-6 h-10"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
