import { Suspense } from "react";
import FeedSwitcher from "@/components/handoff/FeedSwitcher";
import { getAllProjects } from "@/lib/projects";

export default function Home() {
  return (
    <div className="min-h-0 flex-1">
      <Suspense fallback={null}>
        <FeedSwitcher projects={getAllProjects()} />
      </Suspense>
    </div>
  );
}
