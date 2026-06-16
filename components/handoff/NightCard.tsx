"use client";

import { useEffect, useRef, useState } from "react";
import type { HandoffCard } from "@/lib/handoff";
import Cover from "./Cover";

export const TROPHY = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-none" aria-hidden>
    <path d="M6 9a6 6 0 0 0 12 0V3H6v6Z" />
    <path d="M6 5H3v2a4 4 0 0 0 4 4M18 5h3v2a4 4 0 0 1-4 4M12 15v4M8 21h8" />
  </svg>
);

export const CAL = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-none" aria-hidden>
    <rect x="3" y="4" width="18" height="18" rx="3" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);

export const PIN = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-none" aria-hidden>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export function PrizeLine({ card, className = "" }: { card: HandoffCard; className?: string }) {
  return (
    <div
      className={`flex max-w-full items-center gap-[7px] text-xs font-semibold tracking-[0.02em] ${
        card.tier === "grand" ? "text-[var(--nf-accent)]" : "text-[var(--nf-muted)]"
      } ${className}`}
    >
      {TROPHY}
      <span className="overflow-hidden text-ellipsis whitespace-nowrap">{card.prize}</span>
    </div>
  );
}

export function MetaRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 text-[13px] text-[var(--nf-muted)]">
      {icon}
      <span className="whitespace-nowrap">{text}</span>
    </div>
  );
}

/**
 * Luma-style group label: plain text at rest; while you scroll through the
 * group it sticks to the top and becomes a floating pill overlapping the
 * cards (stuck-state detected via a sentinel above the sticky element).
 */
export function GroupPill({ event, count }: { event: string; count: number }) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    // Observe against the real scroll container (<main overflow-y-auto>), not the
    // viewport — on mobile the viewport resizes with the browser toolbar, which
    // desyncs a viewport-rooted observer and makes the pill flicker. The -8px
    // rootMargin matches the sticky `top-2` so the floating style flips exactly
    // when the pill pins, not 8px later.
    const root = el.closest("main");
    const io = new IntersectionObserver(
      ([entry]) => setStuck(!entry.isIntersecting && entry.boundingClientRect.top < 8),
      { root, rootMargin: "-8px 0px 0px 0px", threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <>
      <div ref={sentinelRef} className="h-px w-px" aria-hidden />
      <div className="sticky top-2 z-10 flex pb-2">
        <div
          className={`flex items-center gap-2.5 rounded-full py-2 transition-all duration-200 ${
            stuck
              ? "border border-[var(--nf-nline)] bg-[#222228] pl-3.5 pr-4 shadow-[0_10px_28px_-12px_rgba(0,0,0,0.85)]"
              : "border border-transparent bg-transparent px-0.5"
          }`}
        >
          {stuck && <span className="h-2 w-2 rounded-full bg-[var(--nf-muted)]" aria-hidden />}
          <b className="whitespace-nowrap text-[15px] font-bold">{event}</b>
          <span className="whitespace-nowrap text-[13px] text-[var(--nf-muted)]">
            {count} {count === 1 ? "winner" : "winners"}
          </span>
        </div>
      </div>
    </>
  );
}

/** The night-feed card language: prize line, title, optional blurb, meta rows, 96px thumb. */
export default function NightCard({
  card,
  compact = false,
  selected = false,
  onSelect,
}: {
  card: HandoffCard;
  compact?: boolean;
  selected?: boolean;
  onSelect?: () => void;
}) {
  return (
    <article
      className={`nf-card${selected ? " sel" : ""} ${onSelect ? "cursor-pointer" : ""}`}
      onClick={onSelect}
    >
      <div className="flex min-w-0 flex-col items-start gap-[7px]">
        <PrizeLine card={card} />
        <h3 className="text-[19px] font-bold leading-[1.2] tracking-[-0.01em]">{card.name}</h3>
        {!compact && (
          <p className="line-clamp-2 text-sm leading-[1.5] text-[var(--nf-muted)] [text-wrap:pretty]">
            {card.blurb}
          </p>
        )}
        <MetaRow icon={CAL} text={card.event} />
        <MetaRow icon={PIN} text={card.tag} />
      </div>
      <div className="relative h-24 w-24 self-center overflow-hidden rounded-xl border border-[var(--nf-nline)]">
        <Cover card={card} />
      </div>
    </article>
  );
}
