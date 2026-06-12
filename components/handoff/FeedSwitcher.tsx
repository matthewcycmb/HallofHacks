"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import type { Project } from "@/lib/types";
import { CATEGORIES } from "@/lib/categories";
import HarborView from "./HarborView";

/** The feed: Harbor is the site's single view; category comes from ?cat=. */
export default function FeedSwitcher({ projects }: { projects: Project[] }) {
  const params = useSearchParams();
  const catParam = params.get("cat") ?? "all";
  const q = (params.get("q") ?? "").trim().toLowerCase();
  const category = CATEGORIES.find((c) => c.id === catParam) ?? CATEGORIES[0];

  const pool = useMemo(() => {
    let list = projects.filter(category.match);
    if (q) {
      list = list.filter((p) =>
        [p.name, p.oneLiner, p.hackathon, p.award, ...p.domainTags]
          .join(" ")
          .toLowerCase()
          .includes(q),
      );
    }
    return list;
  }, [projects, category, q]);

  if (pool.length === 0) {
    return (
      <div className="mx-auto max-w-[1040px] px-[clamp(20px,4vw,48px)] pt-16 text-center">
        <p className="text-lg font-bold">Nothing matches.</p>
        <p className="mt-1 text-sm text-ink-soft">Try a different search or category.</p>
      </div>
    );
  }

  return <HarborView key={`${category.id}:${q}`} projects={pool} />;
}
