# 🌟 Nirvana Chat

<div align="center">

![Nirvana Chat](https://img.shields.io/badge/React-19.2.0-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue?style=for-the-badge&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7.2.4-646CFF?style=for-the-badge&logo=vite)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4.1.18-38B2AC?style=for-the-badge&logo=tailwind-css)

**A modern AI chat application powered by Google's Gemini AI with customizable personas and spaces**

[Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [Usage](#-usage) • [Tech Stack](#-tech-stack)

</div>

---

## ✨ Features

### 🎭 **Multi-Persona AI Chat System**

Transform your AI conversations with specialized personas tailored for specific tasks:

- **7 Built-in Expert Personas**
  - **General Assistant** - Your go-to helper for everyday questions and tasks
  - **DSA Interviewer** - Practice data structures and algorithms with an expert interviewer who provides hints, analyzes complexity, and gives constructive feedback
  - **System Design Mentor** - Learn scalable architecture, distributed systems, and design patterns with a senior software architect
  - **Strict Code Reviewer** - Get detailed code reviews focusing on bugs, security, performance, and best practices
  - **Resume Improver** - Enhance your resume with ATS-friendly formatting, action verbs, and quantifiable achievements
  - **Frontend Expert** - Master React, TypeScript, CSS, and modern web development with component architecture guidance
  - **Backend Expert** - Build robust APIs, optimize databases, and design microservices with backend engineering expertise

- **Create Custom Personas**
  - Design AI assistants with unique personalities and expertise
  - Define custom system prompts to guide AI behavior
  - Perfect for specialized domains like legal advice, medical consultation, creative writing, language learning, and more
  - Each persona maintains its own context and conversation style

- **Organized Persona Spaces**
  - Dedicated workspace for each persona
  - View all conversations grouped by persona
  - Switch between different AI experts seamlessly
  - Keep interview prep separate from code reviews and system design discussions

### 💬 **Intelligent Chat Interface**

A feature-rich chat experience that goes beyond simple question-and-answer:

- **Real-time Streaming Responses**
  - See AI responses as they're being generated, word by word
  - Powered by Google's Gemini 2.5 Flash model for fast, intelligent responses
  - Stop generation mid-stream if you get the answer you need

- **Rich Markdown Support**
  - Beautiful rendering of formatted text, lists, tables, and quotes
  - **Syntax-highlighted code blocks** for 100+ programming languages via Shiki
  - GitHub Flavored Markdown support for task lists, tables, and strikethrough
  - Inline code formatting and multi-line code blocks

- **Powerful Message Actions**
  - **Copy to Clipboard** - One-click copy for any message
  - **Regenerate Response** - Get a different answer to the same question
  - **Edit & Resend** - Modify your message and get a new response
  - **Delete Chats** - Remove conversations you no longer need

- **Persistent Chat History**
  - All conversations saved automatically in browser's local storage
  - Resume conversations exactly where you left off
  - Search through past chats to find previous discussions
  - Chat titles auto-generated from first message
  - Timestamps for every message

### 🎨 **Modern, Beautiful UI/UX**

A polished interface designed for productivity and aesthetics:

- **Adaptive Dark/Light Theme**
  - Toggle between dark and light modes instantly
  - System preference detection on first load
  - Persistent theme selection across sessions
  - Smooth transitions between themes
  - Optimized color schemes for readability in both modes

- **Fully Responsive Design**
  - Optimized layouts for desktop, tablet, and mobile devices
  - Touch-friendly interface for mobile users
  - Collapsible sidebar for smaller screens
  - Adaptive typography and spacing
  - Built with Tailwind CSS 4.1 for consistent styling

- **Smooth, Delightful Animations**
  - Page transitions powered by Framer Motion
  - Micro-interactions on buttons and cards
  - Smooth message appearances during streaming
  - Loading states and skeleton screens
  - No janky animations - 60fps smooth

- **Accessible Components**
  - Built with Radix UI primitives for full accessibility
  - Keyboard navigation support
  - Screen reader friendly
  - ARIA labels and semantic HTML
  - Focus management and proper tab order

### 🔗 **Sharing & Collaboration Features**

Share your AI configurations and collaborate with others:

- **One-Click Persona Sharing**
  - Generate shareable URLs for custom personas
  - Base64 encoded persona data in URL parameters
  - Recipients can import personas with a single click
  - Perfect for sharing interview prep bots, code review configs, or specialized assistants
  - No server required - everything encoded in the URL

- **Privacy-First Local Storage**
  - All data stored in your browser - nothing sent to external servers (except Gemini API)
  - Your conversations are completely private
  - Export/import functionality for backup
  - Clear data anytime from browser settings

- **Cross-Device Persona Sharing**
  - Create a persona on desktop, use it on mobile
  - Share specialized AI assistants with your team
  - Educational use: Teachers can share custom tutoring personas with students
  - Community-driven: Share useful personas on forums or social media

### 🚀 **Performance & Developer Experience**

Built with modern tools for optimal performance:

- **Lightning-Fast Build System**
  - Vite 7.2 for instant hot module replacement
  - Sub-second development server startup
  - Optimized production builds with code splitting

- **Type-Safe Development**
  - Full TypeScript coverage for fewer runtime errors
  - Autocomplete and IntelliSense support
  - Zustand for type-safe state management

- **Optimized Bundle Size**
  - Tree-shaking for minimal bundle size
  - Lazy loading for routes and components
  - Efficient chunk splitting

---

## 🚀 Demo

### 🏠 Landing Page
Welcome screen with persona selection and quick access to all features.

<div align="center">
  <img src="assets/landing.png" alt="Nirvana Chat Landing Page" width="800">
</div>

### 💬 Chat Interface
Experience real-time AI conversations with syntax-highlighted code blocks and markdown rendering.

<div align="center">
  <img src="assets/chats.png" alt="Chat Interface with AI Responses" width="800">
</div>

### 📚 Persona Spaces
Organize your chats by persona and switch between different AI assistants seamlessly.

<div align="center">
  <img src="assets/spaces.png" alt="Persona Spaces Organization" width="800">
</div>

---

### ✨ Key Highlights
- **Real-time streaming** responses as you type
- **Beautiful syntax highlighting** for code blocks
- **Dark/Light mode** with smooth transitions
- **Custom personas** for specialized tasks

---

## 📦 Installation

### Prerequisites
- **Node.js** >= 18.0.0
- **npm** or **yarn** or **pnpm**
- **Google Gemini API Key** ([Get one here](https://ai.google.dev/))

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/nirvana-chat.git
   cd nirvana-chat
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_GEMINI_API_KEY=your_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:5173`

---

## 🎯 Usage

### Starting a Chat
1. Select a persona from the sidebar or create a new one
2. Type your message in the chat input
3. Press Enter or click Send to get AI responses

### Creating Custom Personas
1. Click "Spaces" in the sidebar
2. Click "Create New Space"
3. Fill in the persona details:
   - Name
   - Emoji
   - Description
   - System Prompt (defines the AI's behavior)
4. Save and start chatting!

### Sharing Personas
1. Navigate to your custom persona
2. Click the share button
3. Copy the generated URL
4. Share with friends - they can import it with one click!

### Managing Chats
- **New Chat**: Start fresh while keeping the same persona
- **Delete Chat**: Remove unwanted conversations
- **Regenerate**: Get a different response to your last message
- **Edit & Resend**: Modify your message and get a new response

---

## 🛠️ Tech Stack

### Core
- **React 19.2** - UI library with latest features
- **TypeScript** - Type-safe development
- **Vite 7.2** - Lightning-fast build tool
- **React Router 7.11** - Client-side routing

### Styling
- **Tailwind CSS 4.1** - Utility-first CSS framework
- **Framer Motion 12** - Animation library
- **Radix UI** - Unstyled, accessible components
- **Lucide React** - Beautiful icon library

### State Management
- **Zustand 5.0** - Lightweight state management
- **Local Storage** - Persistent data storage

### AI & Markdown
- **Google Generative AI** - Gemini API integration
- **React Markdown** - Markdown rendering
- **Shiki 3.20** - Syntax highlighting
- **Remark GFM** - GitHub Flavored Markdown

### UI Components
- **next-themes** - Theme management
- **Sonner** - Toast notifications
- **shadcn/ui** - Re-usable component patterns

---

## 📁 Project Structure

```
nirvana-chat/
├── src/
│   ├── components/          # React components
│   │   ├── ui/              # Reusable UI components
│   │   ├── app-layout.tsx   # Main layout wrapper
│   │   ├── chat-window.tsx  # Chat interface
│   │   ├── sidebar.tsx      # Navigation sidebar
│   │   └── ...
│   ├── lib/                 # Utilities & stores
│   │   ├── chat-store.ts    # Chat state management
│   │   ├── personas.ts      # Persona definitions
│   │   ├── theme-store.ts   # Theme management
│   │   └── utils.ts         # Helper functions
│   ├── hooks/               # Custom React hooks
│   ├── App.tsx              # Main app component
│   └── main.tsx             # Entry point
├── public/                  # Static assets
└── package.json             # Dependencies
```

---

## 🧪 Scripts

```bash
# Development
npm run dev          # Start dev server (Vite)

# Production
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
```

---

## 🎨 Customization

### Adding New Personas

Edit `src/lib/personas.ts`:

```typescript
{
  id: "custom-assistant",
  name: "Custom Assistant",
  emoji: "🎯",
  systemPrompt: "Your custom system prompt here",
  description: "Brief description of what this persona does"
}
```

### Styling

The app uses Tailwind CSS. Customize colors and themes in `tailwind.config.js` or use CSS variables in `src/index.css`.

### AI Model Configuration

Modify the Gemini model settings in `src/lib/chat-store.ts`:

```typescript
const genAI = new GoogleGenerativeAI(apiKey)
const model = genAI.getGenerativeModel({ 
  model: "gemini-pro",
  // Add your custom configurations here
})
```

---

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_GEMINI_API_KEY` | Google Gemini API key | Yes |

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- **Google Gemini** for the powerful AI capabilities
- **shadcn/ui** for the beautiful component patterns
- **Vercel** for the amazing developer experience with Vite

---

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

<div align="center">

**Made with ❤️ using React, TypeScript, and Gemini AI**

⭐ Star this repo if you find it helpful!

</div>
