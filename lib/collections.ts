"use client";

import { useSyncExternalStore } from "react";
import type { Collection, CollectionsResult } from "./collections/types";
import {
  getCollections as getCollectionsAction,
  quickSaveToggleAction,
  createCollectionAction,
  createCollectionWithSlugAction,
  deleteCollectionAction,
  toggleItemAction,
  migrateCollectionsAction,
} from "./collections/actions";

export type { Collection };

const STORAGE_KEY = "hall-of-hacks:v1:collections";
const MIGRATED_KEY = "hall-of-hacks:v1:migrated";

/**
 * Session-aware collections store.
 *  - Logged OUT ("local"): reads the legacy localStorage collections read-only;
 *    any save calls the registered auth prompt (→ /signup) instead of writing.
 *  - Logged IN ("server"): mutations update the snapshot optimistically and call
 *    server actions, then reconcile with the authoritative list they return.
 * The auth bridge (components/auth/CollectionsBridge) drives the mode + prompt.
 */

let snapshot: Collection[] = [];
let booted = false;
let mode: "local" | "server" = "local";
let authPrompt: (() => void) | null = null;
const listeners = new Set<() => void>();
const EMPTY: Collection[] = [];

function notify() {
  for (const l of listeners) l();
}

function loadLocal(): Collection[] {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY;
    return parsed.filter(
      (c): c is Collection =>
        c && typeof c.id === "string" && typeof c.name === "string" && Array.isArray(c.slugs),
    );
  } catch {
    return EMPTY;
  }
}

function ensureBooted() {
  if (!booted) {
    booted = true;
    if (mode === "local") snapshot = loadLocal();
  }
}

// ---------- external store ----------
function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = () => {
    if (mode === "local") {
      snapshot = loadLocal();
      notify();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}
function getSnapshot() {
  ensureBooted();
  return snapshot;
}
function getServerSnapshot() {
  return EMPTY;
}

/** Live view of collections, synced across components, tabs, and (signed in) devices. */
export function useCollections() {
  const collections = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const savedSlugs = new Set(collections.flatMap((c) => c.slugs));
  return { collections, savedSlugs };
}

// ---------- auth bridge surface ----------
export function registerAuthPrompt(fn: (() => void) | null) {
  authPrompt = fn;
}

export function enterLocalMode() {
  mode = "local";
  snapshot = loadLocal();
  notify();
}

export async function enterServerMode() {
  mode = "server";
  await refetch();
}

export async function refetch() {
  if (mode !== "server") return;
  applyResult(await getCollectionsAction());
}

// `.catch(safeRefetch)` — refetch is async, so swallow its own rejection to
// avoid an unhandled promise rejection when the network is down.
function safeRefetch() {
  refetch().catch(() => {});
}

/** Merge pre-account localStorage collections into the account, once. */
export async function runMigrationOnce() {
  if (mode !== "server" || typeof window === "undefined") return;
  if (window.localStorage.getItem(MIGRATED_KEY)) return;
  const local = loadLocal();
  if (local.length === 0) {
    window.localStorage.setItem(MIGRATED_KEY, "1");
    return;
  }
  // Only mark migrated on success — the server merge is idempotent (ON CONFLICT
  // DO NOTHING), so a double-mount running it twice is safe; a failed run must
  // be retried, not silently lost.
  const res = await migrateCollectionsAction(local);
  if ("collections" in res) {
    window.localStorage.setItem(MIGRATED_KEY, "1");
    // Clear the local copy so it can't bleed into another account on a shared
    // browser (or re-display after sign-out).
    window.localStorage.removeItem(STORAGE_KEY);
  }
  applyResult(res);
}

// ---------- helpers ----------
function savedSet(): Set<string> {
  return new Set(snapshot.flatMap((c) => c.slugs));
}

function applyResult(res: CollectionsResult) {
  if ("collections" in res) {
    snapshot = res.collections;
    notify();
  } else if (res.error === "UNAUTHENTICATED") {
    // Session expired mid-use: drop back to local mode (so we stop optimistically
    // writing) and prompt sign-in, rather than leaving a phantom optimistic save.
    enterLocalMode();
    authPrompt?.();
  } else {
    // NOT_FOUND etc. — the optimistic change didn't land server-side; resync.
    safeRefetch();
  }
}

function optimisticToggleSaved(slug: string): boolean {
  const cols = snapshot.map((c) => ({ ...c, slugs: [...c.slugs] }));
  let def = cols.find((c) => c.name === "Saved");
  if (!def) {
    def = { id: "pending-default", name: "Saved", slugs: [], createdAt: Date.now() };
    cols.unshift(def);
  }
  const has = def.slugs.includes(slug);
  def.slugs = has ? def.slugs.filter((s) => s !== slug) : [...def.slugs, slug];
  snapshot = cols;
  notify();
  return !has;
}

// ---------- public mutations (gated when logged out) ----------
export function quickSaveToggle(slug: string): boolean {
  if (mode !== "server") {
    authPrompt?.();
    return false;
  }
  const willSave = optimisticToggleSaved(slug);
  quickSaveToggleAction(slug).then(applyResult).catch(safeRefetch);
  return willSave;
}

export function quickSave(slug: string): boolean {
  if (mode !== "server") {
    authPrompt?.();
    return false;
  }
  if (savedSet().has(slug)) return false;
  optimisticToggleSaved(slug);
  quickSaveToggleAction(slug).then(applyResult).catch(safeRefetch);
  return true;
}

export function toggleInCollection(id: string, slug: string) {
  if (mode !== "server") {
    authPrompt?.();
    return;
  }
  snapshot = snapshot.map((c) =>
    c.id === id
      ? {
          ...c,
          slugs: c.slugs.includes(slug) ? c.slugs.filter((s) => s !== slug) : [...c.slugs, slug],
        }
      : c,
  );
  notify();
  toggleItemAction(id, slug).then(applyResult).catch(safeRefetch);
}

export function deleteCollection(id: string) {
  if (mode !== "server") {
    authPrompt?.();
    return;
  }
  snapshot = snapshot.filter((c) => c.id !== id);
  notify();
  deleteCollectionAction(id).then(applyResult).catch(safeRefetch);
}

/** Create a collection (SaveMenu "New collection" without an immediate slug). */
export function createCollection(name: string): Collection {
  const optimistic: Collection = {
    id: "pending-" + Date.now(),
    name: name.trim().slice(0, 60) || "Untitled",
    slugs: [],
    createdAt: Date.now(),
  };
  if (mode !== "server") {
    authPrompt?.();
    return optimistic;
  }
  snapshot = [...snapshot, optimistic];
  notify();
  createCollectionAction(name).then(applyResult).catch(safeRefetch);
  return optimistic;
}

/** Create a collection and add a slug in one go (SaveMenu primary action). */
export function createCollectionAndAdd(name: string, slug: string) {
  if (mode !== "server") {
    authPrompt?.();
    return;
  }
  const optimistic: Collection = {
    id: "pending-" + Date.now(),
    name: name.trim().slice(0, 60) || "Untitled",
    slugs: [slug],
    createdAt: Date.now(),
  };
  snapshot = [...snapshot, optimistic];
  notify();
  createCollectionWithSlugAction(name, slug).then(applyResult).catch(safeRefetch);
}
