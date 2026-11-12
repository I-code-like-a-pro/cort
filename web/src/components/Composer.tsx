import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowUpIcon } from "./Icons.js";

interface ComposerProps {
  disabled: boolean;
  onSend: (text: string) => boolean;
}

export default function Composer({ disabled, onSend }: ComposerProps) {
  const [value, setValue] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  // Grow the box with its content, up to a limit.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 140) + "px";
  }, [value]);

  // Give focus back after the agent finishes.
  useEffect(() => {
    if (!disabled) ref.current?.focus();
  }, [disabled]);

  function submit() {
    if (onSend(value)) setValue("");
  }

  return (
    <div className="composer-wrap">
      <form
        className="composer"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <textarea
          ref={ref}
          rows={1}
          maxLength={500}
          value={value}
          disabled={disabled}
          placeholder="Who should be paid, and how much?"
          aria-label="Message to the agent"
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              submit();
            }
          }}
        />
        <button className="send" type="submit" aria-label="Send message" disabled={disabled || !value.trim()}>
          <ArrowUpIcon />
        </button>
      </form>
      <p className="hint">Enter to send, Shift+Enter for a new line</p>
    </div>
  );
}
