"use client";

import { useEffect, useRef } from "react";
import { Message } from "@/lib/types";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
}

export default function ChatMessages({
  messages,
  isLoading,
}: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-4 animate-fade-in">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-flare-coral to-flare-coral-dark flex items-center justify-center">
            <span className="text-2xl text-white font-bold">F</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Flare DeFi Agent
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md">
            Your AI assistant for interacting with Flare Network protocols.
            Ask about prices, check wallets, generate random numbers, and more.
          </p>
          <div className="flex flex-wrap gap-2 justify-center pt-2">
            {[
              "What's the price of FLR?",
              "Check my wallet balance",
              "Generate a random number",
            ].map((suggestion) => (
              <span
                key={suggestion}
                className="text-xs bg-gray-100 dark:bg-dark-600 text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-full border border-gray-200 dark:border-dark-400"
              >
                {suggestion}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="max-w-3xl mx-auto space-y-4">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isLoading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
