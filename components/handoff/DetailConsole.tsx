"use client";

import Link from "next/link";
import type { HandoffCard } from "@/lib/handoff";
import { isAllowedVideoEmbedUrl, watchUrlFromEmbed } from "@/lib/allowlist";
import { quickSaveToggle } from "@/lib/collections";
import Cover from "./Cover";
import { CAL, MetaRow, PIN, PrizeLine } from "./NightCard";

/**
 * Detail console contents — shared by the desktop sticky aside and the
 * mobile inline expand-on-tap box. Wrapper (border/bg/sizing) is supplied
 * by the caller; this renders only the inner stack.
 */
export default function DetailConsole({ card, saved }: { card: HandoffCard; saved: boolean }) {
  // Only embed allow-listed hosts (matches ProjectDetail) — else CSP would blank it.
  const raw = card.project.demoVideoUrl;
  const videoUrl = raw && isAllowedVideoEmbedUrl(raw) ? raw : null;
  const watch = videoUrl ? watchUrlFromEmbed(videoUrl) : null;

  return (
    <>
      {videoUrl ? (
        <>
          <div className="relative aspect-video w-full overflow-hidden rounded-[14px] border border-[var(--nf-nline)]">
            <iframe
              key={card.slug}
              src={videoUrl}
              title={`${card.name} demo video`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              className="absolute inset-0 h-full w-full"
            />
          </div>
          {watch && (
            <a
              href={watch.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[12px] font-semibold text-[var(--nf-muted)] transition-colors hover:text-[var(--nf-text)]"
            >
              Watch on {watch.label} ↗
            </a>
          )}
        </>
      ) : (
        <Link
          href={`/project/${card.slug}`}
          className="relative block aspect-video w-full overflow-hidden rounded-[14px] border border-[var(--nf-nline)]"
        >
          <Cover card={card} eager />
        </Link>
      )}
      <PrizeLine card={card} className="mt-1" />
      <h2 className="text-[24px] font-bold leading-tight tracking-[-0.01em]">{card.name}</h2>
      <p className="text-[15px] leading-[1.65] text-[var(--nf-muted)] [text-wrap:pretty]">
        {card.blurb}
      </p>
      <div className="flex flex-col gap-2">
        <MetaRow icon={CAL} text={card.event} />
        <MetaRow icon={PIN} text={card.tag} />
      </div>
      <button
        type="button"
        onClick={() => quickSaveToggle(card.slug)}
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
        href={`/project/${card.slug}`}
        className="w-full rounded-xl border border-[var(--nf-nline)] py-2.5 text-center text-[13px] font-semibold text-[var(--nf-muted)] transition-colors hover:text-[var(--nf-text)]"
      >
        Open project →
      </Link>
    </>
  );
}
