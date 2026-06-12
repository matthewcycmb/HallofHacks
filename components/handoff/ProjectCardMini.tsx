"use client";

import Link from "next/link";
import type { Project } from "@/lib/types";
import { toCard } from "@/lib/handoff";
import Cover from "./Cover";
import SaveStar from "./SaveStar";

/** Compact cover + name card used on the collections page. */
export default function ProjectCardMini({ project }: { project: Project }) {
  const card = toCard(project);
  return (
    <article className="group relative">
      <Link href={`/project/${project.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden rounded-[18px] transition-transform duration-[280ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1">
          <Cover card={card} />
        </div>
        <div className="flex items-baseline justify-between gap-2 px-1 pt-2">
          <span className="truncate font-display text-[17px]">{project.name}</span>
          <span className="whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.08em] text-ink-soft">
            {card.event}
          </span>
        </div>
      </Link>
      <div className="absolute right-2.5 top-2.5 opacity-0 transition-opacity group-hover:opacity-100">
        <SaveStar slug={project.slug} />
      </div>
    </article>
  );
}
