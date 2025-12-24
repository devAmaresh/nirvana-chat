import { create } from "zustand"
import { GoogleGenerativeAI } from "@google/generative-ai"

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
}

export interface Chat {
  id: string
  title: string
  messages: Message[]
  createdAt: number
  updatedAt: number
}

interface ChatState {
  chats: Chat[]
  activeChatId: string | null
  loading: boolean
  error: string | null
  showLanding: boolean
}

interface ChatActions {
  createNewChat: () => string
  setActiveChat: (id: string) => void
  addMessage: (chatId: string, message: Omit<Message, "id" | "timestamp">) => void
  updateLastMessage: (chatId: string, content: string) => void
  appendToLastMessage: (chatId: string, chunk: string) => void
  sendMessage: (prompt: string) => Promise<void>
  deleteChat: (chatId: string) => void
  hydrateFromLocalStorage: () => void
  persistToLocalStorage: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  showLandingView: () => void
  hideLandingView: () => void
}

type ChatStore = ChatState & ChatActions

const STORAGE_KEY = "gemini-chat-storage"
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ""

const generateId = () => Math.random().toString(36).substring(2, 15)

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)

export const useChatStore = create<ChatStore>((set, get) => ({
  chats: [],
  activeChatId: null,
  loading: false,
  error: null,
  showLanding: true,

  createNewChat: () => {
    const newChat: Chat = {
      id: generateId(),
      title: "New Chat",
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    set((state) => ({
      chats: [newChat, ...state.chats],
      activeChatId: newChat.id,
      showLanding: false,
    }))
    get().persistToLocalStorage()
    return newChat.id
  },

  setActiveChat: (id: string) => {
    set({ activeChatId: id, error: null, showLanding: false })
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

  sendMessage: async (prompt: string) => {
    const {
      activeChatId,
      addMessage,
      appendToLastMessage,
      setLoading,
      setError,
      createNewChat,
      showLanding,
      persistToLocalStorage,
    } = get()

    let chatId = activeChatId
    if (!chatId || showLanding) {
      chatId = createNewChat()
    }

    setError(null)
    addMessage(chatId, { role: "user", content: prompt })
    addMessage(chatId, { role: "assistant", content: "" })
    setLoading(true)

    try {
      const chat = get().chats.find((c) => c.id === chatId)
      if (!chat) throw new Error("Chat not found")

      // Initialize the model
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

      // Build conversation history for chat context
      const history = chat.messages
        .filter((m) => m.content.trim() !== "" && m.role !== "assistant" || m.content.trim() !== "")
        .slice(0, -2) // Exclude the current user message and empty assistant message
        .map((m) => ({
          role: m.role === "user" ? "user" : "model",
          parts: [{ text: m.content }],
        }))

      // Start chat with history
      const chatSession = model.startChat({
        history: history,
      })

      // Stream the response
      const result = await chatSession.sendMessageStream(prompt)

      for await (const chunk of result.stream) {
        const chunkText = chunk.text()
        if (chunkText) {
          appendToLastMessage(chatId, chunkText)
        }
      }

      persistToLocalStorage()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
      setError(errorMessage)
      get().updateLastMessage(chatId, `Error: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  },

  deleteChat: (chatId: string) => {
    set((state) => {
      const newChats = state.chats.filter((c) => c.id !== chatId)
      const newActiveChatId =
        state.activeChatId === chatId ? (newChats.length > 0 ? newChats[0].id : null) : state.activeChatId
      return {
        chats: newChats,
        activeChatId: newActiveChatId,
        showLanding: newChats.length === 0 || (state.activeChatId === chatId && newChats.length === 0),
      }
    })
    get().persistToLocalStorage()
  },

  hydrateFromLocalStorage: () => {
    if (typeof window === "undefined") return
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const data = JSON.parse(stored)
        set({
          chats: data.chats || [],
          activeChatId: data.activeChatId || null,
          showLanding: true,
        })
      }
    } catch (error) {
      console.error("Failed to hydrate from localStorage:", error)
    }
  },

  persistToLocalStorage: () => {
    if (typeof window === "undefined") return
    try {
      const { chats, activeChatId } = get()
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ chats, activeChatId }))
    } catch (error) {
      console.error("Failed to persist to localStorage:", error)
    }
  },

  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error }),
  showLandingView: () => set({ showLanding: true, activeChatId: null }),
  hideLandingView: () => set({ showLanding: false }),
}))
