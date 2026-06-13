import type { Metadata } from "next";
import OnboardingFlow, { type OnboardingData } from "@/components/handoff/OnboardingFlow";
import { getAllProjects, getFeatured } from "@/lib/projects";
import type { Project } from "@/lib/types";
import { DOMAIN_TAGS } from "@/lib/types";

export const metadata: Metadata = {
  title: "Get started",
  description:
    "The ultimate feed for winning hackathon projects. Free forever. Takes ten seconds.",
};

function tagOf(p: Project): string {
  return DOMAIN_TAGS[p.domainTags[0]] ?? p.domainTags[0] ?? "Hack";
}

export default function OnboardingPage() {
  const projects = getAllProjects();

  // The mockup mirrors the top of the real feed: dataset order is roster
  // order, so the first two event groups are the ones visitors see first.
  const byEvent = new Map<string, Project[]>();
  for (const p of projects) {
    const event = `${p.hackathon} ${p.year}`;
    byEvent.set(event, [...(byEvent.get(event) ?? []), p]);
  }
  const groups = [...byEvent.entries()].slice(0, 2).map(([event, items]) => ({
    event,
    count: items.length,
    items: items.slice(0, 2).map((p) => ({
      name: p.name,
      prize: p.award,
      tag: tagOf(p),
      image: p.feedImage ?? p.image,
    })),
  }));

  const top = getFeatured(projects)[0] ?? projects[0];
  const data: OnboardingData = {
    stats: { projects: projects.length, hackathons: byEvent.size },
    groups,
    hero: {
      name: top.name,
      prize: top.award,
      tag: tagOf(top),
      image: top.feedImage ?? top.image,
      event: `${top.hackathon} ${top.year}`,
      blurb: top.oneLiner,
    },
  };

  return <OnboardingFlow data={data} />;
}
