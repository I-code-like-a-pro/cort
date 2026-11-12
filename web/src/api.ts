// All network calls live here so components never touch fetch directly.
// __API_URL__ is filled in by build.mjs (from the API_URL environment variable).
//
// These types are a hand-copied mirror of agent/types.ts on the backend.
// Keep both sides in sync by hand if either one changes — there is no
// shared package between the two today.

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface PayVendorEvent {
  vendor: string;
  amount_xlm: number;
  ok: boolean;
  hash?: string; // present when ok is true
  reason?: string; // present when ok is false
}

export interface ChatResponse {
  reply: string;
  events: PayVendorEvent[];
}

const API_URL = typeof __API_URL__ !== "undefined" ? __API_URL__ : "http://127.0.0.1:3000";

export class ApiError extends Error {
  detail?: string;
  constructor(message: string, detail?: string) {
    super(message);
    this.detail = detail;
  }
}

export async function fetchBalance(): Promise<number> {
  const res = await fetch(`${API_URL}/api/balance`);
  if (!res.ok) throw new ApiError("Could not read the wallet balance");
  const data = await res.json();
  return Number(data.xlm);
}

export async function sendChat(messages: ChatMessage[]): Promise<ChatResponse> {
  const res = await fetch(`${API_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error || "Something went wrong.", data.detail);
  return data as ChatResponse;
}
