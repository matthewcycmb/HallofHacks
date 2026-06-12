import type { Project } from "./types";
import rawProjects from "@/data/projects.json";

const projects = rawProjects as Project[];

export function getAllProjects(): Project[] {
  return projects;
}

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getFeatured(list: Project[]): Project[] {
  return list
    .filter((p) => p.featuredRank !== undefined)
    .sort((a, b) => (a.featuredRank ?? 0) - (b.featuredRank ?? 0));
}

export function getUnfeatured(list: Project[]): Project[] {
  return list.filter((p) => p.featuredRank === undefined);
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Deterministic shuffle for a given seed — stable within a visit. */
export function seededShuffle<T>(items: T[], seed: number): T[] {
  const rand = mulberry32(seed);
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export interface FeedFilters {
  query: string;
  domainTags: string[];
  forms: string[];
}

export function filterProjects(list: Project[], filters: FeedFilters): Project[] {
  const q = filters.query.trim().toLowerCase();
  return list.filter((p) => {
    if (filters.domainTags.length > 0 && !filters.domainTags.some((t) => p.domainTags.includes(t))) {
      return false;
    }
    if (filters.forms.length > 0 && !filters.forms.includes(p.form)) {
      return false;
    }
    if (q.length > 0) {
      const haystack = [p.name, p.oneLiner, p.hackathon, p.award, ...p.domainTags]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}
