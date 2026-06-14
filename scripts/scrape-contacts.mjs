/**
 * Pull self-listed social links (Twitter/X, LinkedIn, GitHub, site) for the
 * builders on the top-N projects, straight from their own Devpost profiles.
 * These are the most accurate handles available: the person declared them.
 * Footer/Devpost links are excluded (only rel="nofollow" anchors = the user's).
 *
 * Usage: node scripts/scrape-contacts.mjs [N=15]
 * Output: marketing/contacts.json  (consumed for the outreach doc)
 */
import { readFileSync, writeFileSync } from "node:fs";

const N = Number(process.argv[2] || 15);
const projects = JSON.parse(readFileSync("data/projects.json", "utf8")).slice(0, N);
const UA = "HallOfHacks-scout (contact: jchanh@gmail.com)";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const SOCIAL = /(github\.com|gitlab\.com|twitter\.com|x\.com|linkedin\.com|instagram\.com|youtube\.com|youtu\.be|behance\.net|dribbble\.com|devfolio|substack\.com)/i;
const DEVPOST_OWN = /(twitter\.com\/devpost|linkedin\.com\/company\/devpost|facebook\.com\/devposthacks|discord\.com\/invite)/i;

function classify(url) {
  let u = url.trim();
  // Devpost double-prefixes when a user pastes a full URL into a handle field.
  u = u.replace(/(https?:\/\/[^/]+\/)https?:\/\//, "$1");
  if (/github\.com/i.test(u)) return ["github", u.replace(/.*github\.com\//i, "").replace(/\/.*/, "")];
  if (/(twitter\.com|x\.com)/i.test(u)) return ["twitter", "@" + u.replace(/.*(?:twitter\.com|x\.com)\//i, "").replace(/\/.*/, "")];
  if (/linkedin\.com/i.test(u)) return ["linkedin", u.replace(/\/$/, "")];
  if (SOCIAL.test(u)) return ["other", u];
  return ["site", u]; // a personal website (rel=nofollow, non-social domain)
}

async function profileLinks(profileUrl) {
  try {
    await sleep(400);
    const res = await fetch(profileUrl, { headers: { "User-Agent": UA } });
    if (!res.ok) return { error: res.status };
    const html = await res.text();
    // The user's own links are rel="nofollow" anchors; Devpost's footer isn't.
    const hrefs = [...html.matchAll(/<a\b[^>]*\brel="[^"]*nofollow[^"]*"[^>]*href="([^"]+)"|<a\b[^>]*href="([^"]+)"[^>]*\brel="[^"]*nofollow[^"]*"/gi)]
      .map((m) => m[1] || m[2])
      .filter((h) => h && !DEVPOST_OWN.test(h) && !/devpost\.com|challengepost|cloudfront/i.test(h));
    const out = {};
    for (const h of hrefs) {
      const [kind, val] = classify(h);
      if (kind === "other" || kind === "site") (out.sites ??= []).push(val);
      else if (!out[kind]) out[kind] = val;
    }
    if (out.sites) out.sites = [...new Set(out.sites)];
    return out;
  } catch (e) {
    return { error: String(e).slice(0, 60) };
  }
}

const result = [];
for (const p of projects) {
  const team = [];
  for (const t of p.team) {
    const links = t.devpostProfileUrl ? await profileLinks(t.devpostProfileUrl) : {};
    team.push({ name: t.name, devpost: t.devpostProfileUrl, ...links });
    const got = ["twitter", "linkedin", "github"].filter((k) => links[k]);
    process.stdout.write(`  ${p.name} / ${t.name}: ${got.join(",") || (links.sites ? "site" : "—")}\n`);
  }
  result.push({ project: p.name, slug: p.slug, hackathon: `${p.hackathon} ${p.year}`, team });
}
writeFileSync("marketing/contacts.json", JSON.stringify(result, null, 2));

const flat = result.flatMap((r) => r.team);
const have = (k) => flat.filter((t) => t[k]).length;
console.log(`\n${flat.length} builders across ${result.length} teams (Devpost self-listed):`);
console.log(`  twitter: ${have("twitter")} · linkedin: ${have("linkedin")} · github: ${have("github")} · site: ${flat.filter((t) => t.sites).length}`);
