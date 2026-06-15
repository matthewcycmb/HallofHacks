/**
 * Scrape teams 16-50: find each team's lead and their LinkedIn (Devpost
 * self-listed -> GitHub-API blog field -> personal-site mining, in that order
 * of confidence), and pair it with the short outreach message.
 *
 * Usage: node scripts/scrape-rest.mjs
 * Output: marketing/rest-16-50.md  (+ appends teams to marketing/contacts.json)
 */
import { readFileSync, writeFileSync } from "node:fs";

const SITE = "https://hallofhackss.com";
const UA = "HallOfHacks-scout (contact: jchanh@gmail.com)";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const projects = JSON.parse(readFileSync("data/projects.json", "utf8")).slice(15); // 16-50
const first = (n) => (n || "").trim().split(/\s+/)[0];

const DEVPOST_OWN = /(twitter\.com\/devpost|linkedin\.com\/company\/devpost|facebook\.com\/devposthacks|discord\.com\/invite)/i;
const SOCIAL = /(github\.com|gitlab\.com|twitter\.com|x\.com|linkedin\.com|instagram\.com|youtube\.com|behance\.net|dribbble\.com|substack\.com)/i;

function classify(url) {
  let u = url.trim().replace(/(https?:\/\/[^/]+\/)https?:\/\//, "$1");
  if (/github\.com/i.test(u)) return ["github", u.replace(/.*github\.com\//i, "").replace(/\/.*/, "")];
  if (/(twitter\.com|x\.com)/i.test(u)) return ["twitter", "@" + u.replace(/.*(?:twitter\.com|x\.com)\//i, "").replace(/\/.*/, "")];
  if (/linkedin\.com/i.test(u)) return ["linkedin", u.replace(/\/$/, "")];
  if (SOCIAL.test(u)) return ["other", u];
  return ["site", u];
}

async function get(url, raw = false) {
  await sleep(350);
  try {
    const res = await fetch(url, { headers: { "User-Agent": raw ? "Mozilla/5.0 (HallOfHacks)" : UA } });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

async function devpostLinks(profileUrl) {
  const html = await get(profileUrl);
  if (!html) return {};
  const hrefs = [...html.matchAll(/<a\b[^>]*\brel="[^"]*nofollow[^"]*"[^>]*href="([^"]+)"|<a\b[^>]*href="([^"]+)"[^>]*\brel="[^"]*nofollow[^"]*"/gi)]
    .map((m) => m[1] || m[2])
    .filter((h) => h && !DEVPOST_OWN.test(h) && !/devpost\.com|challengepost|cloudfront/i.test(h));
  const out = {};
  for (const h of hrefs) {
    const [k, v] = classify(h);
    if (k === "other" || k === "site") (out.sites ??= []).push(v);
    else if (!out[k]) out[k] = v;
  }
  if (out.sites) out.sites = [...new Set(out.sites)];
  return out;
}

async function githubEnrich(t) {
  if (!t.github) return;
  await sleep(250);
  try {
    const res = await fetch(`https://api.github.com/users/${t.github}`, { headers: { "User-Agent": UA, Accept: "application/vnd.github+json" } });
    if (!res.ok) return;
    const j = await res.json();
    if (!t.twitter && j.twitter_username) t.twitter = "@" + j.twitter_username;
    if (j.blog) {
      const url = /^https?:\/\//.test(j.blog) ? j.blog : "https://" + j.blog;
      if (/linkedin\.com/i.test(url) && !t.linkedin) t.linkedin = url.replace(/\/$/, "");
      else if (!/linkedin\.com/i.test(url)) { (t.sites ??= []).push(url); t.sites = [...new Set(t.sites)]; }
    }
  } catch {}
}

async function mineSiteForLinkedIn(t) {
  if (t.linkedin || !t.sites) return;
  for (const s of t.sites) {
    const html = await get(s, true);
    const m = html && html.match(/https?:\/\/(?:[a-z]+\.)?linkedin\.com\/in\/[A-Za-z0-9._-]+/i);
    if (m) { t.linkedin = m[0].replace(/\/$/, ""); return; }
  }
}

const rank = (t) => (t.twitter ? 0 : t.linkedin ? 1 : t.sites ? 2 : t.github ? 3 : 4);
const out = [];

for (const p of projects) {
  const team = [];
  for (const m of p.team) {
    const links = m.devpostProfileUrl ? await devpostLinks(m.devpostProfileUrl) : {};
    team.push({ name: m.name, devpost: m.devpostProfileUrl, ...links });
  }
  for (const t of team) await githubEnrich(t);
  // Lead = best reachable channel. Make sure we surface a LinkedIn: mine the
  // lead's site, and if still none, mine other members and use the best one.
  const lead = [...team].sort((a, b) => rank(a) - rank(b))[0];
  await mineSiteForLinkedIn(lead);
  let liContact = lead;
  if (!lead.linkedin) {
    for (const t of team) { if (t !== lead) await mineSiteForLinkedIn(t); }
    liContact = team.find((t) => t.linkedin) || lead;
  }
  const fn = first(liContact.name);
  const msg = `Hey ${fn}! I featured ${p.name} on a site I built with the best winning hackathon projects — here's your page: ${SITE}/project/${p.slug}. thought you'd want to see it!`;
  out.push({ project: p.name, slug: p.slug, lead: liContact.name, isPrimary: liContact === lead, linkedin: liContact.linkedin || null, fallback: liContact.linkedin ? null : (liContact.sites?.[0] || (liContact.github ? `https://github.com/${liContact.github}` : liContact.devpost)), message: msg, team });
  process.stdout.write(`  ${p.name}: ${liContact.name} ${liContact.linkedin || "(no LinkedIn -> " + (out.at(-1).fallback) + ")"}\n`);
}

// Append full team data to contacts.json for the record.
const contacts = JSON.parse(readFileSync("marketing/contacts.json", "utf8"));
for (const r of out) if (!contacts.some((c) => c.slug === r.slug)) contacts.push({ project: r.project, slug: r.slug, team: r.team });
writeFileSync("marketing/contacts.json", JSON.stringify(contacts, null, 2));

// Run sheet: LinkedIn + short message per team.
let md = `# Teams 16-50 — lead LinkedIn + message\n\nLinkedIn of each team's lead, with the short message to paste. `;
md += `Handles are self-listed (Devpost / GitHub / their own site), not guessed.\n\n`;
out.forEach((r, i) => {
  md += `### [ ] ${i + 16}. ${r.project} — ${r.lead}${r.isPrimary ? "" : " (teammate; lead had no LinkedIn)"}\n`;
  md += r.linkedin ? `**LinkedIn:** ${r.linkedin}\n\n` : `**No LinkedIn found — use:** ${r.fallback}\n\n`;
  md += "```\n" + r.message + "\n```\n\n";
});
writeFileSync("marketing/rest-16-50.md", md);

const noLi = out.filter((r) => !r.linkedin);
console.log(`\nWrote marketing/rest-16-50.md — ${out.length} teams`);
console.log(`LinkedIn found for ${out.length - noLi.length}/${out.length}.` + (noLi.length ? ` No LinkedIn: ${noLi.map((r) => r.project).join(", ")}` : ""));
