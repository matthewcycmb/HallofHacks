/**
 * Scout 2026 galleries for overall-podium winners (1st/2nd/3rd overall,
 * grand prizes) as candidates for the roster. Review output by hand —
 * the wow bar (beginner-graspable, no new hardware / deep ML, sponsor
 * prizes only if wowing) is applied by a human, not this script.
 *
 * Usage: node scripts/scout-2026.mjs
 * Output: data/scout-2026.json
 */
import { writeFileSync } from "node:fs";

const GALLERIES = [
  ["treehacks-2026", "TreeHacks", 2026],
  ["nwhacks-2026", "nwHacks", 2026],
  ["uofthacks-13", "UofTHacks", 2026],
  ["deltahacks-12", "DeltaHacks", 2026],
  ["qhacks-2026", "QHacks", 2026],
  ["la-hacks-2026", "LA Hacks", 2026],
  ["hoohacks-2026", "HooHacks", 2026],
  ["bitcamp-2026", "Bitcamp", 2026],
  ["hacklytics-2026", "Hacklytics", 2026],
  ["cmd-f-2026", "cmd-f", 2026],
  ["journeyhacks2026", "JourneyHacks", 2026],
  ["hackthecoast", "Hack the Coast", 2026],
  ["produhacks-2026", "ProduHacks", 2026],
  ["youcode-2026", "youCode", 2026],
  ["uottahack8", "uOttaHack", 2026],
  // Yale hunt — probe likely subdomains
  ["yhack", "YHack", 2026],
  ["yhack-2026", "YHack", 2026],
  ["yhacks-2026", "YHack", 2026],
];

const PODIUM = /(1st|2nd|3rd|first|second|third)\s+(place\s+)?(overall|prize)|grand\s+prize|best\s+overall|overall\s+(winner|1st|2nd|3rd)/i;

const DELAY_MS = 300;
const UA = "HallOfHacks-PoC/0.1 (podium scout; contact: jchanh@gmail.com)";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function get(url) {
  await sleep(DELAY_MS);
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(String(res.status));
  return res.text();
}

function strip(html) {
  return html.replace(/<[^>]+>/g, " ").replace(/&[#a-z0-9]+;/gi, " ").replace(/\s+/g, " ").trim();
}

const candidates = [];
const seen = new Set();

for (const [sub, event, year] of GALLERIES) {
  let gallery;
  try {
    gallery = await get(`https://${sub}.devpost.com/project-gallery`);
  } catch (e) {
    console.warn(`gallery miss ${sub}: ${e.message}`);
    continue;
  }
  const chunks = gallery.split('class="large-4 small-12 columns gallery-item"').slice(1);
  const winners = chunks
    .filter((c) => /entry-badge/.test(c) && /Winner/.test(c))
    .map((c) => c.match(/href="(https:\/\/devpost\.com\/software\/[^"]+)"/)?.[1])
    .filter(Boolean)
    .slice(0, 12);
  console.log(`${event}: ${winners.length} winner pages to check`);

  for (const url of winners) {
    const slug = url.split("/software/")[1];
    if (seen.has(slug)) continue;
    seen.add(slug);
    let page;
    try {
      page = await get(url);
    } catch {
      continue;
    }
    const prizes = [...page.matchAll(/<span class="winner label[^"]*">Winner<\/span>\s*([\s\S]*?)<\/li>/g)].map((m) =>
      strip(m[1]),
    );
    if (!prizes.some((p) => PODIUM.test(p))) continue;
    const tagline = page.match(/<meta property="og:description" content="([^"]*)"/)?.[1] ?? "";
    const name = page.match(/<meta property="og:title" content="([^"]*)"/)?.[1] ?? slug;
    const image = page.match(/<meta property="og:image" content="([^"]*)"/)?.[1];
    const video = /youtube(-nocookie)?\.com\/embed\//.test(page);
    const builtWith = [...page.matchAll(/<span class="cp-tag"[^>]*>([^<]*)<\/span>/g)].map((m) => m[1].trim());
    let block = page.match(/id="app-details-left"([\s\S]*?)(?:Built With|id="app-team")/)?.[1] ?? "";
    const h2 = block.search(/<h2/);
    if (h2 > -1) block = block.slice(h2);
    const desc = strip(block).slice(0, 350);
    candidates.push({ slug, name, event: `${event} ${year}`, prizes, tagline, desc, video, image: !!image, builtWith });
    console.log(`  podium: ${name} — ${prizes.find((p) => PODIUM.test(p))}`);
  }
}

writeFileSync("data/scout-2026.json", JSON.stringify(candidates, null, 2));
console.log(`\n${candidates.length} podium candidates -> data/scout-2026.json`);
