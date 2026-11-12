import Composer from "./Composer.jsx";
import MessageList from "./MessageList.jsx";

export default function ChatPanel({ chat, onOpenMore }) {
  return (
    <main className="chat card">
      <div className="chat-head">
        <div>
          <h1>Purchasing agent</h1>
          <p>It asks the wallet to pay. The contract decides whether it can.</p>
        </div>
        <div className="head-actions">
          <button className="btn more-toggle" type="button" onClick={onOpenMore}>
            Details
          </button>
          <button className="btn" type="button" onClick={chat.reset} disabled={chat.pending}>
            New chat
          </button>
        </div>
      </div>

      <MessageList
        items={chat.items}
        pending={chat.pending}
        onRetry={chat.retry}
        onPick={chat.send}
      />

      <Composer disabled={chat.pending} onSend={chat.send} />
    </main>
  );
}
