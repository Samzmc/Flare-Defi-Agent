"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import { useChat } from "@/hooks/useChat";

export default function ChatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { messages, isLoading, error, sendMessage } = useChat();

  return (
    <div className="flex h-screen bg-white dark:bg-dark-900 text-gray-900 dark:text-white">
      {/* Sidebar */}
      <Sidebar
        onQuickAction={sendMessage}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-dark-500 bg-white/50 dark:bg-dark-800/50 backdrop-blur-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-600 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full" />
            <span className="text-sm text-gray-500 dark:text-gray-400">Flare DeFi Copilot</span>
          </div>
          <span className="text-xs text-gray-400 dark:text-gray-600 ml-auto">
            Powered by Claude + MCP
          </span>
        </header>

        {/* Messages */}
        <ChatMessages messages={messages} isLoading={isLoading} />

        {/* Error Bar */}
        {error && (
          <div className="px-4 py-2 bg-red-50 dark:bg-red-900/30 border-t border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 text-sm text-center animate-fade-in">
            {error}
          </div>
        )}

        {/* Input */}
        <ChatInput onSend={sendMessage} disabled={isLoading} />
      </div>
    </div>
  );
}
