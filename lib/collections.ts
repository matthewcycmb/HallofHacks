"use client";

import { useSyncExternalStore } from "react";

export interface Collection {
  id: string;
  name: string;
  slugs: string[];
  createdAt: number;
}

const STORAGE_KEY = "hall-of-hacks:v1:collections";
const CHANGE_EVENT = "hoh:collections-changed";

function load(): Collection[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (c): c is Collection =>
        c && typeof c.id === "string" && typeof c.name === "string" && Array.isArray(c.slugs),
    );
  } catch {
    return [];
  }
}

function persist(collections: Collection[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(collections));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

// Snapshot cache so useSyncExternalStore gets a stable reference between changes.
let snapshot: Collection[] | null = null;
const EMPTY: Collection[] = [];

function getSnapshot(): Collection[] {
  if (snapshot === null) snapshot = load();
  return snapshot;
}

function getServerSnapshot(): Collection[] {
  return EMPTY;
}

function subscribe(onStoreChange: () => void) {
  const handler = () => {
    snapshot = load();
    onStoreChange();
  };
  window.addEventListener(CHANGE_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(CHANGE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

export function createCollection(name: string): Collection {
  const collection: Collection = {
    id: crypto.randomUUID(),
    name: name.trim().slice(0, 60) || "Untitled",
    slugs: [],
    createdAt: Date.now(),
  };
  persist([...load(), collection]);
  return collection;
}

export function deleteCollection(id: string) {
  persist(load().filter((c) => c.id !== id));
}

const DEFAULT_ID = "default";

/**
 * One-tap ✶ save: toggles the slug in the default "Saved" collection
 * (created on first use). Used by every feed layout.
 */
export function quickSaveToggle(slug: string): boolean {
  const collections = load();
  let def = collections.find((c) => c.id === DEFAULT_ID);
  if (!def) {
    def = { id: DEFAULT_ID, name: "Saved", slugs: [], createdAt: Date.now() };
    collections.unshift(def);
  }
  const saved = def.slugs.includes(slug);
  def.slugs = saved ? def.slugs.filter((s) => s !== slug) : [...def.slugs, slug];
  persist(collections);
  return !saved;
}

/** Save without unsaving (Deck right-throw). Returns true if newly saved. */
export function quickSave(slug: string): boolean {
  const collections = load();
  let def = collections.find((c) => c.id === DEFAULT_ID);
  if (!def) {
    def = { id: DEFAULT_ID, name: "Saved", slugs: [], createdAt: Date.now() };
    collections.unshift(def);
  }
  if (def.slugs.includes(slug)) return false;
  def.slugs = [...def.slugs, slug];
  persist(collections);
  return true;
}

export function toggleInCollection(id: string, slug: string) {
  persist(
    load().map((c) =>
      c.id === id
        ? {
            ...c,
            slugs: c.slugs.includes(slug) ? c.slugs.filter((s) => s !== slug) : [...c.slugs, slug],
          }
        : c,
    ),
  );
}

/** Live view of collections, synced across components and tabs. */
export function useCollections() {
  const collections = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const savedSlugs = new Set(collections.flatMap((c) => c.slugs));
  return { collections, savedSlugs };
}
