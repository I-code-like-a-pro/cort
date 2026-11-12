// All network calls live here so components never touch fetch directly.
// __API_URL__ is filled in by build.mjs (from the API_URL environment variable).

const API_URL = typeof __API_URL__ !== "undefined" ? __API_URL__ : "http://127.0.0.1:3000";

export class ApiError extends Error {
  constructor(message, detail) {
    super(message);
    this.detail = detail;
  }
}

export async function fetchBalance() {
  const res = await fetch(`${API_URL}/api/balance`);
  if (!res.ok) throw new ApiError("Could not read the wallet balance");
  const data = await res.json();
  return Number(data.xlm);
}

// messages: [{ role: "user" | "assistant", content: string }, ...]
export async function sendChat(messages) {
  const res = await fetch(`${API_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error || "Something went wrong.", data.detail);
  return data;
}
