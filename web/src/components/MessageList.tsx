import { useEffect, useRef, type ReactNode } from "react";
import TxnCard from "./TxnCard.js";
import type { ConversationItem } from "../hooks/useChat.js";

const PROMPTS = [
  {
    title: "Approved vendor, under the limit",
    text: "Buy the market report from DataCo. The price is 2 XLM.",
  },
  {
    title: "Vendor the owner never approved",
    text: "Pay ShadyCorp 3 XLM for the urgent invoice.",
  },
  {
    title: "Approved vendor, over the limit",
    text: "Pay DataCo 50 XLM, the whole annual contract up front.",
  },
];

function EmptyState({ onPick }: { onPick: (text: string) => void }) {
  return (
    <section className="empty">
      <h3>Pay a vendor</h3>
      <p>Tell the agent who to pay and how much. Try each case to see how the wallet responds.</p>
      <div className="prompts">
        {PROMPTS.map((prompt) => (
          <button key={prompt.title} className="prompt" type="button" onClick={() => onPick(prompt.text)}>
            <b>{prompt.title}</b>
            <span>{prompt.text}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function AgentRow({ children }: { children: ReactNode }) {
  return (
    <div className="row agent">
      <div className="avatar" aria-hidden="true">A</div>
      <div className="stack">{children}</div>
    </div>
  );
}

function Message({ item, onRetry }: { item: ConversationItem; onRetry: () => void }) {
  if (item.kind === "user") {
    return (
      <div className="row user">
        <div className="bubble">{item.text}</div>
      </div>
    );
  }

  if (item.kind === "error") {
    return (
      <AgentRow>
        <div className="bubble error">
          <div>{item.text}</div>
          {item.detail && <span className="detail">{item.detail}</span>}
          <button className="btn retry" type="button" onClick={onRetry}>
            Try again
          </button>
        </div>
      </AgentRow>
    );
  }

  return (
    <AgentRow>
      <div className="bubble">{item.text}</div>
      {item.events.map((ev, index) => (
        <TxnCard key={index} ev={ev} />
      ))}
    </AgentRow>
  );
}

interface MessageListProps {
  items: ConversationItem[];
  pending: boolean;
  onRetry: () => void;
  onPick: (text: string) => boolean;
}

export default function MessageList({ items, pending, onRetry, onPick }: MessageListProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Keep the newest message in view.
  useEffect(() => {
    const el = ref.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [items, pending]);

  return (
    <div className="log" ref={ref} role="log" aria-live="polite" aria-label="Conversation">
      {items.length === 0 && !pending && <EmptyState onPick={onPick} />}
      {items.map((item) => (
        <Message key={item.id} item={item} onRetry={onRetry} />
      ))}
      {pending && (
        <AgentRow>
          <div className="bubble typing" aria-label="Agent is working">
            <i />
            <i />
            <i />
          </div>
        </AgentRow>
      )}
    </div>
  );
}
