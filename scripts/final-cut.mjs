/**
 * Apply the final roster: filter data/projects.json down to the slugs in
 * data/final-cut.json, in roster order. Records are already sanitized and
 * enriched, so this writes projects.json in place.
 *
 * Usage: node scripts/final-cut.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";

const projects = JSON.parse(readFileSync("data/projects.json", "utf8"));
const { roster } = JSON.parse(readFileSync("data/final-cut.json", "utf8"));
const blurbs = JSON.parse(readFileSync("data/blurbs.json", "utf8"));
const whyWon = JSON.parse(readFileSync("data/why-won.json", "utf8"));

const bySlug = new Map(projects.map((p) => [p.slug, p]));
const missing = roster.filter((s) => !bySlug.has(s));
if (missing.length) {
  console.warn("roster slugs missing from projects.json (check merged-raw.json):", missing);
}

const sizes = JSON.parse(readFileSync("data/event-sizes.json", "utf8"));

// "1st Place Overall" -> "1st out of 699 teams"; named prizes get the field
// size in parentheses (parentheses survive the chips' short-prize splitting).
function quantify(award, hackathon, year) {
  const size = sizes[`${hackathon} ${year}`];
  const a = award
    .replace(/(\d)(st|nd|rd) of (\d+) projects/, "$1$2 out of $3 teams")
    .replace(/\((\d+) projects\)/, "($1 teams)");
  if (!size || /\d+ teams/.test(a)) return a;
  const place = a.match(/\b([123])(st|nd|rd)\b/);
  if (place && /overall|place|grand|best/i.test(a)) {
    return `${place[1]}${place[2]} out of ${size} teams`;
  }
  const label = a.split(" — ")[0].split(" · ")[0];
  return `${label} (${size} teams)`;
}

// Typography pass: no em/en dashes anywhere in displayed text.
function scrubDashes(s) {
  if (typeof s !== "string") return s;
  return s
    .replace(/\s+[—–]\s+(\p{Ll})/gu, (_, c) => `. ${c.toUpperCase()}`)
    .replace(/\s+[—–]\s+/g, ". ")
    .replace(/[—–]/g, "-");
}

// Verbose Devpost titles ("FaceTimeOS: AI Mac Agent", "ROSS - Remote
// Operated...") wrap badly at display size; keep the lead segment.
function shortName(name) {
  if (name.length <= 22) return name;
  const lead = name.split(/:|\s-\s/)[0].trim();
  return lead.length >= 4 ? lead : name;
}

const final = roster.map((s) => bySlug.get(s)).filter(Boolean);
// The roster owns the featured ranks: first 10 in order, none elsewhere.
final.forEach((p, i) => {
  if (i < 10) p.featuredRank = i + 1;
  else delete p.featuredRank;
  p.name = shortName(p.name);
  p.award = scrubDashes(quantify(p.award, p.hackathon, p.year));
  p.oneLiner = blurbs[p.slug] ?? scrubDashes(p.oneLiner);
  p.description = scrubDashes(p.description);
  if (whyWon[p.slug]) p.whyWon = scrubDashes(whyWon[p.slug]);
});
writeFileSync("data/projects.json", JSON.stringify(final, null, 2));
console.log(`Final cut: ${final.length} projects (dropped ${projects.length - final.length}).`);
