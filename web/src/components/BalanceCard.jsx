import { fmt, timeOf } from "../format.js";
import { RefreshIcon } from "./Icons.jsx";

export default function BalanceCard({ xlm, status, updatedAt, delta, refreshing, onRefresh }) {
  let amount;
  if (xlm !== null) {
    amount = (
      <>
        <span className="balance-num">{fmt(xlm)}</span>
        <span className="balance-unit">XLM</span>
      </>
    );
  } else if (status === "down") {
    amount = <span className="balance-num">Unavailable</span>;
  } else {
    amount = <span className="skeleton" />;
  }

  return (
    <section className="card balance-card">
      <div className="balance-top">
        <h2>Wallet balance</h2>
        <button
          className={"icon-btn" + (refreshing ? " spin" : "")}
          type="button"
          onClick={onRefresh}
          aria-label="Refresh balance"
          title="Refresh balance"
        >
          <RefreshIcon />
        </button>
      </div>
      <div className="balance-row">
        {amount}
        {delta !== null && (
          <span className={"delta " + (delta > 0 ? "pos" : "neg")}>
            {delta > 0 ? "+" : "−"}
            {fmt(Math.abs(delta))}
          </span>
        )}
      </div>
      <p className="updated">
        {updatedAt ? `Updated ${timeOf(updatedAt)}` : "Held by the wallet contract"}
      </p>
    </section>
  );
}
