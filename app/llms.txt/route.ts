import { getAllProjects } from "@/lib/projects";
import { siteUrl } from "@/lib/site-url";

/**
 * /llms.txt — the emerging convention (llmstxt.org) for telling AI answer
 * engines what a site is and listing its key pages in plain markdown.
 * Generated from the live roster so it never goes stale.
 */
export function GET() {
  const base = siteUrl();
  const projects = getAllProjects();
  const lines = [
    "# Hall of Hacks",
    "",
    "> A curated archive of winning hackathon projects from the world's top hackathons (Hack the North, TreeHacks, CalHacks, MHacks, PennApps and more). Each entry explains, in plain language, what the project did and the one thing that made it win. Built to help first-time hackers find ideas and learn what wins.",
    "",
    "## Key pages",
    `- [Winning hackathon projects](${base}/feed): the full feed of every winning project in the archive`,
    `- [How to win a hackathon](${base}/guide): a guide to what actually wins, drawn from these projects`,
    `- [Categories](${base}/categories): winners grouped by kind (AI, hardware, games, social good, and more)`,
    `- [Hackathons](${base}/hackathons): every hackathon in the archive and its featured winners`,
    "",
    "## Projects",
    ...projects.map(
      (p) => `- [${p.name} — ${p.award}, ${p.hackathon} ${p.year}](${base}/project/${p.slug}): ${p.oneLiner}`,
    ),
    "",
  ];
  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
