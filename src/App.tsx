import { useEffect } from "react";
import { Routes, Route, useNavigate, useSearchParams } from "react-router-dom";
import { AppLayout } from "./components/app-layout";
import { useThemeStore } from "./lib/theme-store";
import { useChatStore } from "./lib/chat-store";
import { decodePersonaFromUrl } from "./lib/personas";
import { CreateSpaceImport } from "./components/CreateSpaceImport";

const App = () => {
  const { theme } = useThemeStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setActivePersona, createNewChat } = useChatStore();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  // Handle shared persona from URL
  useEffect(() => {
    const personaParam = searchParams.get("persona");
    if (personaParam) {
      const persona = decodePersonaFromUrl(personaParam);
      if (persona) {
        setActivePersona(persona.id);
        const newChatId = createNewChat(persona.id);
        navigate(`/c/${newChatId}`, { replace: true });
      }
    }
  }, [searchParams, setActivePersona, createNewChat, navigate]);

  return (
    <Routes>
      <Route path="/" element={<AppLayout />} />
      <Route path="/c/:chatId" element={<AppLayout />} />
      <Route path="/spaces" element={<AppLayout />} />
      <Route path="/spaces/:personaId" element={<AppLayout />} />
      <Route path="/spaces/create" element={<CreateSpaceImport />} />
    </Routes>
  );
};

export default App;
