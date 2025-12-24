import { useEffect } from "react"
import { AppLayout } from "./components/app-layout"
import { useThemeStore } from "./lib/theme-store"

const App = () => {
  const { theme } = useThemeStore()

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark")
  }, [theme])

  return <AppLayout />
}

export default App