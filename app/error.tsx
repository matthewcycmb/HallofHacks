"use client";

import Link from "next/link";

/** Route-level error boundary — renders inside the layout (header/footer stay). */
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto mt-12 max-w-md rounded-[22px] bg-paper-2 p-10 text-center">
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-gold">Error</p>
      <p className="mt-2 font-display text-3xl">Something broke.</p>
      <p className="mt-2 text-sm text-ink-soft">
        A glitch on our end. Try again, or head back to the feed.
      </p>
      <div className="mt-5 flex justify-center gap-2">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-ink px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.1em] text-paper transition-colors hover:bg-gold"
        >
          Try again
        </button>
        <Link
          href="/feed"
          className="rounded-full border border-line px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-soft transition-colors hover:text-ink"
        >
          Back to the feed
        </Link>
      </div>
    </div>
  );
}
