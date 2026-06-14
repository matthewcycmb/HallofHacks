/**
 * Structured-data (schema.org) builders for search engines and AI answer
 * engines. Rendered via <JsonLd>. Keep these factual and in sync with the
 * visible page content.
 */
import { siteUrl } from "./site-url";
import type { Project } from "./types";

const DESCRIPTION =
  "A curated archive of winning hackathon projects from the world's top hackathons, with what each one did and why it won.";

/** Organization + WebSite, emitted once on the root layout. The WebSite's
 *  SearchAction tells Google the site has its own search (sitelinks box). */
export function siteJsonLd() {
  const base = siteUrl();
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${base}/#org`,
        name: "Hall of Hacks",
        url: base,
        logo: `${base}/icon.png`,
      },
      {
        "@type": "WebSite",
        "@id": `${base}/#website`,
        url: base,
        name: "Hall of Hacks",
        description: DESCRIPTION,
        publisher: { "@id": `${base}/#org` },
        potentialAction: {
          "@type": "SearchAction",
          target: { "@type": "EntryPoint", urlTemplate: `${base}/feed?q={search_term_string}` },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };
}

/** The feed as a CollectionPage wrapping an ordered ItemList of every winner. */
export function feedJsonLd(projects: Project[]) {
  const base = siteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Winning Hackathon Projects",
    description: DESCRIPTION,
    url: `${base}/feed`,
    isPartOf: { "@id": `${base}/#website` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: projects.length,
      itemListElement: projects.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${base}/project/${p.slug}`,
        name: p.name,
      })),
    },
  };
}

/** A single winning project. */
export function projectJsonLd(p: Project) {
  const base = siteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: p.name,
    headline: `${p.name} — ${p.award}, ${p.hackathon} ${p.year}`,
    description: p.oneLiner,
    abstract: p.whyWon,
    image: p.image,
    url: `${base}/project/${p.slug}`,
    award: p.award,
    dateCreated: String(p.year),
    keywords: [...(p.domainTags ?? []), "hackathon", p.hackathon, "winning hackathon project"].join(", "),
    creator: (p.team ?? []).map((t) => ({ "@type": "Person", name: t.name, url: t.devpostProfileUrl })),
    isPartOf: { "@id": `${base}/#website` },
  };
}

/** The how-to-win guide, as an Article. */
export function guideJsonLd() {
  const base = siteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "How to Win a Hackathon",
    description:
      "What actually wins hackathons, drawn from dozens of grand-prize and finalist projects: pick a real problem, make the demo work for real, and tell a story judges remember.",
    url: `${base}/guide`,
    mainEntityOfPage: `${base}/guide`,
    author: { "@id": `${base}/#org` },
    publisher: { "@id": `${base}/#org` },
    isPartOf: { "@id": `${base}/#website` },
  };
}
