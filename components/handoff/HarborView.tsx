"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Project } from "@/lib/types";
import { toCard, type HandoffCard } from "@/lib/handoff";
import { quickSaveToggle, useCollections } from "@/lib/collections";
import Cover from "./Cover";
import NightCard, { CAL, GroupPill, MetaRow, PIN, PrizeLine } from "./NightCard";

function groupByEvent(cards: HandoffCard[]): [string, HandoffCard[]][] {
  const groups = new Map<string, HandoffCard[]>();
  for (const c of cards) {
    if (!groups.has(c.event)) groups.set(c.event, []);
    groups.get(c.event)!.push(c);
  }
  return [...groups.entries()];
}

/** Harbor: scannable card feed left, sticky detail console right. */
export default function HarborView({ projects }: { projects: Project[] }) {
  const cards = useMemo(() => projects.map(toCard), [projects]);
  const wings = useMemo(() => groupByEvent(cards), [cards]);
  const [selected, setSelected] = useState<HandoffCard | null>(cards[0] ?? null);
  const { savedSlugs } = useCollections();

  // Filtering (pool change) re-selects the first visible project —
  // render-time state adjustment, per React docs, not an effect.
  const [prevCards, setPrevCards] = useState(cards);
  if (prevCards !== cards) {
    setPrevCards(cards);
    setSelected(cards[0] ?? null);
  }

  const saved = selected ? savedSlugs.has(selected.slug) : false;

  return (
    <div>
      <div className="mx-auto max-w-[1040px] px-[clamp(20px,4vw,48px)] pb-[140px] pt-12">
        {/* page intro */}
        <div className="mb-8 flex flex-col gap-2 border-b border-[var(--nf-nline)] px-0.5 pb-6">
          <h1 className="text-[40px] font-bold tracking-[-0.015em]">Hackathon Projects</h1>
          <p className="max-w-[64ch] text-[17px] leading-[1.6] text-[var(--nf-muted)]">
            Browse the projects that won the world&rsquo;s biggest hackathons, watch their demos,
            and save the ideas that inspire you.
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-x-5 gap-y-2 text-[16px] text-[var(--nf-muted)]">
            <span className="inline-flex items-center gap-1.5">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M6 9a6 6 0 0 0 12 0V3H6v6Z" />
                <path d="M6 5H3v2a4 4 0 0 0 4 4M18 5h3v2a4 4 0 0 1-4 4M12 15v4M8 21h8" />
              </svg>
              <span className="font-semibold text-[var(--nf-text)]">{projects.length}</span>{" "}
              Winning {projects.length === 1 ? "Project" : "Projects"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <rect x="3" y="4" width="18" height="18" rx="3" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              <span className="font-semibold text-[var(--nf-text)]">{wings.length}</span>{" "}
              {wings.length === 1 ? "Hackathon" : "Hackathons"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M21 12a9 9 0 1 1-2.64-6.36" />
                <path d="M21 3v6h-6" />
              </svg>
              Updated Daily
            </span>
          </div>
        </div>
        <div className="grid items-start gap-[clamp(26px,4vw,56px)] min-[901px]:grid-cols-[minmax(340px,430px)_1fr]">
          {/* feed */}
          <div>
            {wings.map(([eventName, items]) => (
              <section key={eventName} className="mb-[34px]">
                <GroupPill event={eventName} count={items.length} />
                {items.map((card) => (
                  <NightCard
                    key={card.uid}
                    card={card}
                    compact
                    selected={selected?.slug === card.slug}
                    onSelect={() => setSelected(card)}
                  />
                ))}
              </section>
            ))}
          </div>

          {/* sticky detail console — sized to always fit one screen */}
          {selected && (
            <aside className="sticky top-8 mt-7 hidden flex-col items-start gap-3 rounded-[20px] border border-[var(--nf-nline)] bg-[var(--nf-card)] p-5 backdrop-blur-[14px] min-[901px]:flex">
              {selected.project.demoVideoUrl ? (
                <div className="relative aspect-video w-full overflow-hidden rounded-[14px] border border-[var(--nf-nline)]">
                  <iframe
                    key={selected.slug}
                    src={selected.project.demoVideoUrl}
                    title={`${selected.name} demo video`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                    className="absolute inset-0 h-full w-full"
                  />
                </div>
              ) : (
                <Link
                  href={`/project/${selected.slug}`}
                  className="relative block aspect-video w-full overflow-hidden rounded-[14px] border border-[var(--nf-nline)]"
                >
                  <Cover card={selected} eager />
                </Link>
              )}
              <PrizeLine card={selected} className="mt-1" />
              <h2 className="text-[24px] font-bold leading-tight tracking-[-0.01em]">
                {selected.name}
              </h2>
              <p className="text-[15px] leading-[1.65] text-[var(--nf-muted)] [text-wrap:pretty]">
                {selected.blurb}
              </p>
              <div className="flex flex-col gap-2">
                <MetaRow icon={CAL} text={selected.event} />
                <MetaRow icon={PIN} text={selected.tag} />
              </div>
              <button
                type="button"
                onClick={() => quickSaveToggle(selected.slug)}
                className="mt-1 w-full rounded-xl bg-[var(--nf-text)] py-3 text-[15px] font-bold text-[var(--nf-bg)] transition-opacity hover:opacity-[0.88] active:scale-[0.99]"
              >
                {saved ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    Saved
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                    </svg>
                  </span>
                ) : (
                  "Save to collection"
                )}
              </button>
              <Link
                href={`/project/${selected.slug}`}
                className="w-full text-center text-[13px] font-semibold text-[var(--nf-muted)] underline underline-offset-4 hover:text-[var(--nf-text)]"
              >
                Open project
              </Link>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
