"use client";

import { useEffect, useState } from "react";
import { TOAST_EVENT } from "@/lib/toast";

/** Bottom-center transient toast. Listens for the `hoh:toast` event, auto-dismisses. */
export default function Toaster() {
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    function onToast(e: Event) {
      const message = (e as CustomEvent<{ message?: string }>).detail?.message;
      if (!message) return;
      setMsg(message);
      clearTimeout(timer);
      timer = setTimeout(() => setMsg(null), 2200);
    }
    window.addEventListener(TOAST_EVENT, onToast);
    return () => {
      window.removeEventListener(TOAST_EVENT, onToast);
      clearTimeout(timer);
    };
  }, []);

  if (!msg) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex justify-center px-4">
      <div className="toast-in flex items-center gap-2 rounded-full border border-[var(--nf-nline)] bg-[#1f1f24] px-4 py-2.5 text-[13.5px] font-medium text-ink shadow-[0_12px_34px_-10px_rgba(0,0,0,0.7)]">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-gold" aria-hidden>
          <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
        </svg>
        {msg}
      </div>
    </div>
  );
}
