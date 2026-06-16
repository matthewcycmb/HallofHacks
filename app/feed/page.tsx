import type { Metadata } from "next";
import { Suspense } from "react";
import FeedSwitcher from "@/components/handoff/FeedSwitcher";
import JsonLd from "@/components/JsonLd";
import { getAllProjects } from "@/lib/projects";
import { feedJsonLd } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "50+ Winning Hackathon Project Examples",
  description:
    "50+ real examples of winning hackathon projects from TreeHacks, Cal Hacks, Hack the North, MHacks and more, with what each one built and why it won.",
  // ?q= and ?cat= are filtered views of this same list: point them all here
  // so search engines don't index dozens of thin duplicates.
  alternates: { canonical: "/feed" },
};

export default function FeedPage() {
  const projects = getAllProjects();
  return (
    <div className="min-h-0 flex-1">
      <JsonLd data={feedJsonLd(projects)} />
      <Suspense fallback={null}>
        <FeedSwitcher projects={projects} />
      </Suspense>
    </div>
  );
}
