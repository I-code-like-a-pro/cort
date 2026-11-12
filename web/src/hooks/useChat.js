import { useCallback, useRef, useState } from "react";
import { sendChat } from "../api.js";

// A conversation is a list of items:
//   { id, kind: "user",  text }
//   { id, kind: "agent", text, events, time }   events = payment attempts
//   { id, kind: "error", text, detail }

let counter = 0;
const nextId = () => ++counter;

function toHistory(items) {
  return items
    .filter((item) => item.kind === "user" || item.kind === "agent")
    .map((item) => ({
      role: item.kind === "user" ? "user" : "assistant",
      content: item.text,
    }));
}

export function useChat({ onSettled } = {}) {
  const [items, setItems] = useState([]);
  const [pending, setPending] = useState(false);

  // Refs hold the latest values so the callbacks below stay stable.
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const settledRef = useRef(onSettled);
  settledRef.current = onSettled;
  const busyRef = useRef(false);

  const run = useCallback(async (base) => {
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
    } catch (err) {
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
    (text) => {
      const clean = text.trim();
      if (!clean || busyRef.current) return false;
      const base = [
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
