"use client";

import { useState, useCallback } from "react";
import { Message, ChatResponse } from "@/lib/types";

let messageCounter = 0;
function nextId(): string {
  return `msg_${++messageCounter}_${Date.now()}`;
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      setError(null);

      const userMessage: Message = {
        id: nextId(),
        role: "user",
        content: content.trim(),
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [
              ...messages.map((m) => ({ role: m.role, content: m.content })),
              { role: "user", content: content.trim() },
            ],
          }),
        });

        if (!res.ok) {
          throw new Error(`Server error: ${res.status}`);
        }

        const data: ChatResponse = await res.json();

        const assistantMessage: Message = {
          id: nextId(),
          role: "assistant",
          content: data.content,
          toolCalls: data.toolCalls,
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to send message"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading]
  );

  return { messages, isLoading, error, sendMessage };
}
