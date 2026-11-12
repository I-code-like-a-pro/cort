import Groq from "groq-sdk";
import { pay } from "./wallet.js";
import type { ChatMessage, PayVendorEvent, RunAgentResult } from "./types.js";

const client = new Groq();
const MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-20b";
const MAX_TURNS = 5;

type VendorName = "DataCo" | "ShadyCorp";

// Keep only the characters a Stellar address can contain (guards against stray
// quotes or semicolons in .env values).
const clean = (s: string | undefined) => (s || "").replace(/[^A-Z0-9]/g, "");

// Names the agent knows -> addresses. The agent never types raw addresses.
const VENDORS: Record<VendorName, string> = {
  DataCo: clean(process.env.CAROL), // approved by the owner in the wallet
  ShadyCorp: clean(process.env.OWNER), // an address the owner never approved
};

const SYSTEM =
  "You are a purchasing agent with a spending wallet. Known vendors: DataCo and ShadyCorp. " +
  "Use the pay_vendor tool to make payments. Only call it when the user clearly asks you to pay. " +
  "If a payment is blocked, say so plainly and do not try to work around the wallet's rules. " +
  "Keep replies short.";

const tools: Groq.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "pay_vendor",
      description:
        "Pay a vendor in XLM from the agent's wallet. The wallet contract may refuse the payment. Report the result honestly.",
      parameters: {
        type: "object",
        properties: {
          vendor: { type: "string", description: "Vendor name, for example DataCo" },
          amount_xlm: { type: "number", description: "Amount in XLM" },
        },
        required: ["vendor", "amount_xlm"],
      },
    },
  },
];

// Turn wallet.js's raw failure text into something short and honest.
function describeFailure(reason = ""): string {
  if (reason.includes("HostError") || reason.includes("UnreachableCodeReached")) {
    return "Blocked by the wallet contract (rules not met)";
  }
  return "Payment failed: network or code error";
}

async function runTool(name: string, args: any, events: PayVendorEvent[]): Promise<string> {
  if (name !== "pay_vendor") return "Unknown tool";

  const { vendor, amount_xlm } = args ?? {};
  if (typeof amount_xlm !== "number" || !Number.isFinite(amount_xlm) || !(amount_xlm > 0) || amount_xlm > 1_000_000) {
    return "Invalid amount";
  }
  const payee = VENDORS[vendor as VendorName];
  if (!payee) return `Unknown vendor: ${String(vendor).slice(0, 40)}`;

  console.log(`[tool] pay_vendor(${vendor}, ${amount_xlm} XLM)`);
  const stroops = Math.round(amount_xlm * 10_000_000);
  const result = await pay(payee, stroops);
  console.log("[wallet]", result.ok ? `ok ${result.hash}` : "not ok");

  if (!result.ok) {
    const summary = describeFailure((result as { reason: string }).reason);
    events.push({ vendor, amount_xlm, ok: false, reason: summary });
    return summary;
  }
  events.push({ vendor, amount_xlm, ok: true, hash: (result as { hash: string }).hash });
  return `Payment succeeded (transaction ${(result as { hash: string }).hash})`;
}

export async function runAgent(history: ChatMessage[]): Promise<RunAgentResult> {
  const messages: Groq.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM },
    ...history,
  ];
  const events: PayVendorEvent[] = [];

  for (let turn = 0; turn < MAX_TURNS; turn++) {
    const res = await client.chat.completions.create({
      model: MODEL,
      messages,
      tools,
      tool_choice: "auto",
    });

    const msg = res.choices[0].message;
    messages.push(msg);

    if (!msg.tool_calls || msg.tool_calls.length === 0) {
      return { reply: msg.content ?? "", events };
    }

    for (const call of msg.tool_calls) {
      let args: any = {};
      try {
        if ("function" in call) args = JSON.parse(call.function.arguments);
      } catch {
        // leave args empty; runTool will reject it
      }
      const name = "function" in call ? call.function.name : "";
      const result = await runTool(name, args, events);
      messages.push({ role: "tool", tool_call_id: call.id, content: result });
    }
  }

  return { reply: "I stopped after too many steps.", events };
}
