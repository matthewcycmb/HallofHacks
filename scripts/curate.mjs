/**
 * Curate the raw scrape down to ~100 keepers and pick the featured 15.
 *
 * Usage: node scripts/curate.mjs
 * Input:  data/raw-projects.json (+ optional data/tag-overrides.json)
 * Output: data/curated-projects.json (feed into sanitize.mjs)
 *
 * Scoring favors projects that demo well on a Pinterest grid: has a video,
 * has source, a substantive writeup, and a top-tier award.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const TARGET = 100;
const FEATURED = 15;

const raw = JSON.parse(readFileSync("data/raw-projects.json", "utf8"));
const overrides = existsSync("data/tag-overrides.json")
  ? JSON.parse(readFileSync("data/tag-overrides.json", "utf8"))
  : {};

function cleanAward(award) {
  return award
    .replace(/\s*\([^)]*\)/g, "") // strip prize-loot parentheticals
    .replace(/\s*\|\s*/g, " — ")
    .replace(/\s+/g, " ")
    .trim();
}

function score(p) {
  let s = 0;
  if (p.demoVideoUrl) s += 2;
  if (p.githubUrl) s += 1;
  if ((p.description ?? "").length > 300) s += 1;
  const a = p.award.toLowerCase();
  if (/grand|1st|first place|overall/.test(a)) s += 3;
  else if (/finalist|2nd|second place/.test(a)) s += 2.5;
  else if (/3rd|third place/.test(a)) s += 2;
  else if (/best|most|top/.test(a)) s += 1;
  if (p.team.length >= 2) s += 0.5;
  return s;
}

for (const p of raw) {
  p.award = cleanAward(p.award);
  p._score = score(p);
  const o = overrides[p.slug];
  if (o?.domainTags) p.domainTags = o.domainTags;
  if (o?.form) p.form = o.form;
  if (o?.drop) p._drop = true;
}

const pool = raw.filter((p) => !p._drop);
const byEvent = new Map();
for (const p of pool) {
  if (!byEvent.has(p.hackathon)) byEvent.set(p.hackathon, []);
  byEvent.get(p.hackathon).push(p);
}

// Proportional per-event quota (min 8), then balance to exactly TARGET.
const kept = [];
for (const [, list] of byEvent) {
  list.sort((a, b) => b._score - a._score);
  const quota = Math.max(8, Math.round((list.length / pool.length) * TARGET));
  kept.push(...list.slice(0, quota));
}
kept.sort((a, b) => b._score - a._score);
const final = kept.slice(0, TARGET);

// Featured: best ~2 per event, trimmed to FEATURED, ranked by score.
const featured = [];
for (const [, list] of byEvent) {
  featured.push(...list.filter((p) => final.includes(p)).slice(0, 2));
}
featured.sort((a, b) => b._score - a._score);
featured.slice(0, FEATURED).forEach((p, i) => {
  p.featuredRank = i + 1;
});

for (const p of final) delete p._score;
writeFileSync("data/curated-projects.json", JSON.stringify(final, null, 2));

const counts = {};
for (const p of final) counts[p.hackathon] = (counts[p.hackathon] ?? 0) + 1;
console.log(`Kept ${final.length} of ${pool.length}:`, counts);
console.log(`Featured: ${final.filter((p) => p.featuredRank).length}`);
console.log(`Untagged: ${final.filter((p) => p.domainTags.length === 0).length}`);
