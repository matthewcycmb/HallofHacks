export type Form = "software" | "hardware" | "both";

export interface TeamMember {
  name: string;
  devpostProfileUrl?: string;
}

export interface Project {
  slug: string;
  name: string;
  oneLiner: string;
  description: string;
  image: string;
  demoVideoUrl?: string;
  devpostUrl: string;
  githubUrl?: string;
  award: string;
  hackathon: string;
  year: number;
  domainTags: string[];
  form: Form;
  team: TeamMember[];
  /** 1-based rank; present only on the hand-curated pinned projects. */
  featuredRank?: number;
  /** Thumbnail's dominant color, extracted at ingest — painted before the image loads. */
  dominantColor?: string;
  /** Photographic alternative for feed tiles (video frame) when the Devpost thumb is a flat logo card. */
  feedImage?: string;
}

export const DOMAIN_TAGS: Record<string, string> = {
  "ai-ml": "AI/ML",
  health: "Health",
  fintech: "Fintech",
  games: "Games",
  "social-good": "Social Good",
  "dev-tools": "Dev Tools",
  "ar-vr": "AR/VR",
  sustainability: "Sustainability",
};

export const FORMS: Record<Form, string> = {
  software: "Software",
  hardware: "Hardware",
  both: "HW + SW",
};
