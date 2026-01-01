import { create } from "zustand"
import { persist } from "zustand/middleware"

export type Theme = "light" | "dark"

interface ThemeState {
  theme: Theme
}

interface ThemeActions {
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

type ThemeStore = ThemeState & ThemeActions

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: "dark",
      setTheme: (theme: Theme) => {
        set({ theme })
        document.documentElement.classList.toggle("dark", theme === "dark")
      },
      toggleTheme: () => {
        set((state) => {
          const newTheme = state.theme === "dark" ? "light" : "dark"
          document.documentElement.classList.toggle("dark", newTheme === "dark")
          return { theme: newTheme }
        })
      },
    }),
    {
      name: "theme-storage",
      onRehydrateStorage: () => (state) => {
        if (state) {
          document.documentElement.classList.toggle("dark", state.theme === "dark")
        }
      },
    },
  ),
)
