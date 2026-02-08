"use client";

export default function TypingIndicator() {
  return (
    <div className="flex justify-start animate-fade-in">
      <div className="max-w-[85%]">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-flare-coral to-flare-coral-dark flex items-center justify-center">
            <span className="text-xs text-white font-bold">F</span>
          </div>
          <span className="text-xs text-gray-400 dark:text-gray-500">Flare Copilot</span>
        </div>
        <div className="bg-gray-100 dark:bg-dark-600 rounded-2xl rounded-bl-md px-4 py-3 inline-flex items-center gap-1.5">
          <div
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <div
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <div
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>
    </div>
  );
}
