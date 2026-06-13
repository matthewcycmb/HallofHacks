import type { Metadata } from "next";
import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";
import { getAllProjects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Categories",
  description: "Pick the kind of winning projects you want to binge.",
};

export default function CategoriesPage() {
  const projects = getAllProjects();

  const cards = CATEGORIES.map((cat) => ({
    ...cat,
    count: projects.filter(cat.match).length,
  })).filter((c) => c.count > 0);

  return (
    <div className="mx-auto w-full max-w-[1040px] px-[clamp(20px,4vw,48px)] pb-[140px] pt-4">
      <h2 className="text-[26px] font-bold tracking-[-0.01em]">Categories</h2>
      <p className="mt-1 text-sm text-ink-soft">
        Pick what you want to binge. Every project is a winner worth reading.
      </p>
      <div className="mt-6 grid grid-cols-2 gap-2.5 lg:grid-cols-3">
        {cards.map((cat) => (
          <Link
            key={cat.id}
            href={cat.id === "all" ? "/" : `/?cat=${cat.id}`}
            className="group flex flex-col gap-0.5 rounded-xl border border-line bg-paper-2 px-4 py-3 transition-transform hover:-translate-y-0.5 sm:flex-row sm:items-baseline sm:gap-2"
          >
            <span className="text-[15px] font-bold tracking-[-0.01em]">{cat.label}</span>
            <span className="text-[13px] text-ink-soft">
              <span className="hidden sm:inline">- </span>
              {cat.count} {cat.count === 1 ? "winner" : "winners"}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
