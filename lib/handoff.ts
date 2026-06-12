import type { Project } from "./types";
import { DOMAIN_TAGS } from "./types";
import { seededShuffle } from "./projects";

/**
 * Adapter between our Project records and the design handoff's card model
 * (design_handoff_hall_of_hacks_feeds/README.md "Data Model").
 * Everything derived here is deterministic per slug.
 */

export type Tier = "grand" | "track" | "sponsor";
export type CoverAspect = "tall" | "square" | "wide";

export interface HandoffCard {
  project: Project;
  /** Unique per deal — laps repeat slugs, so React keys use this. */
  uid: string;
  slug: string;
  name: string;
  event: string;
  prize: string;
  tier: Tier;
  tag: string;
  blurb: string;
  hue: number;
  dark: boolean;
  style: 1 | 2 | 3 | 4 | 5;
  aspect: CoverAspect;
}

export function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function hexToHslHue(hex: string): { hue: number; sat: number; lum: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let hue = 0;
  if (d > 0) {
    if (max === r) hue = ((g - b) / d) % 6;
    else if (max === g) hue = (b - r) / d + 2;
    else hue = (r - g) / d + 4;
    hue = (hue * 60 + 360) % 360;
  }
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
  const sat = max === 0 ? 0 : d / max;
  return { hue, sat, lum };
}

export function tierOf(award: string): Tier {
  if (/grand|1st|first|overall/i.test(award)) return "grand";
  if (/best|most|top|finalist/i.test(award)) return "track";
  return "sponsor";
}

export function shortPrize(award: string): string {
  return award.split(" · ")[0].split(" — ")[0];
}

const ASPECTS: CoverAspect[] = ["tall", "tall", "square", "wide", "tall", "square"];

export function aspectRatioOf(aspect: CoverAspect): number {
  return aspect === "tall" ? 0.74 : aspect === "wide" ? 1.42 : 1;
}

export function toCard(p: Project): HandoffCard {
  const h = hashStr(p.slug);
  let hue = h % 360;
  let dark = (h >> 3) % 5 === 0;
  if (p.dominantColor) {
    const { hue: realHue, sat, lum } = hexToHslHue(p.dominantColor);
    if (sat > 0.12) hue = Math.round(realHue);
    dark = lum < 0.35;
  }
  return {
    project: p,
    uid: p.slug,
    slug: p.slug,
    name: p.name,
    event: `${p.hackathon} ${p.year}`,
    prize: shortPrize(p.award),
    tier: tierOf(p.award),
    tag: DOMAIN_TAGS[p.domainTags[0]] ?? p.domainTags[0] ?? "Hack",
    blurb: p.oneLiner,
    hue,
    dark,
    style: ((h >> 7) % 5) + 1 as HandoffCard["style"],
    aspect: ASPECTS[(h >> 11) % ASPECTS.length],
  };
}

/** Poster palette — port of HOH_PAL in shared/covers.js. */
export function paletteOf(card: Pick<HandoffCard, "hue" | "dark">) {
  const h = card.hue;
  if (card.dark) {
    return {
      bg: `oklch(0.24 0.04 ${h})`,
      bg2: `oklch(0.30 0.06 ${h})`,
      fg: `oklch(0.88 0.07 ${h})`,
      fgSoft: `oklch(0.62 0.06 ${h})`,
      line: `oklch(0.42 0.05 ${h})`,
    };
  }
  return {
    bg: `oklch(0.85 0.085 ${h})`,
    bg2: `oklch(0.79 0.10 ${h})`,
    fg: `oklch(0.32 0.09 ${h})`,
    fgSoft: `oklch(0.48 0.08 ${h})`,
    line: `oklch(0.68 0.09 ${h})`,
  };
}

/**
 * Endless feed iterator (HOH_FEED contract): lap 0 deals the curated roster
 * IN ORDER (best-first — the visitor always opens on featured №1), then
 * every later lap is a seeded remix. Never ends.
 */
export function createFeed(projects: Project[], seed: number) {
  let lap = 0;
  let pool: Project[] = [];
  let i = 0;

  function refill() {
    pool = lap === 0 ? [...projects] : seededShuffle(projects, seed + lap * 7919);
    lap++;
    i = 0;
  }
  refill();

  let dealt = 0;

  return {
    next(): HandoffCard {
      if (i >= pool.length) refill();
      const card = toCard(pool[i++]);
      card.uid = `${card.slug}:${dealt++}`;
      return card;
    },
    batch(n: number): HandoffCard[] {
      const out: HandoffCard[] = [];
      for (let k = 0; k < n; k++) out.push(this.next());
      return out;
    },
  };
}

export type HandoffFeed = ReturnType<typeof createFeed>;
