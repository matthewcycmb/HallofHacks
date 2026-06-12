"use client";

import { useSyncExternalStore } from "react";

/**
 * SSR-safe localStorage-backed preference as an external store —
 * avoids setState-in-effect and hydration mismatches.
 */
const caches = new Map<string, string | null>();
const listeners = new Map<string, Set<() => void>>();

function read(key: string): string | null {
  if (!caches.has(key)) {
    try {
      caches.set(key, window.localStorage.getItem(key));
    } catch {
      caches.set(key, null);
    }
  }
  return caches.get(key) ?? null;
}

export function writePref(key: string, value: string) {
  caches.set(key, value);
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* private mode */
  }
  listeners.get(key)?.forEach((l) => l());
}

export function usePref(key: string): string | null {
  return useSyncExternalStore(
    (onChange) => {
      if (!listeners.has(key)) listeners.set(key, new Set());
      listeners.get(key)!.add(onChange);
      return () => listeners.get(key)?.delete(onChange);
    },
    () => read(key),
    () => null,
  );
}
