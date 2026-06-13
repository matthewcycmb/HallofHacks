"use client";

import { useEffect, useRef, useState } from "react";
import { createCollectionAndAdd, toggleInCollection, useCollections } from "@/lib/collections";

export default function SaveMenu({
  slug,
  onClose,
  className = "absolute right-2 top-10",
}: {
  slug: string;
  onClose: () => void;
  className?: string;
}) {
  const { collections } = useCollections();
  const [newName, setNewName] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  function handleCreate() {
    const name = newName.trim();
    if (!name) return;
    createCollectionAndAdd(name, slug);
    setNewName("");
  }

  return (
    <div
      ref={ref}
      className={`modal-in z-30 w-64 rounded-2xl border border-line bg-paper p-2.5 shadow-[0_12px_40px_-8px_rgba(20,15,2,0.4)] ${className}`}
      onClick={(e) => e.preventDefault()}
    >
      <p className="px-2 pb-1.5 pt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
        Save to collection
      </p>
      <ul className="max-h-48 overflow-y-auto">
        {collections.length === 0 && (
          <li className="px-2 py-1.5 text-xs text-ink-soft">No collections yet — make one below.</li>
        )}
        {collections.map((c) => {
          const saved = c.slugs.includes(slug);
          return (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => toggleInCollection(c.id, slug)}
                className="flex w-full items-center justify-between gap-2 rounded-xl px-2 py-2 text-left text-sm font-medium hover:bg-paper-2"
              >
                <span className="truncate">{c.name}</span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill={saved ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={saved ? "text-gold" : "text-ink-soft"}
                  aria-hidden
                >
                  <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                </svg>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="mt-1.5 flex gap-1.5 border-t border-line pt-2.5">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          placeholder="New collection…"
          className="w-full min-w-0 rounded-full bg-paper-2 px-3.5 py-2 text-sm outline-none placeholder:text-ink-soft focus:shadow-[0_0_0_2px_var(--gold)]"
        />
        <button
          type="button"
          onClick={handleCreate}
          className="shrink-0 rounded-full bg-ink px-3.5 py-2 font-mono text-[10.5px] uppercase tracking-[0.08em] text-paper hover:bg-gold"
        >
          Add
        </button>
      </div>
    </div>
  );
}
