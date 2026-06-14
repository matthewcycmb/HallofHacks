/**
 * Build marketing/top15-contacts.md: per top-15 team, the best contact + channel,
 * every member's verified handles, and short/humane personalized DMs.
 * Sources: marketing/contacts.json (Devpost + GitHub-API + personal-site mined),
 * data/projects.json (award/links). Regenerate after re-running the scrapers.
 *
 * Usage: node scripts/generate-top15.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";

const SITE = "https://hallofhackss.com";
const contacts = JSON.parse(readFileSync("marketing/contacts.json", "utf8"));
const projects = JSON.parse(readFileSync("data/projects.json", "utf8"));
const meta = new Map(projects.map((p) => [p.slug, p]));
const first = (n) => (n || "").trim().split(/\s+/)[0];

// A specific, true detail per project — the "I actually looked at your project"
// opener. Edit these freely; they carry the whole message.
const OPENER = {
  "facetime-macos-ai-agent": "I still can't get over that you can literally FaceTime your own Mac and it does the thing while talking back.",
  "raising-cane": "the cane physically nudging someone toward the safe path instead of just beeping is such a smart reframe of the whole problem.",
  "temp-sqyptg": "the idea that your character keeps living and talking like you after you log off genuinely stuck with me.",
  "dial-4rqzc3": "the fact that you were actually stranded and your bots negotiated a real hotel room down to $158 is the best hackathon story I've read in a while.",
  "ross-42pnvi": "using warm and cold touch to let a blind person feel the colors of a painting is one of the most creative accessibility ideas I've seen.",
  "orca-4po0nm": "turning a melody you just hum into an actual editable song is exactly the kind of magic I wanted in the archive.",
  "dance-cv": "Just Dance for any video on the internet, with a coach that tells you what to fix, is such a good idea.",
  "yes-or-yes": "letting three real fish make the decision and then having the computer actually go do it is gloriously unhinged.",
  screwyouikea: "watching an IKEA manual turn into a spinnable 3D build animation is the thing I didn't know I needed.",
  longshot: "200 agents rebuilding Minecraft overnight from one sentence is the kind of swing I love seeing at a hackathon.",
  "shop-a-sketch": "drawing the thing you want to buy instead of trying to describe it in words is such a clean fix to a real problem.",
  "scamshield-87rbxe": "building a quiet guardian that catches scam calls for someone's grandparent is the kind of project that actually matters.",
  "snowy-day-3nfbgm": "the snowplow re-routing idea is such a satisfying take on a problem everyone in a snowy city complains about.",
  wordhawk: "a robot with an actual finger swiping Word Hunt faster than any human is so dumb in the best possible way.",
  diffuji: "an instant camera that prints dreamy repainted versions of your photos on receipt paper is such a vibe.",
};

const channelOf = (t) =>
  t.twitter ? ["Twitter", `https://twitter.com/${t.twitter.replace("@", "")}`]
  : t.linkedin ? ["LinkedIn", t.linkedin]
  : t.sites ? ["Site", t.sites[0]]
  : t.github ? ["GitHub", `https://github.com/${t.github}`]
  : ["Devpost", t.devpost];

// Pick the team's primary contact: best reachable channel, first-listed on ties.
const rank = (t) => (t.twitter ? 0 : t.linkedin ? 1 : t.sites ? 2 : t.github ? 3 : 4);

let md = `# Top 15 teams — who to DM and where\n\n`;
md += `Handles are self-listed (Devpost / GitHub profile / their own site) — accurate, `;
md += `not guessed. Message **one person per team** (the primary contact below); they'll `;
md += `tell their teammates. Personalize line 1, it's already done for you here.\n\n`;
md += `Channel priority: Twitter DM > LinkedIn > personal site contact > GitHub (profile `;
md += `lists email/site) > Devpost message.\n\n---\n\n`;

contacts.forEach((c, i) => {
  const p = meta.get(c.slug);
  const primary = [...c.team].sort((a, b) => rank(a) - rank(b))[0];
  const [pch, purl] = channelOf(primary);
  md += `## ${i + 1}. ${c.project} — ${c.hackathon}\n`;
  md += `${p.award} · Page: ${SITE}/project/${c.slug}\n\n`;
  md += `**Primary contact: ${primary.name} → ${pch}** (${purl})\n\n`;
  md += `| Member | Twitter | LinkedIn | GitHub | Site |\n|---|---|---|---|---|\n`;
  for (const t of c.team) {
    md += `| ${t.name} `;
    md += `| ${t.twitter || "—"} `;
    md += `| ${t.linkedin ? `[in](${t.linkedin})` : "—"} `;
    md += `| ${t.github ? `[${t.github}](https://github.com/${t.github})` : "—"} `;
    md += `| ${t.sites ? `[link](${t.sites[0]})` : "—"} |\n`;
  }
  const fn = first(primary.name);
  const opener = OPENER[c.slug] || `loved ${c.project}.`;
  const dm =
    `Hey ${fn} — ${opener} I put ${c.project} in Hall of Hacks, a gallery I made ` +
    `of the best winning hackathon projects to inspire people at their first one. ` +
    `Here's your page: ${SITE}/project/${c.slug}. Would mean a lot if you shared it ` +
    `with your circle — and there's a "Featured in Hall of Hacks" badge for your ` +
    `README if you want one. Either way, congrats on the win 🐊`;
  const dmShort =
    `hey ${fn}! ${opener} featured ${c.project} in Hall of Hacks, a gallery of the ` +
    `best winning hackathon projects → ${SITE}/project/${c.slug}. would love if you ` +
    `shared it 🐊 (README badge too if you want one)`;
  // LinkedIn invitations cap the note at 300 chars, so this is a connect-first
  // note (no long link); send the full DM above once they accept.
  const note =
    `Hey ${fn}! I featured ${c.project} (${c.hackathon}) in Hall of Hacks, a curated ` +
    `gallery of the best winning hackathon projects (hallofhackss.com). Would love to ` +
    `connect and share it with you 🐊`;
  md += `\n**Short DM (Twitter / email / Devpost — full, with link):**\n\n> ${dm}\n\n`;
  md += `**Twitter DM (shorter):**\n\n> ${dmShort}\n\n`;
  md += `**LinkedIn connect note (${note.length}/300 chars — send the full DM once they accept):**\n\n> ${note}\n\n---\n\n`;
});

writeFileSync("marketing/top15-contacts.md", md);
const flat = contacts.flatMap((c) => c.team);
console.log(`Wrote marketing/top15-contacts.md — ${contacts.length} teams, ${flat.length} builders`);
console.log(`Channel coverage: twitter ${flat.filter((t) => t.twitter).length} · linkedin ${flat.filter((t) => t.linkedin).length} · github ${flat.filter((t) => t.github).length} · site ${flat.filter((t) => t.sites).length}`);
