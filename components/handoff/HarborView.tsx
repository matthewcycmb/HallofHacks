"use client";

import { useEffect, useMemo, useState } from "react";
import type { Project } from "@/lib/types";
import { toCard, type HandoffCard } from "@/lib/handoff";
import { useCollections } from "@/lib/collections";
import { useVisitOffset, rotateBy } from "@/lib/feed-rotation";
import DetailConsole from "./DetailConsole";
import NightCard, { GroupPill } from "./NightCard";

function groupByEvent(cards: HandoffCard[]): [string, HandoffCard[]][] {
  const groups = new Map<string, HandoffCard[]>();
  for (const c of cards) {
    if (!groups.has(c.event)) groups.set(c.event, []);
    groups.get(c.event)!.push(c);
  }
  return [...groups.entries()];
}

/**
 * Harbor: scannable card feed left, sticky detail console right on desktop.
 * On mobile there's no room for a side console, so a tap expands the detail
 * box inline right under the card (keeps the visitor in the scroll).
 */
export default function HarborView({ projects }: { projects: Project[] }) {
  const cards = useMemo(() => projects.map(toCard), [projects]);
  const wings = useMemo(() => groupByEvent(cards), [cards]);
  const { savedSlugs } = useCollections();

  // Feed freshness: rotate which hackathon leads on each return visit. The hook
  // returns 0 (the curated, featured-first order) during SSR + hydration so the
  // server HTML always matches, then the resolved client offset — reordering the
  // groups under returning visitors once. See lib/feed-rotation.
  const visitOffset = useVisitOffset();
  const wingsView = useMemo(() => rotateBy(wings, visitOffset), [wings, visitOffset]);

  // Desktop: sticky aside. Defaults to the first card of the (rotated) feed until
  // the visitor picks one — deriving it means rotation and filtering update the
  // console for free, and it's never empty.
  const [selected, setSelected] = useState<HandoffCard | null>(null);
  const firstCard = wingsView[0]?.[1][0] ?? null;
  const activeSelected = selected ?? firstCard;
  // Mobile: any number of cards can be expanded inline at once — tapping a new
  // one leaves the others open. Tracked by slug; collapsed until the first tap.
  const [expandedSlugs, setExpandedSlugs] = useState<Set<string>>(() => new Set());

  // Mirror the CSS exactly: the layout switches at min-[901px], so mobile is
  // "not (min-width: 901px)". Using one query for both state and taps avoids the
  // dead-click desync at fractional widths near 900px.
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 901px)");
    const update = () => setIsMobile(!mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  function open(card: HandoffCard) {
    if (!isMobile) {
      setSelected(card);
      return;
    }
    // Toggle this card; the others stay as they are.
    setExpandedSlugs((prev) => {
      const next = new Set(prev);
      if (next.has(card.slug)) next.delete(card.slug);
      else next.add(card.slug);
      return next;
    });
  }

  // Filtering (pool change) clears the manual selection so the console falls
  // back to the first card of the new results — render-time state adjustment,
  // per React docs, not an effect.
  const [prevCards, setPrevCards] = useState(cards);
  if (prevCards !== cards) {
    setPrevCards(cards);
    setSelected(null);
    setExpandedSlugs(new Set());
  }

  return (
    <div>
      <div className="mx-auto max-w-[1040px] px-[clamp(20px,4vw,48px)] pb-[140px] pt-12">
        {/* page intro — compact on phones so projects make the first screen */}
        <div className="mb-5 flex flex-col gap-2 border-b border-[var(--nf-nline)] px-0.5 pb-5 sm:mb-8 sm:pb-6">
          <h1 className="text-[28px] font-bold tracking-[-0.015em] sm:text-[40px]">
            Hackathon Projects
          </h1>
          {/* Shorter on phones (fits two lines), fuller on desktop. */}
          <p className="max-w-[64ch] text-[14.5px] leading-[1.55] text-[var(--nf-muted)] sm:hidden">
            Browse the projects that won the world&rsquo;s biggest hackathons.
          </p>
          <p className="hidden max-w-[64ch] text-[17px] leading-[1.6] text-[var(--nf-muted)] sm:block">
            Browse the projects that won the world&rsquo;s biggest hackathons,
            <br /> watch their demos, and save the ideas that inspire you.
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13.5px] text-[var(--nf-muted)] sm:gap-x-5 sm:gap-y-2 sm:text-[16px]">
            <span className="inline-flex items-center gap-1.5">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M6 9a6 6 0 0 0 12 0V3H6v6Z" />
                <path d="M6 5H3v2a4 4 0 0 0 4 4M18 5h3v2a4 4 0 0 1-4 4M12 15v4M8 21h8" />
              </svg>
              <span className="font-semibold text-[var(--nf-text)]">{projects.length}+</span>{" "}
              Winning Projects
            </span>
            <span className="inline-flex items-center gap-1.5">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <rect x="3" y="4" width="18" height="18" rx="3" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              <span className="font-semibold text-[var(--nf-text)]">{wings.length}</span>{" "}
              {wings.length === 1 ? "Hackathon" : "Hackathons"}
            </span>
          </div>
        </div>
        <div className="grid items-start gap-[clamp(26px,4vw,56px)] min-[901px]:grid-cols-[minmax(340px,430px)_1fr]">
          {/* feed */}
          <div>
            {wingsView.map(([eventName, items]) => (
              <section key={eventName} className="mb-[34px]">
                <GroupPill event={eventName} count={items.length} />
                {items.map((card) => (
                  <div key={card.uid}>
                    <NightCard
                      card={card}
                      compact
                      selected={
                        isMobile ? expandedSlugs.has(card.slug) : activeSelected?.slug === card.slug
                      }
                      onSelect={() => open(card)}
                    />
                    {/* mobile inline expansion — multiple can be open at once */}
                    {expandedSlugs.has(card.slug) && (
                      <div className="expand-in mb-3 flex flex-col items-start gap-3 rounded-[20px] border border-[var(--nf-nline)] bg-[var(--nf-card)] p-5 backdrop-blur-[14px] min-[901px]:hidden">
                        <DetailConsole card={card} saved={savedSlugs.has(card.slug)} />
                      </div>
                    )}
                  </div>
                ))}
              </section>
            ))}
          </div>

          {/* sticky detail console — desktop only, sized to fit one screen */}
          {activeSelected && (
            <aside className="sticky top-8 mt-7 hidden flex-col items-start gap-3 rounded-[20px] border border-[var(--nf-nline)] bg-[var(--nf-card)] p-5 backdrop-blur-[14px] min-[901px]:flex">
              <DetailConsole card={activeSelected} saved={savedSlugs.has(activeSelected.slug)} />
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
