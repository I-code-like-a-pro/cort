import { useCallback, useEffect, useRef, useState } from "react";
import { fetchBalance } from "../api.js";

export type BalanceStatus = "loading" | "live" | "down";

// Reads the wallet balance from the server and tracks how it changed.
export function useBalance() {
  const [xlm, setXlm] = useState<number | null>(null);
  const [status, setStatus] = useState<BalanceStatus>("loading");
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [delta, setDelta] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const last = useRef<number | null>(null);
  const deltaTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlight = useRef(false);

  const refresh = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setRefreshing(true);
    try {
      const value = await fetchBalance();
      const previous = last.current;
      last.current = value;
      setXlm(value);
      setStatus("live");
      setUpdatedAt(new Date());
      if (previous !== null && Math.abs(value - previous) > 1e-9) {
        setDelta(value - previous);
        if (deltaTimer.current) clearTimeout(deltaTimer.current);
        deltaTimer.current = setTimeout(() => setDelta(null), 6000);
      }
    } catch {
      setStatus("down");
    } finally {
      inFlight.current = false;
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      if (deltaTimer.current) clearTimeout(deltaTimer.current);
    };
  }, [refresh]);

  return { xlm, status, updatedAt, delta, refreshing, refresh };
}
