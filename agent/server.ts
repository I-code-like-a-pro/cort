// API-only server. It serves data as JSON and nothing else: no HTML, no scripts.
// The React app lives in ../web and calls these routes from its own address.
//
//   GET  /api/health    {"ok": true}
//   GET  /api/balance   {"xlm": 39.9969}
//   POST /api/chat      {"messages":[{role,content},...]} -> {"reply","events"}
import http, { type IncomingMessage, type ServerResponse } from "node:http";
import { runAgent } from "./agent-core.js";
import { getWalletBalanceXlm } from "./chain.js";
import type { ChatMessage, RunAgentResult } from "./types.js";

const HOST = "127.0.0.1";
const PORT = Number(process.env.PORT) || 3000;

// The only websites allowed to call this API. Override with FRONTEND_ORIGIN in .env
// (comma-separated), for example FRONTEND_ORIGIN=http://127.0.0.1:5173
const ALLOWED_ORIGINS = new Set(
  (process.env.FRONTEND_ORIGIN || "http://127.0.0.1:5173,http://localhost:5173")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
);
// Only answer requests addressed to this machine by name; blocks DNS rebinding.
const ALLOWED_HOSTS = new Set([`${HOST}:${PORT}`, `localhost:${PORT}`]);

const MAX_BODY_BYTES = 20_000;
const MAX_MESSAGES = 20;
const MAX_MESSAGE_CHARS = 2_000;

// Only one agent run at a time: payments must not overlap (sequence numbers).
let busy = false;

function corsHeaders(req: IncomingMessage): Record<string, string> {
  const origin = req.headers.origin;
  const headers: Record<string, string> = { Vary: "Origin" };
  if (origin && ALLOWED_ORIGINS.has(origin)) headers["Access-Control-Allow-Origin"] = origin;
  return headers;
}

function sendJson(req: IncomingMessage, res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "no-store",
    ...corsHeaders(req),
  });
  res.end(JSON.stringify(body));
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new Error("too large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

// Keep only well-formed user/assistant text turns; the last one must be from the user.
function cleanHistory(input: unknown): ChatMessage[] | null {
  if (!Array.isArray(input)) return null;
  const out: ChatMessage[] = [];
  for (const m of input.slice(-MAX_MESSAGES)) {
    if (!m || (m.role !== "user" && m.role !== "assistant")) continue;
    if (typeof m.content !== "string" || !m.content.trim()) continue;
    out.push({ role: m.role, content: m.content.slice(0, MAX_MESSAGE_CHARS) });
  }
  if (out.length === 0 || out[out.length - 1].role !== "user") return null;
  return out;
}

const server = http.createServer(async (req, res) => {
  const reply = (status: number, body: unknown) => sendJson(req, res, status, body);

  try {
    if (!ALLOWED_HOSTS.has(req.headers.host ?? "")) return reply(421, { error: "Unexpected host" });

    // Any browser request from a site that is not the frontend is refused,
    // so another website cannot read your balance or trigger payments.
    const origin = req.headers.origin;
    if (origin && !ALLOWED_ORIGINS.has(origin)) return reply(403, { error: "Forbidden origin" });

    const url = (req.url ?? "").split("?")[0];

    // CORS preflight from the frontend.
    if (req.method === "OPTIONS") {
      res.writeHead(204, {
        ...corsHeaders(req),
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "600",
      });
      res.end();
      return;
    }

    if (req.method === "GET" && url === "/api/health") return reply(200, { ok: true });

    if (req.method === "GET" && url === "/api/balance") {
      try {
        return reply(200, { xlm: await getWalletBalanceXlm() });
      } catch {
        return reply(502, { error: "Could not read the wallet balance" });
      }
    }

    if (req.method === "POST" && url === "/api/chat") {
      const type = (req.headers["content-type"] || "").split(";")[0].trim();
      if (type !== "application/json") return reply(415, { error: "Expected JSON" });

      let data: any;
      try {
        data = JSON.parse(await readBody(req));
      } catch {
        return reply(400, { error: "Bad request body" });
      }

      const history = cleanHistory(data?.messages);
      if (!history) return reply(400, { error: "Send at least one user message" });

      if (busy) return reply(429, { error: "The agent is still working on the last message" });
      busy = true;
      try {
        const result: RunAgentResult = await runAgent(history);
        return reply(200, result);
      } catch (err: any) {
        console.error("agent error:", err?.status ?? "", err?.message ?? err);
        return reply(502, {
          error: "The agent could not finish. Check the terminal and try again.",
          // Status and message from the model API; never includes your keys.
          detail: `${err?.status ?? ""} ${String(err?.message ?? err)}`.trim().slice(0, 300),
        });
      } finally {
        busy = false;
      }
    }

    return reply(404, { error: "Not found" });
  } catch (err) {
    console.error(err);
    if (!res.headersSent) reply(500, { error: "Server error" });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Cort API running at http://${HOST}:${PORT}`);
  console.log(`Accepting requests from: ${[...ALLOWED_ORIGINS].join(", ")}`);
});
