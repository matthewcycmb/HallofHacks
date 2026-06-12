import type { Project } from "./types";
import { DOMAIN_TAGS } from "./types";

export interface Category {
  id: string;
  label: string;
  match: (p: Project) => boolean;
}

export const CATEGORIES: Category[] = [
  { id: "all", label: "All projects", match: () => true },
  ...Object.entries(DOMAIN_TAGS)
    .filter(([tag]) => tag !== "fintech")
    .map(([tag, label]) => ({
      id: tag,
      label,
      match: (p: Project) => p.domainTags.includes(tag),
    })),
  { id: "software", label: "Software", match: (p: Project) => p.form === "software" },
  {
    id: "hardware",
    label: "Hardware",
    match: (p: Project) => p.form === "hardware" || p.form === "both",
  },
];
