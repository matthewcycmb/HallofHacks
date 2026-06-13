"use client";

import Link from "next/link";
import ProjectImage from "@/components/ProjectImage";

/**
 * Onboarding landing (design_handoff_landing "Window" design): hero +
 * framed app mockup + trust strip. Sign-up lives on its own route
 * (/signup, components/handoff/SignupCard.tsx). Copy is user-approved
 * per the handoff README — do not reword.
 */

export interface OnboardingMockItem {
  name: string;
  prize: string;
  tag: string;
  image: string;
}

export interface OnboardingData {
  stats: { projects: number; hackathons: number };
  groups: { event: string; count: number; items: OnboardingMockItem[] }[];
  hero: OnboardingMockItem & { event: string; blurb: string };
}

/** Logo-wall marks: bold white wordmarks, with line glyphs where the real logo has an iconic mark. */
const TRUST_MARKS: { name: string; glyph?: "tree" | "compass" }[] = [
  { name: "HackMIT" },
  { name: "TreeHacks", glyph: "tree" },
  { name: "Cal Hacks" },
  { name: "Hack the North", glyph: "compass" },
  { name: "PennApps" },
  { name: "HackGT" },
  { name: "MHacks" },
  { name: "LA Hacks" },
];

function MarkGlyph({ glyph }: { glyph: "tree" | "compass" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[15px] w-[15px] flex-none"
      aria-hidden
    >
      {glyph === "tree" ? (
        <>
          <path d="M12 2 6.5 10h3L5 17h14l-4.5-7h3L12 2Z" />
          <path d="M12 17v5" />
        </>
      ) : (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" />
        </>
      )}
    </svg>
  );
}

const BTN =
  "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full font-bold transition active:scale-[0.98]";
export const BTN_PRIMARY = `${BTN} group bg-white text-[#131316] hover:opacity-90`;
export const BTN_GHOST = `${BTN} bg-white/[0.09] font-semibold text-ink hover:bg-white/[0.14]`;

/** "→" that nudges right on hover — momentum cue on primary CTAs. */
export function Arrow() {
  return (
    <span className="transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden>
      →
    </span>
  );
}

function Trophy() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[11px] w-[11px] flex-none"
      aria-hidden
    >
      <path d="M6 9a6 6 0 0 0 12 0V3H6v6Z" />
      <path d="M6 5H3v2a4 4 0 0 0 4 4M18 5h3v2a4 4 0 0 1-4 4M12 15v4M8 21h8" />
    </svg>
  );
}

export default function OnboardingFlow({ data }: { data: OnboardingData }) {
  return (
    // Full-screen over the site chrome: the onboarding flow brings its own nav.
    <div className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden bg-black text-ink">
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(60% 44% at 18% 0%, rgba(227,190,110,0.018), transparent 75%), radial-gradient(54% 40% at 85% 12%, rgba(160,170,200,0.022), transparent 75%)",
        }}
        aria-hidden
      />
      <div className="relative flex min-h-full flex-col">
        <Landing data={data} />
      </div>
    </div>
  );
}

function Landing({ data }: { data: OnboardingData }) {
  return (
    <>
      {/* Nav rails align with the app-shot edges below (same width formula). */}
      <nav className="py-[18px]">
        <div className="mx-auto flex w-[min(980px,calc(100%-40px))] items-center justify-between">
          <span className="whitespace-nowrap font-display text-[21px] leading-none tracking-[-0.01em]">
            Hall <em className="font-normal italic text-gold">of</em> Hacks
          </span>
          <div className="flex items-center gap-4">
            <Link
              href="/signup"
              className="whitespace-nowrap text-[14px] text-ink-soft transition-colors hover:text-ink"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className={`${BTN_PRIMARY} max-sm:hidden px-[18px] py-[9px] text-[13.5px]`}
            >
              Get started <Arrow />
            </Link>
          </div>
        </div>
      </nav>

      {/* Desktop: centered hero, headline ~24% down the viewport (Cursor's placement).
          Mobile: left-aligned F-pattern, no stats line, lower start. */}
      <div className="flex flex-col items-start gap-5 px-5 pt-[11vh] text-left sm:items-center sm:gap-[26px] sm:pt-[clamp(60px,14vh,140px)] sm:text-center">
        {/* Regular weight on purpose: the heading sets the scene, the white CTA takes the spotlight. */}
        <h1 className="text-[clamp(30px,5vw,62px)] font-normal leading-[1.12] tracking-[-0.02em] text-balance sm:leading-[1.07]">
          The ultimate feed for
          <br className="hidden sm:inline" /> winning hackathon projects.
        </h1>
        <div className="flex flex-col items-start gap-3.5 sm:items-center">
          <div className="flex gap-3">
            <Link href="/signup" className={`${BTN_PRIMARY} px-6 py-3 text-[15px]`}>
              Get started <Arrow />
            </Link>
            {/* Deliberately ungated: browsing is the value taste, signup gates saves later. */}
            <Link href="/feed" className={`${BTN_GHOST} px-6 py-3 text-[15px]`}>
              Browse projects
            </Link>
          </div>
          {/* Specificity + freshness proof right at the decision point (desktop only). */}
          <div className="hidden text-[13px] text-ink-soft sm:block">
            {data.stats.projects} winning projects · {data.stats.hackathons} hackathons ·
            updated daily · free forever
          </div>
        </div>
      </div>

      <AppShot data={data} />

      <div className="px-5 pb-[120px] pt-11 text-center">
        <div className="mb-6 text-[13px] text-ink-soft">
          Indexing winners from the hackathons that matter
        </div>
        <div className="mx-auto grid w-[min(1280px,100%)] grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-8">
          {TRUST_MARKS.map((m) => (
            <span
              key={m.name}
              className="flex h-[88px] items-center justify-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.045] px-3 font-display text-[16px] leading-tight text-white/90"
            >
              {m.glyph && <MarkGlyph glyph={m.glyph} />}
              {m.name}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}

/** Framed browser window with a live-rendered miniature of the real feed. */
function AppShot({ data }: { data: OnboardingData }) {
  const { stats, groups, hero } = data;
  return (
    <div className="mx-auto mt-9 w-[min(980px,calc(100%-40px))] overflow-hidden rounded-[18px] border border-white/[0.07] bg-[#0c0c0f] shadow-[0_60px_140px_-50px_rgba(0,0,0,0.9)] sm:mt-[54px]">
      <div className="flex items-center border-b border-white/[0.07] px-4 py-3">
        <span className="flex gap-[7px]" aria-hidden>
          <i className="h-[11px] w-[11px] rounded-full bg-white/[0.14]" />
          <i className="h-[11px] w-[11px] rounded-full bg-white/[0.14]" />
          <i className="h-[11px] w-[11px] rounded-full bg-white/[0.14]" />
        </span>
        <span className="mx-auto text-[11px] tracking-[0.08em] text-ink-soft">
          hallofhacks.app/feed
        </span>
      </div>

      <div className="grid gap-[18px] p-5 md:min-h-[360px] md:grid-cols-[1.25fr_1fr]">
        <div className="flex flex-col gap-2 text-left">
          <div className="font-display text-[22px] tracking-[-0.01em]">Hackathon Projects</div>
          <div className="text-[12px] leading-normal text-ink-soft">
            Browse the projects that won the world&rsquo;s biggest hackathons.
          </div>
          <div className="mb-1.5 mt-1 flex gap-4 text-[11.5px] text-ink-soft">
            <span className="inline-flex items-center gap-1.5">
              <Trophy /> <b className="font-bold text-ink">{stats.projects}</b> Winning Projects
            </span>
            <span>
              <b className="font-bold text-ink">{stats.hackathons}</b> Hackathons
            </span>
            <span>Updated Daily</span>
          </div>
          {groups.map((g) => (
            <div key={g.event} className="flex flex-col gap-2">
              <div className="mt-1 flex items-baseline gap-2 text-[12.5px] font-bold">
                {g.event}
                <i className="text-[10.5px] font-normal not-italic text-ink-soft">
                  {g.count} winner{g.count === 1 ? "" : "s"}
                </i>
              </div>
              {g.items.map((m) => (
                <div
                  key={m.name}
                  className="grid grid-cols-[1fr_52px] items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.055] px-[13px] py-[11px]"
                >
                  <div>
                    <div className="flex items-center gap-[5px] text-[10px] font-semibold text-ink-soft">
                      <Trophy /> {m.prize}
                    </div>
                    <div className="mt-0.5 text-[14.5px] font-bold">{m.name}</div>
                    <div className="mt-[3px] flex gap-2.5 text-[10.5px] text-ink-soft">
                      <span>{g.event}</span>
                      <span>{m.tag}</span>
                    </div>
                  </div>
                  <div className="h-[52px] w-[52px] overflow-hidden rounded-xl border border-white/[0.07]">
                    <ProjectImage src={m.image} alt={m.name} className="h-full w-full object-cover" />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="flex flex-col items-start gap-[9px] self-start rounded-[14px] border border-white/[0.07] bg-white/[0.055] p-4 text-left">
          <div className="relative aspect-[1.7] w-full overflow-hidden rounded-[10px] border border-white/[0.07]">
            <ProjectImage
              src={hero.image}
              alt={hero.name}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <span
              className="absolute left-1/2 top-1/2 flex h-8 w-[46px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[9px] bg-[#e02f2f] shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
              aria-hidden
            >
              <span className="ml-0.5 h-0 w-0 border-y-[7px] border-l-[12px] border-y-transparent border-l-white" />
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[10.5px] font-semibold text-ink-soft">
            <Trophy /> {hero.prize}
          </div>
          <div className="text-[19px] font-bold">{hero.name}</div>
          <div className="text-[12px] leading-[1.55] text-ink-soft">{hero.blurb}</div>
          <div className="flex gap-2.5 text-[10.5px] text-ink-soft">
            <span>{hero.event}</span>
            <span>{hero.tag}</span>
          </div>
          <div className="mt-1 w-full rounded-[10px] bg-white py-2.5 text-center text-[13px] font-bold text-[#131316]">
            Save to collection
          </div>
          <div className="w-full text-center text-[11.5px] text-ink-soft underline underline-offset-[3px]">
            Open project
          </div>
        </div>
      </div>
    </div>
  );
}

