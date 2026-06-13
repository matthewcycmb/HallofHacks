"use client";

import Link from "next/link";

/** Header link: bookmark + "My collection" → /collections. */
export default function HeaderSaves() {
  return (
    <Link
      href="/collections"
      className="inline-flex items-center gap-2 rounded-full py-2 text-[15px] font-medium text-ink-soft transition-colors hover:text-ink"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
      </svg>{" "}
      <span className="sr-only sm:not-sr-only">My collection</span>
    </Link>
  );
}
