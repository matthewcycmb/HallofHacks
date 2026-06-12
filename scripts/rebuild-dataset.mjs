/**
 * Rebuild data/projects.json around the reading-list curation:
 *   kept existing projects (data/keep-list.json)
 * + imported reading-list records (data/reading-list-raw.json)
 * with overlap patches (sharper one-liners, featured ranks 1-10)
 * and data/tag-overrides.json applied on top.
 *
 * Output ordering = reading order: featured 1-10, then the rest of the
 * reading list (manifest order), then surviving non-list projects.
 *
 * Usage: node scripts/rebuild-dataset.mjs
 * Output: data/merged-raw.json (feed into sanitize.mjs)
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";

// Kept-base: full provenance (pre-final-cut) when available, so the pipeline
// stays rerunnable after projects.json has been trimmed.
const base = existsSync("data/merged-raw.json") ? "data/merged-raw.json" : "data/projects.json";
const current = JSON.parse(readFileSync(base, "utf8"));
const keep = JSON.parse(readFileSync("data/keep-list.json", "utf8"));
const { records: imported, patches } = JSON.parse(readFileSync("data/reading-list-raw.json", "utf8"));
const overrides = existsSync("data/tag-overrides.json")
  ? JSON.parse(readFileSync("data/tag-overrides.json", "utf8"))
  : {};

const keptSlugs = new Set([...keep.overlapsWithReadingList, ...keep.keepers]);
const kept = current.filter((p) => keptSlugs.has(p.slug));
const missing = [...keptSlugs].filter((s) => !kept.some((p) => p.slug === s));
if (missing.length) console.warn("keep-list slugs not found in projects.json:", missing);

// Patch the overlap records with the reading list's sharper text + ranks.
for (const patch of patches) {
  const p = kept.find((k) => k.slug === patch.slug);
  if (!p) {
    console.warn(`patch target missing: ${patch.slug}`);
    continue;
  }
  p.oneLiner = patch.oneLiner;
  if (patch.award) p.award = patch.award;
  if (patch.featuredRank) p.featuredRank = patch.featuredRank;
  else delete p.featuredRank;
}
// Featured ranks now belong exclusively to the 10 highest-density reads.
for (const p of kept) {
  if (!patches.some((x) => x.slug === p.slug && x.featuredRank)) delete p.featuredRank;
}

// Imported records (drop any accidental dupes of existing slugs).
const existingSlugs = new Set(kept.map((p) => p.slug));
const fresh = imported.filter((r) => {
  if (existingSlugs.has(r.slug)) {
    console.warn(`import duplicates existing slug, skipping: ${r.slug}`);
    return false;
  }
  return true;
});

// Tag overrides apply to everything.
const all = [...fresh, ...kept];
for (const p of all) {
  const o = overrides[p.slug];
  if (o?.domainTags) p.domainTags = o.domainTags;
  if (o?.form) p.form = o.form;
}

// Reading order: featured 1-10 → rest of imports (manifest order) → keepers.
const featured = all
  .filter((p) => p.featuredRank)
  .sort((a, b) => a.featuredRank - b.featuredRank);
const restImports = fresh.filter((p) => !p.featuredRank);
const restKept = kept.filter((p) => !p.featuredRank);
const ordered = [...featured, ...restImports, ...restKept];

writeFileSync("data/merged-raw.json", JSON.stringify(ordered, null, 2));
const events = {};
for (const p of ordered) events[`${p.hackathon} ${p.year}`] = (events[`${p.hackathon} ${p.year}`] ?? 0) + 1;
console.log(`Merged ${ordered.length} projects (${fresh.length} imported + ${kept.length} kept) -> data/merged-raw.json`);
console.log("Untagged:", ordered.filter((p) => p.domainTags.length === 0).map((p) => p.slug));
console.log("Events:", events);
