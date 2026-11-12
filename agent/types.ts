// Shared shapes for the agent backend. Kept intentionally small ("light types"):
// only the project's own data, not an attempt to fully type every SDK call.

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

// One payment attempt the agent made, surfaced to the frontend.
// Field names match what agent-core.ts actually pushes — do not rename
// without updating web/src/api.ts's hand-copied mirror of this type.
export interface PayVendorEvent {
  vendor: string;
  amount_xlm: number;
  ok: boolean;
  hash?: string; // present when ok is true
  reason?: string; // present when ok is false
}

export interface RunAgentResult {
  reply: string;
  events: PayVendorEvent[];
}
