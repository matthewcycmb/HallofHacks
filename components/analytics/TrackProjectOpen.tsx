"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

/**
 * Fires a `project_opened` event whenever a project's detail is viewed —
 * works on the project page and in the feed's detail console (server-rendered
 * ProjectDetail can't run effects itself). Re-fires when the viewed project
 * changes so the desktop console counts each project the user opens.
 */
export default function TrackProjectOpen({
  slug,
  name,
  hackathon,
}: {
  slug: string;
  name: string;
  hackathon: string;
}) {
  useEffect(() => {
    track("project_opened", { slug, name, hackathon });
  }, [slug, name, hackathon]);
  return null;
}
