/**
 * One-time assisted scrape of Devpost winner galleries.
 *
 * Usage: node scripts/scrape.mjs [--limit-events N]
 * Output: data/raw-projects.json (review manually, then run sanitize.mjs)
 *
 * Polite scraping: serial requests with a delay, identifies itself via UA.
 */
import { writeFileSync, mkdirSync } from "node:fs";

const EVENTS = [
  { subdomain: "hackthenorth2025", hackathon: "Hack the North", year: 2025 },
  { subdomain: "treehacks-2025", hackathon: "TreeHacks", year: 2025 },
  { subdomain: "cal-hacks-12-0", hackathon: "Cal Hacks 12.0", year: 2025 },
  { subdomain: "mhacks-2025", hackathon: "MHacks", year: 2025 },
  { subdomain: "pennapps-xxvi", hackathon: "PennApps XXVI", year: 2025 },
  { subdomain: "hackharvard-2025", hackathon: "HackHarvard", year: 2025 },
  { subdomain: "nwhacks-2025", hackathon: "nwHacks", year: 2025 },
  { subdomain: "hackprinceton-fall-2025", hackathon: "HackPrinceton", year: 2025 },
];

const DELAY_MS = 350;
const UA = "HallOfHacks-PoC/0.1 (one-time archive of winning projects; contact: jchanh@gmail.com)";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function get(url) {
  await sleep(DELAY_MS);
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`${res.status} for ${url}`);
  return res.text();
}

function decodeEntities(s) {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, " ");
}

function stripTags(html) {
  return decodeEntities(html.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
}

function parseGalleryPage(html) {
  const chunks = html.split('class="large-4 small-12 columns gallery-item"').slice(1);
  return chunks.map((chunk) => {
    const url = chunk.match(/href="(https:\/\/devpost\.com\/software\/[^"]+)"/)?.[1];
    const name = chunk.match(/<h5>\s*([\s\S]*?)\s*<\/h5>/)?.[1];
    const tagline = chunk.match(/<p class="small tagline">\s*([\s\S]*?)\s*<\/p>/)?.[1];
    const image = chunk.match(/<img[^>]*class="software_thumbnail_image[^>]*?src="([^"]+)"/s)?.[1];
    const winner = /entry-badge/.test(chunk) && /Winner/.test(chunk);
    const team = [...chunk.matchAll(/class="user-profile-link"[^>]*data-url="([^"]+)"[^>]*>\s*<img alt="([^"]*)"/g)].map(
      (m) => ({ name: decodeEntities(m[2]).trim(), devpostProfileUrl: m[1] }),
    );
    return url && name
      ? { devpostUrl: url, name: stripTags(name), oneLiner: tagline ? stripTags(tagline) : "", image, winner, team }
      : null;
  }).filter(Boolean);
}

function parseProjectPage(html, eventName) {
  // Specific prizes: <li><span class="winner label ...">Winner</span> Event: Prize</li>
  const awards = [...html.matchAll(/<span class="winner label[^"]*">Winner<\/span>\s*([\s\S]*?)<\/li>/g)]
    .map((m) => stripTags(m[1]))
    .map((a) => {
      // "Hack the North 2025: Finalists" -> "Finalists", but keep
      // sponsor prefixes like "Warp: Best Developer Tool" intact.
      const colon = a.indexOf(":");
      if (colon > -1 && a.slice(0, colon).toLowerCase().includes(eventName.split(" ")[0].toLowerCase())) {
        return a.slice(colon + 1).trim();
      }
      return a;
    })
    .filter(Boolean);

  let demoVideoUrl;
  const videoSrc = html.match(/<iframe[^>]*class="video-embed"[^>]*src="([^"]+)"/)?.[1] ??
    html.match(/<iframe[^>]*src="([^"]*(?:youtube\.com|youtube-nocookie\.com|player\.vimeo\.com)[^"]*)"/)?.[1];
  if (videoSrc) {
    const yt = videoSrc.match(/(?:youtube(?:-nocookie)?\.com)\/embed\/([A-Za-z0-9_-]{6,})/);
    const vimeo = videoSrc.match(/player\.vimeo\.com\/video\/(\d+)/);
    if (yt) demoVideoUrl = `https://www.youtube-nocookie.com/embed/${yt[1]}`;
    else if (vimeo) demoVideoUrl = `https://player.vimeo.com/video/${vimeo[1]}`;
  }

  const urlsBlock = html.match(/data-role="software-urls"[\s\S]*?<\/ul>/)?.[0] ?? "";
  const githubUrl = [...urlsBlock.matchAll(/href="([^"]+)"/g)].map((m) => m[1]).find((u) => u.includes("github.com"));

  const ogImage = html.match(/<meta property="og:image" content="([^"]*)"/)?.[1];

  let detailsBlock = html.match(/id="app-details-left"([\s\S]*?)(?:Built With|id="app-team")/)?.[1] ?? "";
  // The writeup starts at the first <h2> ("Inspiration"); anything before
  // it is media-carousel captions.
  const firstHeading = detailsBlock.search(/<h2/);
  if (firstHeading > -1) detailsBlock = detailsBlock.slice(firstHeading);
  const paragraphs = [...detailsBlock.matchAll(/<p>([\s\S]*?)<\/p>/g)].map((m) => stripTags(m[1])).filter((p) => p.length > 30);
  let description = paragraphs.join(" ").slice(0, 750);
  const lastPeriod = description.lastIndexOf(". ");
  if (lastPeriod > 300) description = description.slice(0, lastPeriod + 1);

  const builtWith = [...html.matchAll(/<span class="cp-tag"[^>]*>([^<]*)<\/span>/g)].map((m) => m[1].trim().toLowerCase());

  return { awards, demoVideoUrl, githubUrl, ogImage, description, builtWith };
}

const TAG_KEYWORDS = {
  "ai-ml": ["ai ", " ai", "machine learning", "neural", "llm", "gpt", "opencv", "computer vision", "vision model", "tensorflow", "pytorch", "gemini", "claude", "nlp", "ml ", "model", "rag", "agent"],
  health: ["health", "medical", "patient", "therap", "fitness", "mental", "sleep", "diagnos", "clinic", "drug", "cancer", "asl", "sign language"],
  fintech: ["financ", "payment", "bank", "money", "budget", "crypto", "stock", "trading", "wallet", "invest"],
  games: ["game", "arcade", "puzzle", "multiplayer", "unity", "godot", "player"],
  "social-good": ["accessib", "community", "donat", "nonprofit", "education", "refugee", "safety", "inclusi", "volunteer", "disaster"],
  "dev-tools": ["developer", " api", "cli ", "debug", "codebase", "deploy", "ide ", "devtool", "open source", "documentation"],
  "ar-vr": ["augmented reality", "virtual reality", " ar ", " vr ", "hololens", "quest", "headset", "xr "],
  sustainability: ["climate", "sustainab", "recycl", "compost", "energy", "carbon", "waste", "farm", "environment", "solar"],
};

const HARDWARE_KEYWORDS = ["arduino", "raspberry", "esp32", "pcb", "sensor", "robot", "embedded", "iot", "3d print", "cad", "stm32", "servo", "motor", "circuit", "firmware", "lidar", "drone"];

function suggestTags(text) {
  const t = ` ${text.toLowerCase()} `;
  const domainTags = Object.entries(TAG_KEYWORDS)
    .filter(([, kws]) => kws.some((k) => t.includes(k)))
    .map(([tag]) => tag);
  const form = HARDWARE_KEYWORDS.some((k) => t.includes(k)) ? "both" : "software";
  return { domainTags, form };
}

async function main() {
  const limitEvents = process.argv.includes("--limit-events")
    ? Number(process.argv[process.argv.indexOf("--limit-events") + 1])
    : EVENTS.length;
  const all = [];

  for (const event of EVENTS.slice(0, limitEvents)) {
    console.log(`\n=== ${event.hackathon} (${event.subdomain}) ===`);
    const winners = [];
    for (let page = 1; page <= 20; page++) {
      let html;
      try {
        html = await get(`https://${event.subdomain}.devpost.com/project-gallery?page=${page}`);
      } catch (e) {
        console.warn(`  gallery page ${page} failed: ${e.message}`);
        break;
      }
      const entries = parseGalleryPage(html);
      if (entries.length === 0) break;
      winners.push(...entries.filter((e) => e.winner));
      process.stdout.write(`  page ${page}: ${entries.length} entries, ${winners.length} winners so far\r`);
    }
    console.log(`\n  ${winners.length} winners found; fetching detail pages…`);

    for (const w of winners) {
      // A Pinterest card without a real screenshot is dead weight — skip.
      if (!w.image || !w.image.includes("/software_thumbnail_photos/")) continue;
      let detail;
      try {
        detail = parseProjectPage(await get(w.devpostUrl), event.hackathon);
      } catch (e) {
        console.warn(`  detail failed for ${w.devpostUrl}: ${e.message}`);
        continue;
      }
      const slug = w.devpostUrl.split("/software/")[1].replace(/[^a-z0-9-]/gi, "");
      const { domainTags, form } = suggestTags(
        [w.name, w.oneLiner, detail.description, detail.builtWith.join(" ")].join(" "),
      );
      all.push({
        slug,
        name: w.name,
        oneLiner: w.oneLiner,
        description: detail.description || w.oneLiner,
        image: (detail.ogImage || w.image).replace(/^http:/, "https:"),
        ...(detail.demoVideoUrl ? { demoVideoUrl: detail.demoVideoUrl } : {}),
        devpostUrl: w.devpostUrl,
        ...(detail.githubUrl ? { githubUrl: detail.githubUrl } : {}),
        award: detail.awards.length ? detail.awards.join(" · ") : "Winner",
        hackathon: event.hackathon,
        year: event.year,
        domainTags,
        form,
        team: w.team,
      });
      process.stdout.write(`  collected ${all.length} total\r`);
    }
    console.log("");
  }

  mkdirSync("data", { recursive: true });
  writeFileSync("data/raw-projects.json", JSON.stringify(all, null, 2));
  console.log(`\nWrote ${all.length} winners to data/raw-projects.json`);
  const untagged = all.filter((p) => p.domainTags.length === 0).length;
  if (untagged) console.log(`${untagged} projects have no suggested domain tags — tag them during review.`);
}

main();
