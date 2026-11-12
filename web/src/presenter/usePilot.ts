import { useCallback, useEffect, useRef, useState } from "react";

// The slide pilot's brain. It knows which slide is showing, how long each slide
// should stay up, and which slides wait for you (like the live demo).

export type PilotMode = "idle" | "playing" | "paused" | "rehearsing";

export interface Plan {
  durations: number[]; // seconds per slide
  holds: boolean[]; // true = wait for you to press next, instead of auto-advancing
}

const STORAGE_KEY = "cort.pilot.plan.v1";

function loadPlan(defaults: Plan): Plan {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    const n = defaults.durations.length;
    if (
      saved &&
      Array.isArray(saved.durations) &&
      Array.isArray(saved.holds) &&
      saved.durations.length === n &&
      saved.holds.length === n &&
      saved.durations.every((d: unknown) => typeof d === "number" && Number.isFinite(d) && d > 0)
    ) {
      return { durations: saved.durations, holds: saved.holds.map(Boolean) };
    }
  } catch {
    // no saved plan, or storage is blocked: use the defaults
  }
  return defaults;
}

function savePlan(plan: Plan): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
  } catch {
    // storage blocked: the plan still works for this session
  }
}

export function plannedSeconds(plan: Plan): number {
  return plan.durations.reduce((sum, d, i) => sum + (plan.holds[i] ? 0 : d), 0);
}

export function usePilot(count: number, defaults: Plan) {
  const [plan, setPlan] = useState<Plan>(() => loadPlan(defaults));
  const [index, setIndex] = useState(0);
  const [mode, setMode] = useState<PilotMode>("idle");
  const [elapsed, setElapsed] = useState(0); // ms on the current slide
  const [clock, setClock] = useState(0); // ms since the run started
  const [result, setResult] = useState<{ total: number } | null>(null); // summary after a rehearsal
  const marks = useRef<(number | undefined)[]>([]); // ms spent per slide during a rehearsal

  const updatePlan = useCallback((next: Plan) => {
    setPlan(next);
    savePlan(next);
  }, []);

  // Tick while playing or rehearsing.
  useEffect(() => {
    if (mode !== "playing" && mode !== "rehearsing") return undefined;
    let last = performance.now();
    const id = setInterval(() => {
      const now = performance.now();
      const dt = now - last;
      last = now;
      setElapsed((e) => e + dt);
      setClock((c) => c + dt);
    }, 100);
    return () => clearInterval(id);
  }, [mode]);

  const goTo = useCallback(
    (i: number) => {
      setIndex(Math.max(0, Math.min(count - 1, i)));
      setElapsed(0);
    },
    [count]
  );

  // Autopilot: move on when the slide's time is up (unless it is a hold slide).
  useEffect(() => {
    if (mode !== "playing" || plan.holds[index]) return;
    if (elapsed < plan.durations[index] * 1000) return;
    if (index < count - 1) goTo(index + 1);
    else setMode("idle"); // the last slide has had its time: finished
  }, [mode, elapsed, index, plan, count, goTo]);

  const finishRehearsal = useCallback(() => {
    marks.current[index] = elapsed;
    const durations = plan.durations.map((old, i) =>
      marks.current[i] != null ? Math.max(3, Math.round(marks.current[i]! / 1000)) : old
    );
    const next = { ...plan, durations };
    updatePlan(next);
    setMode("idle");
    setResult({ total: plannedSeconds(next) });
  }, [index, elapsed, plan, updatePlan]);

  const next = useCallback(() => {
    if (mode === "rehearsing") {
      if (index >= count - 1) {
        finishRehearsal();
        return;
      }
      marks.current[index] = elapsed;
    }
    goTo(index + 1);
  }, [mode, index, count, elapsed, goTo, finishRehearsal]);

  const prev = useCallback(() => {
    if (mode === "rehearsing") marks.current[index - 1] = undefined;
    goTo(index - 1);
  }, [mode, index, goTo]);

  const startRehearsal = useCallback(() => {
    marks.current = [];
    setResult(null);
    setClock(0);
    goTo(0);
    setMode("rehearsing");
  }, [goTo]);

  const play = useCallback(() => {
    setResult(null);
    if (index >= count - 1) {
      goTo(0);
      setClock(0);
    } else if (index === 0) {
      setClock(0);
    }
    setMode("playing");
  }, [index, count, goTo]);

  const pause = useCallback(() => setMode("paused"), []);
  const resume = useCallback(() => setMode("playing"), []);

  const stop = useCallback(() => {
    setMode("idle");
    setResult(null);
    goTo(0);
  }, [goTo]);

  const resetPlan = useCallback(() => updatePlan(defaults), [defaults, updatePlan]);

  return {
    plan,
    updatePlan,
    resetPlan,
    index,
    mode,
    elapsed,
    clock,
    result,
    next,
    prev,
    goTo,
    play,
    pause,
    resume,
    stop,
    startRehearsal,
    finishRehearsal,
  };
}

export type Pilot = ReturnType<typeof usePilot>;
