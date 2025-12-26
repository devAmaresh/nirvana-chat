export interface Persona {
  id: string
  name: string
  emoji: string
  systemPrompt: string
  description: string
  isCustom?: boolean
}

const CUSTOM_PERSONAS_KEY = "custom-personas"
const CHATS_STORAGE_KEY = "gemini-chat-storage"

// Load custom personas from localStorage
const loadCustomPersonas = (): Persona[] => {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(CUSTOM_PERSONAS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

// Save custom personas to localStorage
const saveCustomPersonas = (customPersonas: Persona[]) => {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(CUSTOM_PERSONAS_KEY, JSON.stringify(customPersonas))
  } catch (error) {
    console.error("Failed to save custom personas:", error)
  }
}

export const builtInPersonas: Persona[] = [
  {
    id: "general",
    name: "General Assistant",
    emoji: "🤖",
    systemPrompt: "You are a helpful AI assistant. Provide clear, accurate, and friendly responses to user queries.",
    description: "General-purpose AI assistant for all your questions"
  },
  {
    id: "dsa-interviewer",
    name: "DSA Interviewer",
    emoji: "💻",
    systemPrompt: "You are an expert Data Structures and Algorithms interviewer. Ask challenging DSA questions, provide hints when needed, analyze time and space complexity, and give constructive feedback on coding solutions. Be thorough but encouraging.",
    description: "Practice coding interviews with expert feedback"
  },
  {
    id: "system-design",
    name: "System Design Mentor",
    emoji: "🏗️",
    systemPrompt: "You are a senior software architect and system design expert. Help users understand scalability, distributed systems, microservices, caching, load balancing, and database design. Ask clarifying questions about requirements, users, and scale. Provide detailed explanations with diagrams when needed.",
    description: "Learn system design and architecture patterns"
  },
  {
    id: "code-reviewer",
    name: "Strict Code Reviewer",
    emoji: "🔍",
    systemPrompt: "You are a meticulous code reviewer with high standards. Review code for bugs, security vulnerabilities, performance issues, code style, and best practices. Be strict but constructive. Suggest improvements and explain why they matter. Focus on clean code, SOLID principles, and maintainability.",
    description: "Get detailed code reviews and improvements"
  },
  {
    id: "resume-improver",
    name: "Resume Improver",
    emoji: "📄",
    systemPrompt: "You are an expert career coach and resume writer. Help users improve their resumes by making them more impactful, quantifiable, and ATS-friendly. Use action verbs, highlight achievements over responsibilities, and tailor content for tech roles. Focus on STAR method (Situation, Task, Action, Result).",
    description: "Enhance your resume with professional tips"
  },
  {
    id: "frontend-expert",
    name: "Frontend Expert",
    emoji: "🎨",
    systemPrompt: "You are a senior frontend developer expert in React, Vue, Angular, TypeScript, CSS, and modern web technologies. Provide best practices for component architecture, state management, performance optimization, accessibility, and responsive design. Write clean, maintainable code.",
    description: "Master frontend development and UI/UX"
  },
  {
    id: "backend-expert",
    name: "Backend Expert",
    emoji: "⚙️",
    systemPrompt: "You are a senior backend engineer expert in Node.js, Python, Java, databases, APIs, microservices, and cloud infrastructure. Help with API design, database optimization, authentication, caching strategies, and scalability. Focus on security, performance, and reliability.",
    description: "Build robust backend systems and APIs"
  }
]

export const getAllPersonas = (): Persona[] => {
  return [...builtInPersonas, ...loadCustomPersonas()]
}

export const getPersonaById = (id: string): Persona => {
  const allPersonas = getAllPersonas()
  return allPersonas.find(p => p.id === id) || builtInPersonas[0]
}

// Check if persona already exists by ID
export const findExistingPersona = (persona: Persona): Persona | null => {
  const allPersonas = getAllPersonas()
  return allPersonas.find(p => p.id === persona.id) || null
}

// Add custom persona (returns existing if ID already exists)
export const addCustomPersona = (persona: Persona): Persona => {
  const customPersonas = loadCustomPersonas()
  
  // Check if already exists by ID
  const existing = customPersonas.find(p => p.id === persona.id)
  if (existing) {
    return existing
  }
  
  // Ensure it's marked as custom
  const newPersona: Persona = {
    ...persona,
    isCustom: true
  }
  
  customPersonas.push(newPersona)
  saveCustomPersonas(customPersonas)
  return newPersona
}

export const updateCustomPersona = (id: string, updates: Partial<Persona>) => {
  const customPersonas = loadCustomPersonas()
  const index = customPersonas.findIndex(p => p.id === id)
  if (index !== -1) {
    customPersonas[index] = { ...customPersonas[index], ...updates }
    saveCustomPersonas(customPersonas)
  }
}

export const deleteCustomPersona = (id: string) => {
  const customPersonas = loadCustomPersonas()
  const filtered = customPersonas.filter(p => p.id !== id)
  saveCustomPersonas(filtered)
}

export const updatePersona = (id: string, updates: Partial<Persona>) => {
  updateCustomPersona(id, updates)
}

export const deletePersona = (id: string) => {
  deleteCustomPersona(id)
  
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(CHATS_STORAGE_KEY)
      if (stored) {
        const data = JSON.parse(stored)
        const filteredChats = (data.chats || []).filter((chat: any) => chat.personaId !== id)
        localStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify({ chats: filteredChats }))
      }
    } catch (error) {
      console.error("Failed to delete associated chats:", error)
    }
  }
}

export const getCustomPersonas = (): Persona[] => {
  return loadCustomPersonas()
}

// Encode persona to URL (includes ID for sharing)
export const encodePersonaToUrl = (persona: Persona): string => {
  const data = {
    id: persona.id,
    name: persona.name,
    emoji: persona.emoji,
    prompt: persona.systemPrompt,
    description: persona.description
  }
  return btoa(encodeURIComponent(JSON.stringify(data)))
}

// Decode persona from URL (preserves shared ID)
export const decodePersonaFromUrl = (encoded: string): Persona | null => {
  try {
    const decoded = JSON.parse(decodeURIComponent(atob(encoded)))
    return {
      id: decoded.id || `custom-${Date.now().toString()+ Math.random().toString(36).substring(2, 8)}`,
      name: decoded.name || 'Custom Persona',
      emoji: decoded.emoji || '✨',
      systemPrompt: decoded.prompt || '',
      description: decoded.description || 'Custom persona',
      isCustom: true
    }
  } catch {
    return null
  }
}
