/**
 * Sanitize + validate scraped data before it enters the app.
 *
 * Usage: node scripts/sanitize.mjs [input=data/raw-projects.json] [output=data/projects.json]
 *
 * - Strips any residual HTML and control characters from every text field
 * - Drops media URLs whose host is not on the allowlist
 * - Drops projects with no usable image
 * - Enforces unique slugs and field length caps
 */
import { readFileSync, writeFileSync } from "node:fs";

// Keep in sync with lib/allowlist.ts
const ALLOWED_IMAGE_HOSTS = ["d112y698adiu2z.cloudfront.net", "devpost.com", "*.devpost.com", "i.ytimg.com"];
const ALLOWED_VIDEO_EMBED_HOSTS = ["www.youtube-nocookie.com", "www.youtube.com", "player.vimeo.com"];

function isAllowedHost(url, allowlist) {
  let host;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    host = parsed.hostname;
  } catch {
    return false;
  }
  return allowlist.some((p) =>
    p.startsWith("*.") ? host === p.slice(2) || host.endsWith(p.slice(1)) : host === p,
  );
}

// Decode the HTML entities Devpost leaves in text (e.g. d&#39;Asson -> d'Asson).
// Runs before tag-stripping so a decoded "<...>" is still removed; &amp; is
// decoded last so &amp;#39; resolves to the literal "&#39;", not an apostrophe.
function decodeEntities(value) {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => fromCodePoint(parseInt(d, 10)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");
}

function fromCodePoint(cp) {
  try {
    return Number.isFinite(cp) && cp >= 0 && cp <= 0x10ffff ? String.fromCodePoint(cp) : "";
  } catch {
    return "";
  }
}

function cleanText(value, max) {
  if (typeof value !== "string") return "";
  return decodeEntities(value)
    .replace(/<[^>]*>/g, " ") // any HTML that survived the scrape
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

// Drop duplicate teammates (Devpost sometimes lists the same person twice, e.g.
// once with an undecoded entity in the name). Keyed on the cleaned name.
function dedupeTeam(members) {
  const seen = new Set();
  const out = [];
  for (const m of members) {
    const key = m.name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(m);
  }
  return out;
}

const input = process.argv[2] ?? "data/raw-projects.json";
const output = process.argv[3] ?? "data/projects.json";
const raw = JSON.parse(readFileSync(input, "utf8"));

const seen = new Set();
const dropped = [];
const clean = [];

for (const p of raw) {
  const slug = cleanText(p.slug, 100).toLowerCase().replace(/[^a-z0-9-]/g, "");
  if (!slug || seen.has(slug)) {
    dropped.push(`${p.slug}: missing or duplicate slug`);
    continue;
  }
  if (!p.image || !isAllowedHost(p.image, ALLOWED_IMAGE_HOSTS)) {
    dropped.push(`${slug}: image missing or host not allowlisted (${p.image})`);
    continue;
  }
  if (!p.devpostUrl || !isAllowedHost(p.devpostUrl, ["devpost.com", "*.devpost.com"])) {
    dropped.push(`${slug}: bad devpost url`);
    continue;
  }
  const demoVideoUrl =
    p.demoVideoUrl && isAllowedHost(p.demoVideoUrl, ALLOWED_VIDEO_EMBED_HOSTS) ? p.demoVideoUrl : undefined;

  seen.add(slug);
  clean.push({
    slug,
    name: cleanText(p.name, 80) || slug,
    oneLiner: cleanText(p.oneLiner, 200),
    description: cleanText(p.description, 900),
    image: p.image,
    ...(demoVideoUrl ? { demoVideoUrl } : {}),
    devpostUrl: p.devpostUrl,
    ...(p.githubUrl && /^https:\/\/github\.com\//.test(p.githubUrl) ? { githubUrl: p.githubUrl } : {}),
    award: cleanText(p.award, 120) || "Winner",
    hackathon: cleanText(p.hackathon, 60),
    year: Number(p.year) || 2025,
    domainTags: Array.isArray(p.domainTags) ? p.domainTags.map((t) => cleanText(t, 30)).filter(Boolean) : [],
    form: ["software", "hardware", "both"].includes(p.form) ? p.form : "software",
    team: Array.isArray(p.team)
      ? dedupeTeam(
          p.team
            .map((m) => ({
              name: cleanText(m.name, 60),
              ...(m.devpostProfileUrl && isAllowedHost(m.devpostProfileUrl, ["devpost.com", "*.devpost.com"])
                ? { devpostProfileUrl: m.devpostProfileUrl }
                : {}),
            }))
            .filter((m) => m.name),
        )
      : [],
    ...(Number.isInteger(p.featuredRank) ? { featuredRank: p.featuredRank } : {}),
    ...(typeof p.dominantColor === "string" && /^#[0-9a-f]{6}$/i.test(p.dominantColor)
      ? { dominantColor: p.dominantColor.toLowerCase() }
      : {}),
    ...(p.feedImage && isAllowedHost(p.feedImage, ALLOWED_IMAGE_HOSTS)
      ? { feedImage: p.feedImage }
      : {}),
  });
}

writeFileSync(output, JSON.stringify(clean, null, 2));
console.log(`Sanitized ${clean.length} projects -> ${output}`);
if (dropped.length) {
  console.log(`Dropped ${dropped.length}:`);
  for (const d of dropped) console.log(`  - ${d}`);
}
