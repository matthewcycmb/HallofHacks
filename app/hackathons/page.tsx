import type { Metadata } from "next";
import Link from "next/link";
import { getAllProjects } from "@/lib/projects";
import eventSizes from "@/data/event-sizes.json";

export const metadata: Metadata = {
  title: "Hackathons",
  description: "Every hackathon in the archive, and the winners that made the cut.",
};

export default function HackathonsPage() {
  const projects = getAllProjects();
  const sizes = eventSizes as Record<string, number | string>;

  // Dataset order is roster order, so events appear in curated sequence.
  const events = new Map<string, { hackathon: string; year: number; count: number }>();
  for (const p of projects) {
    const key = `${p.hackathon} ${p.year}`;
    const e = events.get(key) ?? { hackathon: p.hackathon, year: p.year, count: 0 };
    e.count += 1;
    events.set(key, e);
  }

  const cards = [...events.entries()].map(([key, e]) => ({
    ...e,
    key,
    teams: typeof sizes[key] === "number" ? (sizes[key] as number) : undefined,
  }));

  return (
    <div className="mx-auto w-full max-w-[1040px] px-[clamp(20px,4vw,48px)] pb-[140px] pt-4">
      <h2 className="text-[26px] font-bold tracking-[-0.01em]">Hackathons</h2>
      <p className="mt-1 text-sm text-ink-soft">
        Every event we index, and the winners that made the cut.
      </p>
      <div className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((e) => (
          <Link
            key={e.key}
            href={`/feed?q=${encodeURIComponent(e.hackathon)}`}
            className="group rounded-xl border border-line bg-paper-2 px-4 py-3 transition-transform hover:-translate-y-0.5"
          >
            <div className="flex items-baseline gap-2">
              <span className="text-[15px] font-bold tracking-[-0.01em]">{e.hackathon}</span>
              <span className="text-[13px] text-ink-soft">{e.year}</span>
            </div>
            <div className="mt-0.5 text-[13px] text-ink-soft">
              {e.teams ? `${e.teams} teams · ` : ""}
              {e.count} {e.count === 1 ? "winner" : "winners"} archived
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
