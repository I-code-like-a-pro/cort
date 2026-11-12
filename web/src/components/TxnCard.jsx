import { fmt, isTxHash } from "../format.js";
import { useToast } from "../toast.jsx";

// One payment attempt, shown inside the agent's reply.
export default function TxnCard({ ev }) {
  const toast = useToast();

  async function copy() {
    try {
      await navigator.clipboard.writeText(ev.hash);
      toast("Transaction ID copied");
    } catch {
      toast("Could not copy");
    }
  }

  return (
    <div className={"txn " + (ev.ok ? "ok" : "bad")}>
      <div className="txn-top">
        <span className="pill">{ev.ok ? "Sent" : "Refused"}</span>
        <span className="txn-amt">{fmt(ev.amount_xlm)} XLM</span>
      </div>
      <div className="txn-to">
        To <b>{ev.vendor}</b>
      </div>
      {ev.ok && isTxHash(ev.hash) && (
        <div className="txn-actions">
          <a
            className="link"
            href={`https://stellar.expert/explorer/testnet/tx/${ev.hash}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View transaction
          </a>
          <button className="link" type="button" onClick={copy}>
            Copy ID
          </button>
        </div>
      )}
      {!ev.ok && (
        <div className="txn-reason">{ev.reason || "The contract rejected this payment."}</div>
      )}
    </div>
  );
}
