import OnboardingFlow, { type OnboardingData } from "@/components/handoff/OnboardingFlow";
import { getAllProjects, getFeatured } from "@/lib/projects";
import type { Project } from "@/lib/types";
import { DOMAIN_TAGS } from "@/lib/types";

function tagOf(p: Project): string {
  return DOMAIN_TAGS[p.domainTags[0]] ?? p.domainTags[0] ?? "Hack";
}

/** Home is the onboarding landing; the product feed lives at /feed. */
export default function Home() {
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
    // `top` is always present with the real dataset; guard the empty case so the
    // homepage can never crash on a TypeError.
    hero: top
      ? {
          name: top.name,
          prize: top.award,
          tag: tagOf(top),
          image: top.feedImage ?? top.image,
          event: `${top.hackathon} ${top.year}`,
          blurb: top.oneLiner,
        }
      : {
          name: "Hall of Hacks",
          prize: "Winner",
          tag: "Hack",
          image: "",
          event: "",
          blurb: "Browse the projects that won the world's biggest hackathons.",
        },
  };

  return <OnboardingFlow data={data} />;
}
