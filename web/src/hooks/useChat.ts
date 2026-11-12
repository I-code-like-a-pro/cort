import { useCallback, useRef, useState } from "react";
import { sendChat, type ChatMessage, type PayVendorEvent } from "../api.js";

// A conversation is a list of items:
export interface UserItem {
  id: number;
  kind: "user";
  text: string;
}
export interface AgentItem {
  id: number;
  kind: "agent";
  text: string;
  events: PayVendorEvent[];
  time: Date;
}
export interface ErrorItem {
  id: number;
  kind: "error";
  text: string;
  detail?: string;
}
export type ConversationItem = UserItem | AgentItem | ErrorItem;

let counter = 0;
const nextId = () => ++counter;

function toHistory(items: ConversationItem[]): ChatMessage[] {
  return items
    .filter((item): item is UserItem | AgentItem => item.kind === "user" || item.kind === "agent")
    .map((item) => ({
      role: item.kind === "user" ? ("user" as const) : ("assistant" as const),
      content: item.text,
    }));
}

export function useChat({ onSettled }: { onSettled?: () => void } = {}) {
  const [items, setItems] = useState<ConversationItem[]>([]);
  const [pending, setPending] = useState(false);

  // Refs hold the latest values so the callbacks below stay stable.
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const settledRef = useRef(onSettled);
  settledRef.current = onSettled;
  const busyRef = useRef(false);

  const run = useCallback(async (base: ConversationItem[]) => {
    busyRef.current = true;
    setPending(true);
    try {
      const data = await sendChat(toHistory(base));
      setItems([
        ...base,
        {
          id: nextId(),
          kind: "agent",
          text: data.reply || "(no reply)",
          events: data.events || [],
          time: new Date(),
        },
      ]);
    } catch (err: any) {
      const unreachable = err instanceof TypeError; // fetch itself failed
      setItems([
        ...base,
        {
          id: nextId(),
          kind: "error",
          text: unreachable
            ? "Could not reach the server. Check that it is still running."
            : err.message || "Something went wrong.",
          detail: err.detail,
        },
      ]);
    } finally {
      busyRef.current = false;
      setPending(false);
      settledRef.current?.();
    }
  }, []);

  // Returns true if the message was accepted (so the composer can clear itself).
  const send = useCallback(
    (text: string) => {
      const clean = text.trim();
      if (!clean || busyRef.current) return false;
      const base: ConversationItem[] = [
        ...itemsRef.current.filter((item) => item.kind !== "error"),
        { id: nextId(), kind: "user", text: clean },
      ];
      setItems(base);
      run(base);
      return true;
    },
    [run]
  );

  const retry = useCallback(() => {
    if (busyRef.current) return;
    const base = itemsRef.current.filter((item) => item.kind !== "error");
    setItems(base);
    run(base);
  }, [run]);

  const reset = useCallback(() => {
    if (!busyRef.current) setItems([]);
  }, []);

  return { items, pending, send, retry, reset };
}

export type Chat = ReturnType<typeof useChat>;
