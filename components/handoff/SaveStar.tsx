"use client";

import { useRef, useState } from "react";
import { quickSaveToggle, useCollections } from "@/lib/collections";

function Bookmark({ filled }: { filled: boolean }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
    </svg>
  );
}

/** Bookmark save button: 34px circle; fills gold when saved. */
export default function SaveStar({
  slug,
  className = "",
}: {
  slug: string;
  className?: string;
}) {
  const { savedSlugs } = useCollections();
  const saved = savedSlugs.has(slug);
  const [pulse, setPulse] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  return (
    <button
      type="button"
      title={saved ? "Saved — click to remove" : "Save to collection"}
      aria-pressed={saved}
      className={`hoh-save ${className} ${saved ? "!text-gold" : ""}`}
      style={pulse ? { transform: "scale(1.35)" } : undefined}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        quickSaveToggle(slug);
        setPulse(true);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setPulse(false), 160);
      }}
    >
      <Bookmark filled={saved} />
    </button>
  );
}
