/**
 * Build marketing/organizer-outreach.md: per hackathon, the verified organizer
 * contacts (best person + LinkedIn, email, org page) paired with how many of
 * their winners are featured, a deep link, and the pre-filled human message.
 *
 * Contacts were researched from public sources (event sites, MLH, press,
 * LinkedIn-indexed headlines). LinkedIn blocks direct fetch, so URLs are
 * verified by role text naming the hackathon — give each a quick eyeball
 * before sending. People are listed best-amplifier-first.
 *
 * Usage: node scripts/generate-organizers.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";

const SITE = "https://hallofhackss.com";
const projects = JSON.parse(readFileSync("data/projects.json", "utf8"));
const sizes = JSON.parse(readFileSync("data/event-sizes.json", "utf8"));
const first = (n) => (n || "").trim().split(/\s+/)[0];
const enc = encodeURIComponent;

// Researched organizer contacts, keyed by the hackathon field in projects.json.
// people[] is ordered best-amplifier-first (marketing/social/partnerships > director).
const CONTACTS = {
  "Cal Hacks 12.0": { emails: ["team@hackberkeley.org", "sponsorship@hackberkeley.org"], page: "https://www.linkedin.com/company/cal-hacks", people: [{ n: "Christopher Blu Lopez", r: "Marketing Director", li: "https://www.linkedin.com/in/christopher-blu-lopez" }, { n: "Flora Wang", r: "Executive Director", li: "https://www.linkedin.com/in/florawwang" }] },
  TreeHacks: { emails: ["hello@treehacks.com"], page: "https://www.linkedin.com/company/treehacks", people: [{ n: "Hannah T. Shu", r: "Social & Marketing Chair", li: "https://www.linkedin.com/in/hannah-shu/" }, { n: "Hannah Gao", r: "Sponsorships / Co-Director", li: "https://www.linkedin.com/in/hannahsgao/" }, { n: "Thijs Simonian", r: "Co-Director (Tech)", li: "https://www.linkedin.com/in/thijsdev/" }] },
  "Hack the North": { emails: ["hello@hackthenorth.com", "sponsor@hackthenorth.com"], page: "https://www.linkedin.com/company/hack-the-north", people: [{ n: "Ian Korovinsky", r: "Co-Director", li: "https://www.linkedin.com/in/ian-korovinsky/" }] },
  "LA Hacks": { emails: ["info@lahacks.com"], page: "https://www.linkedin.com/company/lahacks", people: [{ n: "Harris Song", r: "Marketing Director", li: "https://www.linkedin.com/in/harris-song/" }, { n: "Roland Yang", r: "Executive Director", li: "https://www.linkedin.com/in/yangroland/" }] },
  HackGT: { emails: ["hello@hexlabs.org"], page: "https://www.linkedin.com/company/thehexlabs", people: [{ n: "Faiza Rafika", r: "Catalyst Director, HexLabs", li: "https://www.linkedin.com/in/faiza-rafika/" }], note: "Run by HexLabs. No verified marketing lead — hello@hexlabs.org is the best inbox." },
  ConUHacks: { emails: ["team.hackconcordia@ecaconcordia.ca", "sponsor.hackconcordia@ecaconcordia.ca"], page: "https://www.linkedin.com/company/hackconcordia", people: [{ n: "Elizabeth Wong", r: "Co-President, HackConcordia", li: "https://www.linkedin.com/in/e-lizabethwong/" }, { n: "Bertin Mihigo Sano", r: "Co-President", li: "https://www.linkedin.com/in/sanobertin/" }] },
  HooHacks: { emails: ["hackathon.virginia@gmail.com"], page: "https://www.linkedin.com/company/hoohacks", people: [{ n: "Richard Do", r: "Marketing lead", li: "https://www.linkedin.com/in/richarddo3/" }, { n: "Shrihan Vijay", r: "External Relations", li: "https://www.linkedin.com/in/shrihan-vijay-0b5b86313" }] },
  Bitcamp: { emails: ["hello@bit.camp", "sponsorship@bit.camp"], page: "https://www.linkedin.com/company/bitcamp", people: [{ n: "Sharvari Tirodkar", r: "Co-Executive Director", li: "https://www.linkedin.com/in/stirodka/" }, { n: "Anjali Samavedam", r: "Co-Executive Director (Sponsorship)", li: "https://www.linkedin.com/in/anjali-samavedam/" }] },
  StormHacks: { emails: ["sfusurge@gmail.com"], page: "https://www.linkedin.com/company/sfu-surge", people: [{ n: "Christina Raganit", r: "Director of Visual Design", li: "https://www.linkedin.com/in/christinaraganit/" }, { n: "Josie Trinh", r: "President, SFU Surge", li: "https://ca.linkedin.com/in/josietrinh" }] },
  HackPrinceton: { emails: ["team@hackprinceton.com"], page: "https://www.linkedin.com/company/hackprinceton", people: [{ n: "Ray Kong", r: "Director (branding/marketing)", li: "https://www.linkedin.com/in/raykongcs/" }, { n: "Andrew Cho", r: "Director", li: "https://www.linkedin.com/in/andcho/" }, { n: "Hammad Farooqi", r: "Director", li: "https://www.linkedin.com/in/hammad-farooqi/" }] },
  uOttaHack: { emails: [], page: "https://www.linkedin.com/company/uottahack", people: [{ n: "Ayushi Dosieah", r: "Marketing Director", li: "https://www.linkedin.com/in/ayushi-dosieah/" }, { n: "Edwin Ngui", r: "Co-Director", li: "https://ca.linkedin.com/in/edwin-ngui" }], note: "No public email (Cloudflare-masked) — use LinkedIn or Instagram @uottahack." },
  nwHacks: { emails: ["info@nwplus.io", "sponsorship@nwplus.io"], page: "https://ca.linkedin.com/company/nwplus", people: [{ n: "Jennifer Nguyen", r: "nwHacks Director", li: "https://ca.linkedin.com/in/jennguyen-ubc" }, { n: "Anna Kovtunenko", r: "Co-President, nwPlus", li: "https://ca.linkedin.com/in/anna-kovtunenko" }] },
  UofTHacks: { emails: ["contact@uofthacks.com", "sponsors@uofthacks.com"], page: "https://www.linkedin.com/company/uoftorontohacks", people: [{ n: "Richie Kong", r: "VP Marketing & Design (verify)", li: "https://www.linkedin.com/in/richiekong/" }, { n: "Yannick Longval", r: "President", li: "https://ca.linkedin.com/in/yannick-longval-5662a7222" }] },
  HackHarvard: { emails: ["team@hackharvard.io", "sponsors@hackharvard.io"], page: "https://www.linkedin.com/company/hackharvardcollege", people: [{ n: "Hugo Núñez", r: "Executive Director", li: "https://www.linkedin.com/in/hugo-n%C3%BA%C3%B1ez-b7645722a/" }] },
  DeltaHacks: { emails: ["hello@deltahacks.com"], page: "https://www.linkedin.com/company/deltahacks", people: [{ n: "Gayan Athukorala", r: "VP Sponsorship (verify)", li: "https://ca.linkedin.com/in/gayanathukorala" }], note: "hello@deltahacks.com is the most reliable contact." },
  McHacks: { emails: ["contact@mchacks.ca", "sponsorship@mchacks.ca"], page: "https://www.linkedin.com/company/mchacks", people: [{ n: "Amy Dao", r: "Deputy Director of PR & Outreach", li: "https://www.linkedin.com/in/amyddao/" }] },
  "Hack the Valley": { emails: ["hello@hackthevalley.io"], page: "https://www.linkedin.com/company/hack-the-valley", people: [{ n: "Emily Choi", r: "Director, Marketing & Design", li: "https://www.linkedin.com/in/emily-j-choi-/" }, { n: "Wing Ho Xu", r: "Lead Organizer", li: "https://www.linkedin.com/in/winghoxu/" }] },
  MHacks: { emails: ["hackathon@umich.edu"], page: "https://www.linkedin.com/company/mhacks", people: [{ n: "Spencer Goodwin", r: "Co-Director", li: "https://www.linkedin.com/in/spencer-goodwin/" }, { n: "Adviti Mishra", r: "Co-Director", li: "https://www.linkedin.com/in/advitimishra/" }] },
  SwampHacks: { emails: ["contact@swamphacks.com"], page: "https://www.linkedin.com/company/swamphacks", people: [{ n: "Domenica Simbana Mosquera", r: "Marketing Lead → Exec Director", li: "https://www.linkedin.com/in/domenica-simbana/" }, { n: "Shane Downs", r: "President / Organizer", li: "https://www.linkedin.com/in/shanemdowns/" }] },
  "PennApps XXVI": { emails: ["contact@pennapps.com", "sponsor@pennapps.com"], page: "https://www.linkedin.com/company/pennapps", people: [{ n: "Rachel Lin", r: "Creative / Design Lead", li: "https://www.linkedin.com/in/rachel-lin-452834213/" }], note: "Emails are long-standing but were read off an older mirror — confirm before sending." },
  "Hack Western": { emails: [], page: "https://www.linkedin.com/company/hack-western", people: [{ n: "Freda Zhao", r: "Sponsorship Lead", li: "https://www.linkedin.com/in/freda-zhao-984442210/" }], note: "No public email (Cloudflare-masked) — use LinkedIn or the site's contact form." },
  QHacks: { emails: ["hello@qhacks.io"], page: "https://www.linkedin.com/company/qhacks", people: [{ n: "Adam Raco", r: "Partnerships Director (may be alum)", li: "https://ca.linkedin.com/in/adam-raco" }, { n: "Amanda Cao", r: "Co-Chair", li: "https://ca.linkedin.com/in/amanda-cao-b214a2290" }] },
  "cmd-f": { emails: ["info@nwplus.io", "sponsorship@nwplus.io"], page: "https://www.linkedin.com/company/nwplus", people: [{ n: "Cristen Lin", r: "Marketing Director, nwPlus (may be alum)", li: "https://www.linkedin.com/in/cristen-lin/" }, { n: "Anna Kovtunenko", r: "Co-President, nwPlus", li: "https://ca.linkedin.com/in/anna-kovtunenko" }], note: "Same org (nwPlus) as nwHacks — don't double-message the same person across both." },
  YHack: { emails: ["yhack@yhack.org"], page: "https://www.linkedin.com/company/yhack", people: [{ n: "Michael Gao", r: "Organizer (verify exact role)", li: "https://www.linkedin.com/in/michael-gao-yale27/" }] },
};

// Group winners by hackathon, ordered by event size (priority).
const byEvent = new Map();
for (const p of projects) {
  if (!byEvent.has(p.hackathon)) byEvent.set(p.hackathon, []);
  byEvent.get(p.hackathon).push(p);
}
const events = [...byEvent.entries()]
  .map(([hack, list]) => ({ hack, list, size: Math.max(...list.map((p) => Number(sizes[`${p.hackathon} ${p.year}`] || 0))) }))
  .sort((a, b) => b.size - a.size);

const generalEmail = (emails) => emails.find((e) => !/sponsor/i.test(e)) || emails[0] || null;

let md = `# Organizer outreach — LinkedIn + email per hackathon\n\n`;
md += `One copy-paste block per event, ordered by reach (biggest first). Each has the best person to contact, `;
md += `their LinkedIn, the event email, the winners you featured, and the message ready to paste. `;
md += `**Swap [your reel link] for your actual Reel.** Message ONE person per event (best-amplifier listed first).\n\n`;
md += `> Handles were researched from public sources and verified by role, but LinkedIn blocks direct checks — `;
md += `give each profile a 5-second eyeball before sending. Where a role says "(verify)" or "(may be alum)", double-check it's current.\n\n---\n\n`;

events.forEach(({ hack, list }, i) => {
  const c = CONTACTS[hack] || { emails: [], page: null, people: [] };
  const lead = c.people[0];
  const email = generalEmail(c.emails);
  const deep = `${SITE}/feed?q=${enc(hack)}`;
  const names = list.map((p) => p.name);
  const examples = names.slice(0, 2).join(" and ");
  const greet = lead ? first(lead.n) : `${hack} team`;

  md += `### [ ] ${i + 1}. ${hack} — ${list.length} featured winner${list.length > 1 ? "s" : ""}\n`;
  md += `Winners: ${names.join(", ")}\n`;
  md += `Their winners page: ${deep}\n\n`;
  md += `**Contact (message one):**\n`;
  if (c.people.length) {
    for (const p of c.people) md += `- ${p.n} — ${p.r}: ${p.li}\n`;
  }
  md += email ? `- Email: ${email}${c.emails.length > 1 ? ` (also ${c.emails.filter((e) => e !== email).join(", ")})` : ""}\n` : `- Email: none public\n`;
  md += `- Event LinkedIn page: ${c.page || "n/a"}\n`;
  if (c.note) md += `- Note: ${c.note}\n`;

  const emailMsg =
    `Hi ${greet},\n\n` +
    `I'm Matthew. I built a site called Hall of Hacks that collects the best winning projects from hackathons, so people heading to their first one can see what actually wins. I just added ${list.length} ${list.length > 1 ? "projects" : "project"} from ${hack}, like ${examples}.\n\n` +
    `Here's the page with all of them: ${deep}\n\n` +
    `Figured your community and alumni would love seeing their winners spotlighted, so feel free to share it. I also made a short video featuring some of these projects: [your reel link]. You're welcome to repost it on the ${hack} page if your team likes it.\n\n` +
    `Either way, congrats on running such a good event.\n\nMatthew\nhallofhackss.com`;

  const note = lead
    ? `Hi ${first(lead.n)}! I featured ${list.length} of ${hack}'s winning projects on a site I built, Hall of Hacks (hallofhackss.com). Thought your community would love seeing them spotlighted, and I made a short video on them you could repost too. Sending it your way!`
    : null;

  md += `\n**Email / DM message:**\n\n\`\`\`\n${emailMsg}\n\`\`\`\n\n`;
  if (note) md += `**LinkedIn connect note (${note.length}/300):**\n\n\`\`\`\n${note}\n\`\`\`\n\n`;
  md += `---\n\n`;
});

writeFileSync("marketing/organizer-outreach.md", md);
const withEmail = events.filter((e) => (CONTACTS[e.hack]?.emails || []).length).length;
const withPerson = events.filter((e) => (CONTACTS[e.hack]?.people || []).length).length;
console.log(`Wrote marketing/organizer-outreach.md — ${events.length} events`);
console.log(`Coverage: ${withPerson}/${events.length} with a named LinkedIn contact, ${withEmail}/${events.length} with a public email`);
