"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";

/**
 * Header auth slot. Logged out (and during the initial session fetch) → a
 * "Sign in" link, which is also the stable SSR/first-paint output (no
 * hydration mismatch). Once authenticated, swaps to a monochrome avatar with a
 * dropdown — reusing the outside-click/Escape pattern from SaveMenu, not a modal.
 */
export default function AccountWidget() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (status !== "authenticated" || !session?.user) {
    return (
      <Link
        href="/signup"
        className="whitespace-nowrap text-[15px] font-medium text-ink-soft transition-colors hover:text-ink"
      >
        Sign in
      </Link>
    );
  }

  const { name, email, image } = session.user;
  const initial = (name ?? email ?? "?").trim().charAt(0).toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Account menu"
        aria-expanded={open}
        className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-line bg-paper-2 text-[13px] font-bold text-ink-soft transition-transform hover:scale-105"
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt=""
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          initial
        )}
      </button>
      {open && (
        <div className="modal-in absolute right-0 top-full z-30 mt-2 w-56 rounded-2xl border border-line bg-paper p-2 shadow-[0_12px_40px_-8px_rgba(0,0,0,0.5)]">
          <div className="border-b border-line px-3 pb-2.5 pt-1.5">
            {name && <p className="truncate text-sm font-bold">{name}</p>}
            {email && <p className="truncate text-xs text-ink-soft">{email}</p>}
          </div>
          <Link
            href="/collections"
            onClick={() => setOpen(false)}
            className="mt-1 flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium hover:bg-paper-2"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
            </svg>
            My collection
          </Link>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-ink-soft hover:bg-paper-2 hover:text-ink"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
