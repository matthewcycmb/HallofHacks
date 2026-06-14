/**
 * Generate the marketing outreach kit from data/projects.json.
 *
 * Builds the "feature the builders + organizers, they become distribution"
 * loop into ready-to-send assets:
 *   marketing/builder-outreach.md    — per project: links, DM, share posts, badge
 *   marketing/organizer-outreach.md  — per hackathon: deep link + outreach message
 *   marketing/outreach-tracker.csv   — a spreadsheet CRM (one row per contact)
 *   marketing/README.md              — the playbook
 *
 * Usage: node scripts/generate-outreach.mjs
 * Re-run any time the roster changes. Output is regenerated, not hand-edited.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const SITE = "https://hallofhackss.com"; // prod custom domain (double "s")
const projects = JSON.parse(readFileSync("data/projects.json", "utf8"));

mkdirSync("marketing", { recursive: true });

const projUrl = (p) => `${SITE}/project/${p.slug}`;
const firstName = (n) => (n || "").trim().split(/\s+/)[0] || "there";
const enc = (s) => encodeURIComponent(s);
const eventLabel = (p) => `${p.hackathon} ${p.year}`;

// Per-project badge snippets (custom SVG + a shields.io fallback that is
// guaranteed to render through GitHub's image proxy).
const badgeMd = (p) =>
  `[![Featured in Hall of Hacks](${SITE}/featured-badge.svg)](${projUrl(p)})`;
const badgeShields = (p) =>
  `[![Featured in Hall of Hacks](https://img.shields.io/badge/Featured%20in-Hall%20of%20Hacks-e3b341?labelColor=0d0d0d&style=flat)](${projUrl(p)})`;
const badgeHtml = (p) =>
  `<a href="${projUrl(p)}"><img src="${SITE}/featured-badge.svg" alt="Featured in Hall of Hacks" height="32"></a>`;

// ---- builder copy ----------------------------------------------------------
const builderDM = (p) => {
  const names = p.team.map((t) => firstName(t.name));
  const cc = names.length > 1 ? `\n  _(teammates to tag/cc: ${names.join(", ")})_` : "";
  return (
    `Hey ${names[0]} — I built Hall of Hacks, a hand-picked gallery of the best ` +
    `winning hackathon projects, made to inspire people at their first hackathon. ` +
    `I featured **${p.name}** from ${eventLabel(p)} 🐊\n\n` +
    `  Your page: ${projUrl(p)}\n\n` +
    `  Would love it if you shared it with your network — and there's a ` +
    `"Featured in Hall of Hacks" badge below you can drop in your README or site. ` +
    `Congrats again on the win.` +
    cc
  );
};

const builderTweet = (p) =>
  `🐊 Our project ${p.name} from ${p.hackathon} got featured in Hall of Hacks — ` +
  `a curated gallery of the best winning hackathon projects. Check it out: ${projUrl(p)}`;

const builderLinkedIn = (p) =>
  `Excited to share that ${p.name}, which we built at ${eventLabel(p)}, has been ` +
  `featured in Hall of Hacks — a curated archive of standout winning hackathon ` +
  `projects that make you go "I want to build that." Honored to be included. ${projUrl(p)}`;

// ---- builder doc -----------------------------------------------------------
let b = `# Builder outreach kit\n\n`;
b += `${projects.length} projects · ${projects.reduce((n, p) => n + p.team.length, 0)} builders. `;
b += `Send each team a quick DM (Devpost message, GitHub, or their Twitter/LinkedIn), `;
b += `paste in their link + a share post, and include the badge. Personalize the first line.\n\n`;
b += `Channels you have for every team: Devpost profiles (below) and, for most, a GitHub repo. `;
b += `Track who you've reached in \`outreach-tracker.csv\`.\n\n---\n\n`;

for (const p of projects) {
  b += `## ${p.name} — ${eventLabel(p)}\n\n`;
  b += `- **Page:** ${projUrl(p)}\n`;
  b += `- **Award:** ${p.award}\n`;
  b += `- **Devpost:** ${p.devpostUrl}\n`;
  if (p.githubUrl) b += `- **GitHub:** ${p.githubUrl}\n`;
  b += `- **Team:** ${p.team
    .map((t) => (t.devpostProfileUrl ? `[${t.name}](${t.devpostProfileUrl})` : t.name))
    .join(" · ")}\n\n`;
  b += `**DM to send:**\n\n> ${builderDM(p).replace(/\n/g, "\n> ")}\n\n`;
  b += `**Tweet (for them to post):**\n\n> ${builderTweet(p)}\n\n`;
  b += `**LinkedIn (for them to post):**\n\n> ${builderLinkedIn(p)}\n\n`;
  b += `**Badge — README markdown:**\n\n\`\`\`md\n${badgeMd(p)}\n\`\`\`\n\n`;
  b += `**Badge — shields.io fallback (always renders on GitHub):**\n\n\`\`\`md\n${badgeShields(p)}\n\`\`\`\n\n`;
  b += `**Badge — HTML (for websites):**\n\n\`\`\`html\n${badgeHtml(p)}\n\`\`\`\n\n---\n\n`;
}
writeFileSync("marketing/builder-outreach.md", b);

// ---- organizer doc (grouped by hackathon name) -----------------------------
const byEvent = new Map();
for (const p of projects) {
  if (!byEvent.has(p.hackathon)) byEvent.set(p.hackathon, []);
  byEvent.get(p.hackathon).push(p);
}

let o = `# Organizer outreach kit\n\n`;
o += `${byEvent.size} hackathons. Organizers love showing off their winners — a link from `;
o += `their site, Discord, or alumni list reaches every past and future participant. `;
o += `Find the contact via the event's site, Twitter/X, or MLH page.\n\n---\n\n`;

for (const [hack, list] of byEvent) {
  const deep = `${SITE}/feed?q=${enc(hack)}`;
  o += `## ${hack}\n\n`;
  o += `- **Featured (${list.length}):** ${list.map((p) => `${p.name} (${p.year})`).join(", ")}\n`;
  o += `- **Deep link to their winners:** ${deep}\n\n`;
  o += `**Message to send:**\n\n`;
  o +=
    `> Hi ${hack} team — I built Hall of Hacks, a curated archive of the best winning ` +
    `projects from the world's top hackathons, made to inspire first-time hackers. ` +
    `${list.length} of your winners ${list.length === 1 ? "is" : "are"} featured: ` +
    `${list.map((p) => p.name).join(", ")}. Here's the page showing them: ${deep} — ` +
    `thought your community and alumni would love seeing them spotlighted. ` +
    `Happy to link back to your event too 🐊\n\n---\n\n`;
}
writeFileSync("marketing/organizer-outreach.md", o);

// ---- tracker CSV -----------------------------------------------------------
const q = (s) => `"${String(s ?? "").replace(/"/g, '""')}"`;
const rows = [
  ["type", "event", "project", "contact", "handle", "channel", "link", "status", "date_contacted", "shared", "notes"],
];
for (const p of projects) {
  for (const t of p.team) {
    rows.push([
      "builder",
      eventLabel(p),
      p.name,
      t.name,
      t.devpostProfileUrl || "",
      "Devpost",
      projUrl(p),
      "todo",
      "",
      "no",
      "",
    ]);
  }
}
for (const [hack, list] of byEvent) {
  rows.push([
    "organizer",
    hack,
    `${list.length} winners`,
    `${hack} team`,
    "",
    "find: site / X / MLH",
    `${SITE}/feed?q=${enc(hack)}`,
    "todo",
    "",
    "no",
    "",
  ]);
}
writeFileSync("marketing/outreach-tracker.csv", rows.map((r) => r.map(q).join(",")).join("\n") + "\n");

// ---- playbook README -------------------------------------------------------
const playbook = `# Marketing outreach kit

Generated by \`node scripts/generate-outreach.mjs\` from \`data/projects.json\`.
Re-run it whenever the roster changes. **Don't hand-edit these files** — edit the
copy templates in the script and regenerate. Use \`outreach-tracker.csv\` as your
working CRM (import it into Sheets).

## Why this works

The ${projects.length} featured projects are ${projects.reduce((n, p) => n + p.team.length, 0)} real builders
across ${byEvent.size} hackathons. Their networks are *exactly* your target users.
"I featured your winning project" is a message almost everyone shares with pride —
the featured party becomes your distribution (the loop that grew Mobbin and every
"awesome list").

## Order of operations

1. **Builders first (this week).** Work \`builder-outreach.md\` top-down (featured
   projects lead). DM each team via their Devpost profile or GitHub. Paste their
   link + a share post + the badge. Personalize the first line — generic blasts
   get ignored.
2. **Organizers next.** \`organizer-outreach.md\` — fewer contacts, bigger
   megaphones. One message per event, linking to their deep-linked winners.
3. **Log everything** in \`outreach-tracker.csv\`. Follow up once after ~4 days.

## The badge

Self-hosted at \`${SITE}/featured-badge.svg\` (asset: \`public/featured-badge.svg\`).
Each builder gets a ready snippet (README markdown, shields.io fallback, and HTML).
Every badge links back to that project's page — a backlink and a steady drip of
their audience to the site.

## Timing

Hackathon season peaks Sept–Nov. June is the slow part of the calendar: do the
builder/organizer loop now so the backlinks and relationships are in place, then
push hardest right before fall when first-timers are hunting for ideas.
`;
writeFileSync("marketing/README.md", playbook);

console.log(
  `Wrote marketing/ : builder-outreach.md, organizer-outreach.md, ` +
    `outreach-tracker.csv (${rows.length - 1} rows), README.md`,
);
console.log(`  ${projects.length} projects · ${rows.filter((r) => r[0] === "builder").length} builder contacts · ${byEvent.size} organizers`);
