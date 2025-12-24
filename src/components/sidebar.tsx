import type React from "react";
import { use, useState } from "react";
import { useChatStore } from "@/lib/chat-store";
import { cn } from "@/lib/utils";
import {
  Plus,
  MessageSquare,
  Trash2,
  X,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { useThemeStore } from "@/lib/theme-store";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const {
    chats,
    activeChatId,
    showLandingView,
    setActiveChat,
    deleteChat,
    showLanding,
  } = useChatStore();

  const handleNewChat = () => {
    showLandingView();
    onClose();
  };

  const handleSelectChat = (id: string) => {
    setActiveChat(id);
    onClose();
  };

  const handleDeleteChat = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteChat(id);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };
  const theme = useThemeStore((state) => state.theme);
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
          "fixed left-0 top-0 z-50 flex h-full flex-col bg-zinc-50 dark:bg-zinc-900 backdrop-blur-xl supports-backdrop-filter:bg-zinc-50/90 dark:supports-backdrop-filter:bg-zinc-900/90 transition-all duration-300 ease-in-out lg:static lg:translate-x-0",
          isCollapsed ? "w-20" : "w-64",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-3 overflow-hidden">
            {!isCollapsed && (
              <img
                src={theme == "dark" ? "/logo-dark.png" : "/logo-light.png"}
                alt="Nirvana Logo"
                className="h-8 w-8"
              />
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleCollapse}
              className="hidden lg:flex rounded-xl p-2 text-zinc-500 dark:text-zinc-400 transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 hover:scale-110"
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? (
                <PanelLeft className="h-5 w-5" />
              ) : (
                <PanelLeftClose className="h-5 w-5" />
              )}
              <span className="sr-only">
                {isCollapsed ? "Expand" : "Collapse"} sidebar
              </span>
            </button>
            <button
              onClick={onClose}
              className="rounded-xl p-2 text-zinc-500 dark:text-zinc-400 transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 hover:scale-110 lg:hidden"
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close sidebar</span>
            </button>
          </div>
        </div>

        {/* New Chat Button */}
        <div className={cn("px-4 pb-4", isCollapsed && "px-2")}>
          <button
            onClick={handleNewChat}
            className={cn(
              "flex w-full items-center gap-2 rounded-lg bg-black py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:opacity-70 hover:shadow-xl hover:cursor-pointer",
              isCollapsed ? "justify-center px-0" : "justify-center px-4"
            )}
            title={isCollapsed ? "New Chat" : ""}
          >
            <Plus className="h-5 w-5" strokeWidth={2.5} />
            {!isCollapsed && "New Chat"}
          </button>
        </div>

        {/* Chat List */}
        <div
          className={cn(
            "flex-1 overflow-y-auto py-2 space-y-1",
            isCollapsed ? "px-2" : "px-4"
          )}
        >
          {chats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div
                className={cn(
                  "mb-4 flex items-center justify-center rounded-2xl bg-zinc-100/20 dark:bg-zinc-800/20 ring-1 ring-zinc-200/30 dark:ring-zinc-800/30",
                  isCollapsed ? "h-10 w-10" : "h-14 w-14"
                )}
              >
                <MessageSquare
                  className={cn(
                    "text-zinc-500/50 dark:text-zinc-400/50",
                    isCollapsed ? "h-5 w-5" : "h-7 w-7"
                  )}
                  strokeWidth={2}
                />
              </div>
              {!isCollapsed && (
                <>
                  <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400">
                    No chats yet
                  </p>
                  <p className="text-xs text-zinc-500/50 dark:text-zinc-400/50 mt-1">
                    Start a conversation
                  </p>
                </>
              )}
            </div>
          ) : (
            <>
              {chats.map((chat, index) => (
                <button
                  key={chat.id}
                  onClick={() => handleSelectChat(chat.id)}
                  style={{ animationDelay: `${index * 50}ms` }}
                  className={cn(
                    "hover:cursor-pointer animate-fade-in-up group flex w-full items-center gap-3 rounded-2xl py-3 text-left transition-all",
                    isCollapsed ? "justify-center px-0" : "px-4",
                    activeChatId === chat.id && !showLanding
                      ? "bg-zinc-100/80 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 shadow-lg ring-1 ring-blue-500/20"
                      : "text-zinc-900/80 dark:text-zinc-100/80 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100 hover:shadow-md"
                  )}
                  title={isCollapsed ? chat.title : ""}
                >
                  <MessageSquare
                    className="h-4 w-4 shrink-0 opacity-50"
                    strokeWidth={2}
                  />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 truncate text-sm font-semibold">
                        {chat.title}
                      </span>
                      <button
                        onClick={(e) => handleDeleteChat(e, chat.id)}
                        className="rounded-xl p-1.5 opacity-0 transition-all hover:bg-red-500/20 hover:text-red-500 dark:hover:text-red-400 group-hover:opacity-100 hover:scale-110 hover:cursor-pointer"
                        aria-label="Delete chat"
                      >
                        <Trash2 className="h-3.5 w-3.5" strokeWidth={2.5} />
                      </button>
                    </>
                  )}
                </button>
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        {!isCollapsed && (
          <div className="border-t p-6 border-zinc-200 dark:border-zinc-800">
            <p className="text-center text-xs text-zinc-500/60 dark:text-zinc-400/60">
              Powered by AI
            </p>
          </div>
        )}
      </aside>
    </>
  );
}
