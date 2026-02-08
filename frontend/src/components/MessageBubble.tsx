"use client";

import { Message } from "@/lib/types";
import ToolCallCard from "./ToolCallCard";

export default function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} animate-slide-up`}
    >
      <div className={`max-w-[85%] ${isUser ? "order-1" : "order-1"}`}>
        {/* Avatar + Name */}
        <div
          className={`flex items-center gap-2 mb-1.5 ${isUser ? "justify-end" : "justify-start"}`}
        >
          {!isUser && (
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-flare-coral to-flare-coral-dark flex items-center justify-center">
              <span className="text-xs text-white font-bold">F</span>
            </div>
          )}
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {isUser ? "You" : "Flare Copilot"}
          </span>
        </div>

        {/* Tool Call Cards (before message text for assistant) */}
        {!isUser && message.toolCalls && message.toolCalls.length > 0 && (
          <div className="space-y-2 mb-3">
            {message.toolCalls.map((tc) => (
              <ToolCallCard key={tc.id} toolCall={tc} />
            ))}
          </div>
        )}

        {/* Message Bubble */}
        <div
          className={`
            rounded-2xl px-4 py-3 text-sm leading-relaxed
            ${
              isUser
                ? "bg-flare-coral text-white rounded-br-md"
                : "bg-gray-100 dark:bg-dark-600 text-gray-800 dark:text-gray-200 rounded-bl-md"
            }
          `}
        >
          {message.content.split("\n").map((line, i) => (
            <span key={i}>
              {line.split(/(\*\*[^*]+\*\*)/).map((part, j) => {
                if (part.startsWith("**") && part.endsWith("**")) {
                  return (
                    <strong key={j} className="font-semibold text-gray-900 dark:text-white">
                      {part.slice(2, -2)}
                    </strong>
                  );
                }
                return part;
              })}
              {i < message.content.split("\n").length - 1 && <br />}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
