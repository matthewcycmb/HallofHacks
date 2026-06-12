"use client";

import { useState } from "react";
import SaveMenu from "@/components/SaveMenu";
import SaveStar from "./SaveStar";

/** Detail view save controls: ✶ quick-save + folder picker. */
export default function DetailSave({ slug }: { slug: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="relative flex items-center gap-2">
      <SaveStar slug={slug} />
      <button
        type="button"
        onClick={() => setMenuOpen((v) => !v)}
        className="rounded-full border border-line bg-paper px-3 py-2 font-mono text-[10.5px] uppercase tracking-[0.1em] text-ink-soft transition-colors hover:text-ink"
      >
        Collections ▾
      </button>
      {menuOpen && (
        <SaveMenu slug={slug} onClose={() => setMenuOpen(false)} className="absolute right-0 top-full mt-2" />
      )}
    </div>
  );
}
