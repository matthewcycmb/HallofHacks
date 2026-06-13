import type { Metadata } from "next";
import { Suspense } from "react";
import FeedSwitcher from "@/components/handoff/FeedSwitcher";
import { getAllProjects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Projects",
  description: "Browse the projects that won the world's biggest hackathons.",
};

export default function FeedPage() {
  return (
    <div className="min-h-0 flex-1">
      <Suspense fallback={null}>
        <FeedSwitcher projects={getAllProjects()} />
      </Suspense>
    </div>
  );
}
