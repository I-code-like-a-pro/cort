import { useCallback, useEffect, useRef, useState } from "react";
import { fetchBalance } from "../api.js";

// Reads the wallet balance from the server and tracks how it changed.
export function useBalance() {
  const [xlm, setXlm] = useState(null);
  const [status, setStatus] = useState("loading"); // "loading" | "live" | "down"
  const [updatedAt, setUpdatedAt] = useState(null);
  const [delta, setDelta] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const last = useRef(null);
  const deltaTimer = useRef(null);
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
        clearTimeout(deltaTimer.current);
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
      clearTimeout(deltaTimer.current);
    };
  }, [refresh]);

  return { xlm, status, updatedAt, delta, refreshing, refresh };
}
