import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

type ShowToast = (text: string) => void;

const ToastContext = createContext<ShowToast>(() => {});

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback<ShowToast>((text) => {
    setMessage(text);
    setVisible(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setVisible(false), 1800);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className={"toast" + (visible ? " show" : "")} role="status" aria-live="polite">
        {message}
      </div>
    </ToastContext.Provider>
  );
}
