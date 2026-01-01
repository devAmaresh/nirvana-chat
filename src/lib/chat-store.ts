import { create } from "zustand"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { getAllPersonas } from "./personas"

export interface MessageImage {
  data: string // base64 encoded
  mimeType: string
}

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
  images?: MessageImage[]
}

export interface Chat {
  id: string
  title: string
  messages: Message[]
  createdAt: number
  updatedAt: number
  personaId: string
}

interface ChatState {
  chats: Chat[]
  activePersonaId: string
  loading: boolean
  error: string | null
  abortController: AbortController | null
}

interface ChatActions {
  createNewChat: (personaId?: string) => string
  setActivePersona: (personaId: string) => void
  addMessage: (chatId: string, message: Omit<Message, "id" | "timestamp">) => void
  updateLastMessage: (chatId: string, content: string) => void
  appendToLastMessage: (chatId: string, chunk: string) => void
  sendMessage: (chatId: string, prompt: string, images?: MessageImage[]) => Promise<void>
  stopGeneration: () => void
  regenerateLastMessage: (chatId: string) => Promise<void>
  editMessage: (chatId: string, messageId: string, newContent: string, images?: MessageImage[]) => Promise<void>
  deleteChat: (chatId: string) => void
  getChat: (chatId: string) => Chat | undefined
  getChatsByPersona: (personaId: string) => Chat[]
  hydrateFromLocalStorage: () => void
  persistToLocalStorage: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

type ChatStore = ChatState & ChatActions

const STORAGE_KEY = "gemini-chat-storage"
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ""

const generateId = () => Math.random().toString(36).substring(2, 15)

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)

export const useChatStore = create<ChatStore>((set, get) => ({
  chats: [],
  activePersonaId: "general",
  loading: false,
  error: null,
  abortController: null,

  createNewChat: (personaId?: string) => {
    const newChat: Chat = {
      id: generateId(),
      title: "New Chat",
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      personaId: personaId || get().activePersonaId,
    }
    set((state) => ({
      chats: [newChat, ...state.chats],
    }))
    get().persistToLocalStorage()
    return newChat.id
  },

  setActivePersona: (personaId: string) => {
    set({ activePersonaId: personaId })
  },

  getChat: (chatId: string) => {
    return get().chats.find(c => c.id === chatId)
  },

  getChatsByPersona: (personaId: string) => {
    return get().chats.filter(c => c.personaId === personaId)
  },

  addMessage: (chatId: string, message: Omit<Message, "id" | "timestamp">) => {
    const newMessage: Message = {
      ...message,
      id: generateId(),
      timestamp: Date.now(),
    }
    set((state) => ({
      chats: state.chats.map((chat) => {
        if (chat.id === chatId) {
          const updatedMessages = [...chat.messages, newMessage]
          const title =
            chat.messages.length === 0 && message.role === "user"
              ? message.content.slice(0, 40) + (message.content.length > 40 ? "..." : "")
              : chat.title
          return {
            ...chat,
            messages: updatedMessages,
            title,
            updatedAt: Date.now(),
          }
        }
        return chat
      }),
    }))
    get().persistToLocalStorage()
  },

  updateLastMessage: (chatId: string, content: string) => {
    set((state) => ({
      chats: state.chats.map((chat) => {
        if (chat.id === chatId && chat.messages.length > 0) {
          const messages = [...chat.messages]
          const lastMessage = messages[messages.length - 1]
          if (lastMessage.role === "assistant") {
            messages[messages.length - 1] = { ...lastMessage, content }
          }
          return { ...chat, messages, updatedAt: Date.now() }
        }
        return chat
      }),
    }))
    get().persistToLocalStorage()
  },

  appendToLastMessage: (chatId: string, chunk: string) => {
    set((state) => ({
      chats: state.chats.map((chat) => {
        if (chat.id === chatId && chat.messages.length > 0) {
          const messages = [...chat.messages]
          const lastMessage = messages[messages.length - 1]
          if (lastMessage.role === "assistant") {
            messages[messages.length - 1] = {
              ...lastMessage,
              content: lastMessage.content + chunk,
            }
          }
          return { ...chat, messages, updatedAt: Date.now() }
        }
        return chat
      }),
    }))
  },

  sendMessage: async (chatId: string, prompt: string, images?: MessageImage[]) => {
    const { addMessage, appendToLastMessage, setLoading, setError, persistToLocalStorage } = get()

    const chat = get().chats.find((c) => c.id === chatId)
    if (!chat) throw new Error("Chat not found")

    setError(null)
    addMessage(chatId, { role: "user", content: prompt, images })
    addMessage(chatId, { role: "assistant", content: "" })
    setLoading(true)

    const abortController = new AbortController()
    set({ abortController })

    try {
      const personas = getAllPersonas()
      const persona = personas.find(p => p.id === chat.personaId) || personas[0]

      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        systemInstruction: persona.systemPrompt
      })

      const history = chat.messages
        .filter((m) => m.content.trim() !== "")
        .slice(0, -2)
        .map((m) => {
          const parts: any[] = [{ text: m.content }]
          if (m.images && m.images.length > 0) {
            m.images.forEach(img => {
              parts.push({
                inlineData: {
                  data: img.data,
                  mimeType: img.mimeType
                }
              })
            })
          }
          return {
            role: m.role === "user" ? "user" : "model",
            parts
          }
        })

      const chatSession = model.startChat({ history })

      // Prepare message parts with images
      const messageParts: any[] = [{ text: prompt }]
      if (images && images.length > 0) {
        images.forEach(img => {
          messageParts.push({
            inlineData: {
              data: img.data,
              mimeType: img.mimeType
            }
          })
        })
      }

      const result = await chatSession.sendMessageStream(messageParts, {
        signal: abortController.signal
      })

      for await (const chunk of result.stream) {
        if (abortController.signal.aborted) break
        const chunkText = chunk.text()
        if (chunkText) {
          appendToLastMessage(chatId, chunkText)
        }
      }

      persistToLocalStorage()
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        const currentContent = get().chats.find((c) => c.id === chatId)?.messages.slice(-1)[0]?.content || ""
        get().updateLastMessage(chatId, currentContent + "\n\n[Generation stopped by user]")
      } else {
        const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
        setError(errorMessage)
        get().updateLastMessage(chatId, `Error: ${errorMessage}`)
      }
    } finally {
      setLoading(false)
      set({ abortController: null })
    }
  },

  stopGeneration: () => {
    const { abortController } = get()
    if (abortController) {
      abortController.abort()
      set({ loading: false, abortController: null })
    }
  },

  regenerateLastMessage: async (chatId: string) => {
    const { chats, loading } = get()
    if (loading) return

    const chat = chats.find(c => c.id === chatId)
    if (!chat || chat.messages.length < 2) return

    // Find last user message
    let lastUserMessage = null
    for (let i = chat.messages.length - 1; i >= 0; i--) {
      if (chat.messages[i].role === 'user') {
        lastUserMessage = chat.messages[i]
        break
      }
    }

    if (!lastUserMessage) return

    // Remove all messages after the last user message
    set((state) => ({
      chats: state.chats.map((c) => {
        if (c.id === chatId) {
          const messages = [...c.messages]
          const lastUserIndex = messages.lastIndexOf(lastUserMessage)
          return {
            ...c,
            messages: messages.slice(0, lastUserIndex + 1),
            updatedAt: Date.now()
          }
        }
        return c
      }),
    }))

    get().persistToLocalStorage()

    // Generate new response
    const updatedChat = get().chats.find((c) => c.id === chatId)
    if (!updatedChat) return

    get().addMessage(chatId, { role: "assistant", content: "" })
    get().setLoading(true)

    const abortController = new AbortController()
    set({ abortController })

    try {
      const personas = getAllPersonas()
      const persona = personas.find(p => p.id === updatedChat.personaId) || personas[0]

      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        systemInstruction: persona.systemPrompt
      })

      const history = updatedChat.messages
        .slice(0, -1)
        .filter((m) => m.content.trim() !== "")
        .map((m) => {
          const parts: any[] = [{ text: m.content }]
          if (m.images && m.images.length > 0) {
            m.images.forEach(img => {
              parts.push({
                inlineData: {
                  data: img.data,
                  mimeType: img.mimeType
                }
              })
            })
          }
          return {
            role: m.role === "user" ? "user" : "model",
            parts
          }
        })

      const chatSession = model.startChat({ history })

      // Prepare message parts with images
      const messageParts: any[] = [{ text: lastUserMessage.content }]
      if (lastUserMessage.images && lastUserMessage.images.length > 0) {
        lastUserMessage.images.forEach(img => {
          messageParts.push({
            inlineData: {
              data: img.data,
              mimeType: img.mimeType
            }
          })
        })
      }

      const result = await chatSession.sendMessageStream(messageParts, {
        signal: abortController.signal
      })

      for await (const chunk of result.stream) {
        if (abortController.signal.aborted) break
        const chunkText = chunk.text()
        if (chunkText) {
          get().appendToLastMessage(chatId, chunkText)
        }
      }

      get().persistToLocalStorage()
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        const currentContent = get().chats.find((c) => c.id === chatId)?.messages.slice(-1)[0]?.content || ""
        get().updateLastMessage(chatId, currentContent + "\n\n[Generation stopped by user]")
      } else {
        const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
        get().setError(errorMessage)
        get().updateLastMessage(chatId, `Error: ${errorMessage}`)
      }
    } finally {
      get().setLoading(false)
      set({ abortController: null })
    }
  },

  editMessage: async (chatId: string, messageId: string, newContent: string, images?: MessageImage[]) => {
    const { chats, loading } = get()
    
    if (loading) return
    
    const chat = chats.find(c => c.id === chatId)
    if (!chat) return

    const messageIndex = chat.messages.findIndex(m => m.id === messageId)
    if (messageIndex === -1 || chat.messages[messageIndex].role !== 'user') return

    // Update message and remove everything after it
    set((state) => ({
      chats: state.chats.map((c) => {
        if (c.id === chatId) {
          const messages = [...c.messages]
          messages[messageIndex] = { ...messages[messageIndex], content: newContent, images }
          return {
            ...c,
            messages: messages.slice(0, messageIndex + 1),
            updatedAt: Date.now()
          }
        }
        return c
      }),
    }))

    get().persistToLocalStorage()

    // Generate new response
    const updatedChat = get().chats.find((c) => c.id === chatId)
    if (!updatedChat) return

    get().addMessage(chatId, { role: "assistant", content: "" })
    get().setLoading(true)

    const abortController = new AbortController()
    set({ abortController })

    try {
      const personas = getAllPersonas()
      const persona = personas.find(p => p.id === updatedChat.personaId) || personas[0]

      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        systemInstruction: persona.systemPrompt
      })

      const history = updatedChat.messages
        .slice(0, -1)
        .filter((m) => m.content.trim() !== "")
        .map((m) => {
          const parts: any[] = [{ text: m.content }]
          if (m.images && m.images.length > 0) {
            m.images.forEach(img => {
              parts.push({
                inlineData: {
                  data: img.data,
                  mimeType: img.mimeType
                }
              })
            })
          }
          return {
            role: m.role === "user" ? "user" : "model",
            parts
          }
        })

      const chatSession = model.startChat({ history })

      // Prepare message parts with images
      const messageParts: any[] = [{ text: newContent }]
      if (images && images.length > 0) {
        images.forEach(img => {
          messageParts.push({
            inlineData: {
              data: img.data,
              mimeType: img.mimeType
            }
          })
        })
      }

      const result = await chatSession.sendMessageStream(messageParts, {
        signal: abortController.signal
      })

      for await (const chunk of result.stream) {
        if (abortController.signal.aborted) break
        const chunkText = chunk.text()
        if (chunkText) {
          get().appendToLastMessage(chatId, chunkText)
        }
      }

      get().persistToLocalStorage()
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        const currentContent = get().chats.find((c) => c.id === chatId)?.messages.slice(-1)[0]?.content || ""
        get().updateLastMessage(chatId, currentContent + "\n\n[Generation stopped by user]")
      } else {
        const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
        get().setError(errorMessage)
        get().updateLastMessage(chatId, `Error: ${errorMessage}`)
      }
    } finally {
      get().setLoading(false)
      set({ abortController: null })
    }
  },

  deleteChat: (chatId: string) => {
    set((state) => ({
      chats: state.chats.filter((c) => c.id !== chatId),
    }))
    get().persistToLocalStorage()
  },

  hydrateFromLocalStorage: () => {
    if (typeof window === "undefined") return
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const data = JSON.parse(stored)
        const chats = (data.chats || []).map((chat: any) => ({
          ...chat,
          personaId: chat.personaId || 'general'
        }))
        set({ chats })
      }
    } catch (error) {
      console.error("Failed to hydrate from localStorage:", error)
    }
  },

  persistToLocalStorage: () => {
    if (typeof window === "undefined") return
    try {
      const { chats } = get()
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ chats }))
    } catch (error) {
      console.error("Failed to persist to localStorage:", error)
    }
  },

  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error }),
}))
