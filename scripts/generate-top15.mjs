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
// A short, casual reaction clause (no trailing period) — it lands *after* the
// "was going through winning projects and yours stood out" framing, so it reads
// like a real reaction, not a cold-opened compliment.
const OPENER = {
  "facetime-macos-ai-agent": "being able to call your own Mac and have it actually do stuff for you is so cool",
  "raising-cane": "a cane that steers you toward the clear path instead of just beeping at you is so clever",
  "temp-sqyptg": "the idea that your character stays online after you log off, so your friends can still hang out with an AI version of you that talks like you, is such a cool concept",
  "dial-4rqzc3": "the fact that you were actually stranded and built AI phone bots to call real hotels and haggle one down to $158 is hilarious",
  "ross-42pnvi": "drawing a painting onto someone's palm with hot and cold so they can feel the colors is such a cool idea",
  "orca-4po0nm": "being able to just hum something and turn it into a real song is so cool",
  "dance-cv": "it's basically Just Dance for any video online, but the coach actually tells you what you're getting wrong",
  "yes-or-yes": "letting real pet fish pick your decisions by which side of the tank they swim to, then having the computer actually do it, is so funny",
  screwyouikea: "turning an IKEA manual into a 3D thing you can spin around and follow is genuinely so smart",
  longshot: "200 AI coding agents working together overnight to rebuild Minecraft from a single prompt is wild",
  "shop-a-sketch": "letting people draw what they want to buy instead of trying to describe it is such a good idea",
  "scamshield-87rbxe": "something that catches scam calls and warns grandparents, then texts the family, is honestly so needed",
  "snowy-day-3nfbgm": "rerouting snowplows so no street gets skipped is such a satisfying thing to solve",
  wordhawk: "a little robot finger that swipes Word Hunt faster than any human could is so dumb in the best way",
  diffuji: "an instant camera that reprints your photos as these dreamy painted versions on receipt paper is such a vibe",
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
    `Hey ${fn}! I've been going through a bunch of winning hackathon projects lately ` +
    `and ${c.project} stood out — ${opener}. I added it to Hall of Hacks, a site I built ` +
    `collecting the best ones so people doing their first hackathon have something to ` +
    `get inspired by. Here's your page: ${SITE}/project/${c.slug}. Would be awesome if ` +
    `you shared it, and I made a "Featured in Hall of Hacks" badge you can throw on your ` +
    `README if you want. Congrats on the win 🐊`;
  const dmShort =
    `hey ${fn}! been going through winning hackathon projects and ${c.project} stood out ` +
    `— ${opener}. added it to Hall of Hacks, a site I built collecting the best ones → ` +
    `${SITE}/project/${c.slug}. would be awesome if you shared it 🐊 (made a readme badge too if you want)`;
  // LinkedIn invitations cap the note at 300 chars. Lead with what's in it for
  // them (their project is featured + their page), not a "let's connect" ask.
  const note =
    `Hey ${fn}! I featured ${c.project} on a site I built with the best winning ` +
    `hackathon projects — here's your page: ${SITE}/project/${c.slug}. thought you'd ` +
    `want to see it!`;
  md += `\n**Short DM (Twitter / email / Devpost — full, with link):**\n\n> ${dm}\n\n`;
  md += `**Twitter DM (shorter):**\n\n> ${dmShort}\n\n`;
  md += `**LinkedIn connect note (${note.length}/300 chars — send the full DM once they accept):**\n\n> ${note}\n\n---\n\n`;
});

writeFileSync("marketing/top15-contacts.md", md);
const flat = contacts.flatMap((c) => c.team);
console.log(`Wrote marketing/top15-contacts.md — ${contacts.length} teams, ${flat.length} builders`);
console.log(`Channel coverage: twitter ${flat.filter((t) => t.twitter).length} · linkedin ${flat.filter((t) => t.linkedin).length} · github ${flat.filter((t) => t.github).length} · site ${flat.filter((t) => t.sites).length}`);
