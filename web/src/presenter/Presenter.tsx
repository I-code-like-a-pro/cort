import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { DEFAULT_PLAN, SLIDES } from "./slides.js";
import { plannedSeconds, usePilot } from "./usePilot.js";
import type { Plan, Pilot } from "./usePilot.js";

function mmss(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

// Draws the 1920 x 1080 slide and scales it to fit whatever screen it is on.
function Stage({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => setScale(Math.min(el.clientWidth / 1920, el.clientHeight / 1080));
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="stage" ref={ref}>
      <div className="canvas" style={{ transform: `translate(-50%, -50%) scale(${scale})` }}>
        {children}
      </div>
    </div>
  );
}

function PlanEditor({ pilot, onClose }: { pilot: Pilot; onClose: () => void }) {
  const { plan, updatePlan, resetPlan } = pilot;

  function setDuration(i: number, value: string) {
    const n = Math.max(1, Math.min(600, Number(value) || 1));
    updatePlan({ ...plan, durations: plan.durations.map((d, k) => (k === i ? n : d)) });
  }
  function setHold(i: number, value: boolean) {
    updatePlan({ ...plan, holds: plan.holds.map((h, k) => (k === i ? value : h)) });
  }

  return (
    <div className="modal" role="dialog" aria-label="Slide timings">
      <div className="panel">
        <div className="panel-head">
          <h2>Slide timings</h2>
          <button type="button" onClick={onClose}>
            Close
          </button>
        </div>
        <p className="hint">
          Seconds each slide stays up. A slide marked “wait” holds until you press the right arrow, which is right
          for the live demo.
        </p>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Slide</th>
              <th>Seconds</th>
              <th>Wait for me</th>
            </tr>
          </thead>
          <tbody>
            {SLIDES.map((slide, i) => (
              <tr key={slide.id}>
                <td>{i + 1}</td>
                <td>{slide.name}</td>
                <td>
                  <input
                    type="number"
                    min="1"
                    max="600"
                    value={plan.durations[i]}
                    onChange={(e) => setDuration(i, e.target.value)}
                    aria-label={`Seconds for ${slide.name}`}
                  />
                </td>
                <td>
                  <input
                    type="checkbox"
                    checked={plan.holds[i]}
                    onChange={(e) => setHold(i, e.target.checked)}
                    aria-label={`${slide.name} waits for me`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="panel-foot">
          <span>Timed total (without waits): {mmss(plannedSeconds(plan))}</span>
          <button type="button" onClick={resetPlan}>
            Reset to defaults
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Presenter() {
  const pilot = usePilot(SLIDES.length, DEFAULT_PLAN);
  const { plan, index, mode, elapsed, clock, result } = pilot;
  const [showPlan, setShowPlan] = useState(false);
  const [hideBar, setHideBar] = useState(false);

  // Keep the keyboard handler pointing at the latest state.
  const latest = useRef(pilot);
  latest.current = pilot;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = e.target instanceof HTMLElement ? e.target.tagName : "";
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const p = latest.current;
      const onButton = tag === "BUTTON";

      switch (e.key) {
        case " ":
          if (onButton) return;
          e.preventDefault();
          if (p.mode === "rehearsing") p.next();
          else if (p.mode === "playing") p.pause();
          else if (p.mode === "paused") p.resume();
          else p.play();
          break;
        case "ArrowRight":
        case "PageDown":
          e.preventDefault();
          p.next();
          break;
        case "ArrowLeft":
        case "PageUp":
          e.preventDefault();
          p.prev();
          break;
        case "Home":
          e.preventDefault();
          p.stop();
          break;
        case "r":
        case "R":
          if (p.mode === "rehearsing") p.finishRehearsal();
          else p.startRehearsal();
          break;
        case "t":
        case "T":
          setShowPlan((v) => !v);
          break;
        case "h":
        case "H":
          setHideBar((v) => !v);
          break;
        case "f":
        case "F":
          if (document.fullscreenElement) document.exitFullscreen();
          else document.documentElement.requestFullscreen?.();
          break;
        case "Escape":
          if (showPlan) setShowPlan(false);
          else p.stop();
          break;
        default:
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showPlan]);

  const View = SLIDES[index].view;
  const holding = mode === "playing" && plan.holds[index];
  const duration = plan.durations[index];
  const remaining = Math.max(0, duration - elapsed / 1000);
  const progress = mode === "playing" && !plan.holds[index] ? Math.min(100, (elapsed / (duration * 1000)) * 100) : 0;

  let label = "Ready";
  let timer = `Timed total ${mmss(plannedSeconds(plan))}`;
  if (mode === "playing") {
    label = "Autopilot";
    timer = holding ? "Waiting for you. Press → to continue" : `Next slide in ${Math.ceil(remaining)}s`;
  } else if (mode === "paused") {
    label = "Paused";
    timer = "Press Space to resume";
  } else if (mode === "rehearsing") {
    label = "Rehearsing";
    timer = `Run time ${mmss(clock / 1000)} · this slide ${mmss(elapsed / 1000)}`;
  } else if (result) {
    label = "Timings saved";
    timer = `Timed total ${mmss(result.total)}`;
  }

  return (
    <div className={"pilot " + mode}>
      <Stage>
        <View key={SLIDES[index].id} />
      </Stage>

      <div className="progress" style={{ width: `${progress}%` }} />

      {mode !== "idle" && !hideBar && (
        <div className={"chip " + mode}>
          {label} · {timer}
        </div>
      )}

      {!hideBar && (
        <div className="bar" role="toolbar" aria-label="Slide pilot controls">
          <div className="bar-left">
            <span className="count">
              {index + 1} / {SLIDES.length}
            </span>
            <span className={"state " + mode}>{label}</span>
            <span className="timer">{timer}</span>
          </div>
          <div className="bar-right">
            {mode === "playing" ? (
              <button type="button" onClick={pilot.pause}>
                Pause
              </button>
            ) : mode === "paused" ? (
              <button type="button" onClick={pilot.resume}>
                Resume
              </button>
            ) : mode === "rehearsing" ? null : (
              <button type="button" className="primary" onClick={pilot.play}>
                Start autopilot
              </button>
            )}
            {mode === "rehearsing" ? (
              <button type="button" className="primary" onClick={pilot.finishRehearsal}>
                Finish and save
              </button>
            ) : (
              <button type="button" onClick={pilot.startRehearsal}>
                Rehearse
              </button>
            )}
            <button type="button" onClick={() => setShowPlan(true)}>
              Timings
            </button>
            <button type="button" onClick={() => document.documentElement.requestFullscreen?.()}>
              Fullscreen
            </button>
          </div>
        </div>
      )}

      {mode === "idle" && !hideBar && (
        <p className="keys">
          Space start/pause · → next · ← back · R rehearse · T timings · F fullscreen · H hide bar · Esc stop
        </p>
      )}

      {showPlan && <PlanEditor pilot={pilot} onClose={() => setShowPlan(false)} />}
    </div>
  );
}
