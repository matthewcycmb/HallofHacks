"use client";

import { useSyncExternalStore } from "react";

/**
 * Feed freshness. The archive is a fixed set, so instead of always showing the
 * same static order we rotate the order of the hackathon GROUPS, so a returning
 * visitor sees a different event leading the feed each time. Because it's a
 * cyclic rotation (not a reshuffle), the groups a visitor already led with slide
 * to the bottom and genuinely-unseen ones march to the top — covering the whole
 * archive over repeat visits rather than re-surfacing the same few.
 *
 * The rotation offset is a per-device "visit" counter. It advances on each new
 * visit — a new browser session OR a new calendar day — and stays stable within
 * a single sitting, so a refresh or a back-nav from a project page does NOT
 * reshuffle under the visitor. Offset 0 (the first ever visit) is the curated,
 * featured-first order, so a freshly signed-up user opens on the real feed.
 */

const VISIT_KEY = "hall-of-hacks:v1:feed-visit";
const DAY_KEY = "hall-of-hacks:v1:feed-day";
const SESSION_KEY = "hall-of-hacks:v1:feed-seed";
const RESET_KEY = "hall-of-hacks:v1:feed-reset";

function localDay(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

/**
 * Pin the next /feed visit to the curated (offset 0) order. Called at sign-in,
 * BEFORE the OAuth redirect — localStorage survives the round-trip — so a freshly
 * signed-up user opens on the real curated feed even if they browsed (and so
 * advanced their rotation) while logged out beforehand. resolveVisitSeed()
 * consumes the flag on arrival and restarts the rotation from there.
 */
export function pinCuratedNextVisit(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(RESET_KEY, "1");
  } catch {
    /* ignore */
  }
}

/**
 * Resolve (and advance) the rotation offset for this visit. Advances the stored
 * counter once when the visit is new (new session or new day), otherwise returns
 * the seed pinned for the current sitting. Returns 0 if storage is unavailable
 * (e.g. Safari private mode) — the visitor just keeps the curated order.
 */
function resolveVisitSeed(): number {
  if (typeof window === "undefined") return 0;
  try {
    const today = localDay();
    // Just signed up? Show the curated order this sitting, and restart the
    // rotation so the next visit resumes the march from the top.
    if (window.localStorage.getItem(RESET_KEY) !== null) {
      window.localStorage.removeItem(RESET_KEY);
      window.localStorage.setItem(VISIT_KEY, "1");
      window.localStorage.setItem(DAY_KEY, today);
      window.sessionStorage.setItem(SESSION_KEY, "0");
      return 0;
    }
    const pinned = window.sessionStorage.getItem(SESSION_KEY);
    const sameDay = window.localStorage.getItem(DAY_KEY) === today;
    // Same sitting and same day → reuse the pinned seed (stable, no reshuffle).
    if (pinned !== null && sameDay) {
      return Number.parseInt(pinned, 10) || 0;
    }
    // New visit → hand out the next counter value and advance it for next time.
    const current = Number.parseInt(window.localStorage.getItem(VISIT_KEY) || "0", 10) || 0;
    window.localStorage.setItem(VISIT_KEY, String(current + 1));
    window.localStorage.setItem(DAY_KEY, today);
    window.sessionStorage.setItem(SESSION_KEY, String(current));
    return current;
  } catch {
    return 0;
  }
}

// Resolve once per page load and cache it, so the offset is stable across
// renders (useSyncExternalStore requires a cached snapshot) and the counter only
// advances a single time. A real reload (the normal next-day case) reloads this
// module and re-resolves.
let cached: number | null = null;
function getClientOffset(): number {
  if (cached === null) cached = resolveVisitSeed();
  return cached;
}
function getServerOffset(): number {
  return 0;
}
function subscribe(): () => void {
  return () => {};
}

/**
 * The feed rotation offset for this visit. 0 during SSR + hydration (so the
 * static HTML matches), then the resolved client offset — React re-renders once
 * to apply it, with no hydration mismatch.
 */
export function useVisitOffset(): number {
  return useSyncExternalStore(subscribe, getClientOffset, getServerOffset);
}

/** Cyclic rotation: same relative order, different starting element. */
export function rotateBy<T>(items: T[], offset: number): T[] {
  const n = items.length;
  if (n <= 1) return items;
  const k = ((offset % n) + n) % n;
  return k === 0 ? items : [...items.slice(k), ...items.slice(0, k)];
}
