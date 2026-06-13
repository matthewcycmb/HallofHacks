"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

function SearchInner() {
  const router = useRouter();
  const params = useSearchParams();
  const q = params.get("q") ?? "";
  const [open, setOpen] = useState(q !== "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  function commit(value: string) {
    const next = new URLSearchParams(params.toString());
    if (value.trim()) next.set("q", value.trim());
    else next.delete("q");
    router.replace(`/?${next.toString()}`);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search"
        className="inline-flex items-center gap-2 rounded-full py-2 text-[15px] font-medium text-ink-soft transition-colors hover:text-ink"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <span className="hidden sm:inline">Search</span>
      </button>
    );
  }

  return (
    <input
      ref={inputRef}
      defaultValue={q}
      placeholder="Search projects…"
      onChange={(e) => commit(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          commit("");
          setOpen(false);
        }
      }}
      onBlur={(e) => {
        if (!e.target.value.trim()) setOpen(false);
      }}
      // 16px floor on phones: anything smaller makes iOS Safari auto-zoom into the field.
      className="w-36 rounded-full bg-paper-2 px-3.5 py-1.5 text-[16px] text-ink outline-none placeholder:text-ink-soft sm:w-52 sm:text-[14px]"
    />
  );
}

/** Header search: expands to an input that live-filters the feed via ?q=. */
export default function HeaderSearch() {
  return (
    <Suspense fallback={null}>
      <SearchInner />
    </Suspense>
  );
}
