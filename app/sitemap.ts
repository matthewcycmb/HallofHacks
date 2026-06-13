import type { MetadataRoute } from "next";
import { getAllProjects } from "@/lib/projects";
import { siteUrl } from "@/lib/site-url";

/** Public, indexable pages: the main views + every project. */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();

  const pages: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/feed`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/categories`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/hackathons`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/terms`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const projects: MetadataRoute.Sitemap = getAllProjects().map((p) => ({
    url: `${base}/project/${p.slug}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...pages, ...projects];
}
