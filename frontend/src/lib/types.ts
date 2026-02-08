export interface ToolCall {
  id: string;
  name: string;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  status: "pending" | "success" | "error";
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  toolCalls?: ToolCall[];
  timestamp: number;
}

export interface ChatRequest {
  messages: Pick<Message, "role" | "content">[];
}

export interface ChatResponse {
  role: "assistant";
  content: string;
  toolCalls?: ToolCall[];
}

export type QuickAction = {
  label: string;
  message: string;
  icon: string;
};
