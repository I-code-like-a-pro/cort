import { ShieldIcon } from "./Icons.js";
import type { BalanceStatus } from "../hooks/useBalance.js";

const LABELS: Record<BalanceStatus, string> = { live: "Connected", down: "Offline", loading: "Connecting" };

export default function Header({ status }: { status: BalanceStatus }) {
  return (
    <header className="topbar">
      <div className="brand">
        <span className="logo">
          <ShieldIcon />
        </span>
        Cort
      </div>
      <div className="topbar-right">
        <span className="badge-net">Stellar testnet</span>
        <span className={"status" + (status === "live" ? " live" : status === "down" ? " down" : "")}>
          <i className="dot" />
          <span>{LABELS[status]}</span>
        </span>
      </div>
    </header>
  );
}
