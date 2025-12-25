import type React from "react";
import { useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useChatStore } from "@/lib/chat-store";
import { cn } from "@/lib/utils";
import {
  Plus,
  MessageSquare,
  Trash2,
  X,
  PanelLeftClose,
  PanelLeft,
  LayoutGrid,
} from "lucide-react";
// import { getPersonaById } from "@/lib/personas";
import { useThemeStore } from "@/lib/theme-store";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const { chatId } = useParams();
  const location = useLocation();
  const { chats, deleteChat } = useChatStore();
  const { theme } = useThemeStore();

  const handleNewChat = () => {
    navigate("/");
    onClose();
  };

  const handleSelectChat = (id: string) => {
    navigate(`/c/${id}`);
    onClose();
  };

  const handleDeleteChat = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteChat(id);
    if (chatId === id) {
      navigate("/");
    }
  };

  const handleSpacesClick = () => {
    navigate("/spaces");
    onClose();
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const isSpacesActive = location.pathname.startsWith("/spaces");

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-full flex-col bg-white dark:bg-zinc-900 transition-all duration-300 ease-in-out lg:static lg:translate-x-0 border-r border-zinc-200 dark:border-zinc-800",
          isCollapsed ? "w-16" : "w-64",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3 overflow-hidden">
            {!isCollapsed && (
              <div className="flex items-center gap-2">
                <img
                  src={theme === "dark" ? "/logo-dark.png" : "/logo-light.png"}
                  alt="Logo"
                  className="h-6 w-6"
                />
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Nirvana
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={toggleCollapse}
              className="hidden lg:flex rounded-md p-1.5 text-zinc-500 dark:text-zinc-400 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? (
                <PanelLeft className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </button>
            <button
              onClick={onClose}
              className="rounded-md p-1.5 text-zinc-500 dark:text-zinc-400 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 lg:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* New Chat Button */}
        <div className={cn("p-3", isCollapsed && "px-2")}>
          <button
            onClick={handleNewChat}
            className={cn(
              "flex w-full items-center gap-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 py-2 text-sm font-medium text-white transition-colors",
              isCollapsed ? "justify-center px-0" : "justify-center px-3"
            )}
            title={isCollapsed ? "New Chat" : ""}
          >
            <Plus className="h-4 w-4" strokeWidth={2} />
            {!isCollapsed && "New Chat"}
          </button>
        </div>

        {/* Spaces Navigation */}
        <div className={cn("px-3 pb-2", isCollapsed && "px-2")}>
          <button
            onClick={handleSpacesClick}
            className={cn(
              "flex w-full items-center gap-2 rounded-lg py-2 text-sm font-medium transition-colors",
              isCollapsed ? "justify-center px-0" : "px-3",
              isSpacesActive
                ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            )}
            title={isCollapsed ? "Spaces" : ""}
          >
            <LayoutGrid className="h-4 w-4" strokeWidth={2} />
            {!isCollapsed && "Spaces"}
          </button>
        </div>

        {/* Chat List */}
        <div
          className={cn(
            "flex-1 overflow-y-auto py-2",
            isCollapsed ? "px-2" : "px-3"
          )}
        >
          {/* Recent Chats Section */}
          <div className="space-y-0.5">
            {!isCollapsed && chats.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Recent
              </div>
            )}

            {chats.length === 0 && !isCollapsed ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <div
                  className={cn(
                    "mb-3 flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800",
                    isCollapsed ? "h-8 w-8" : "h-12 w-12"
                  )}
                >
                  <MessageSquare
                    className={cn(
                      "text-zinc-400",
                      isCollapsed ? "h-4 w-4" : "h-6 w-6"
                    )}
                    strokeWidth={2}
                  />
                </div>

                <>
                  <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    No chats yet
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                    Start a conversation
                  </p>
                </>
              </div>
            ) : (
              <div className="space-y-0.5">
                {!isCollapsed &&
                  chats.map((chat, _index) => {
                    // const persona = getPersonaById(chat.personaId);
                    return (
                      <button
                        key={chat.id}
                        onClick={() => handleSelectChat(chat.id)}
                        className={cn(
                          "group flex w-full items-center gap-2 rounded-lg py-2 text-left transition-colors",
                          isCollapsed ? "justify-center px-0" : "px-3",
                          chatId === chat.id
                            ? "bg-emerald-50 dark:bg-emerald-900/20 text-zinc-900 dark:text-zinc-100"
                            : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        )}
                        title={isCollapsed ? chat.title : ""}
                      >
                        <>
                          <span className="flex-1 truncate text-sm font-medium">
                            {chat.title}
                          </span>
                          <button
                            onClick={(e) => handleDeleteChat(e, chat.id)}
                            className="rounded-md p-1 opacity-0 transition-opacity hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 dark:hover:text-red-400 group-hover:opacity-100"
                            aria-label="Delete chat"
                          >
                            <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                          </button>
                        </>
                      </button>
                    );
                  })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        {!isCollapsed && (
          <div className="border-t border-zinc-200 dark:border-zinc-800 px-4 py-3">
            <p className="text-center text-xs text-zinc-400 dark:text-zinc-600">
              Powered by AI ✨
            </p>
          </div>
        )}
      </aside>
    </>
  );
}
