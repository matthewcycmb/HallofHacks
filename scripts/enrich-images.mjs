/**
 * Feed-image enrichment: Devpost thumbnails are often flat logo cards, which
 * makes the feed read as a "logo wall". For projects whose thumbnail has low
 * pixel variance (flat) and which have a YouTube demo, swap the FEED image to
 * the video's thumbnail — a real photographic frame. The original screenshot
 * stays as `image` for the detail view.
 *
 * Usage: node scripts/enrich-images.mjs [file=data/projects.json]
 * Adds: feedImage? (https://i.ytimg.com/...), updates dominantColor to match.
 */
import { readFileSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const file = process.argv[2] ?? "data/projects.json";
const projects = JSON.parse(readFileSync(file, "utf8"));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function analyze(url) {
  const res = await fetch(url, { headers: { "User-Agent": "HallOfHacks-PoC/0.1" } });
  if (!res.ok) throw new Error(String(res.status));
  const buf = Buffer.from(await res.arrayBuffer());
  const stats = await sharp(buf).stats();
  const variance =
    stats.channels.slice(0, 3).reduce((acc, c) => acc + c.stdev, 0) / 3;
  const { dominant } = stats;
  const hex = `#${[dominant.r, dominant.g, dominant.b]
    .map((c) => c.toString(16).padStart(2, "0"))
    .join("")}`;
  return { variance, hex };
}

const FLAT_THRESHOLD = 42;
let swapped = 0;

for (const [i, p] of projects.entries()) {
  const ytId = p.demoVideoUrl?.match(/youtube-nocookie\.com\/embed\/([A-Za-z0-9_-]{6,})/)?.[1];
  if (!ytId || p.feedImage) continue;
  try {
    await sleep(120);
    const original = await analyze(p.image);
    if (original.variance >= FLAT_THRESHOLD) continue; // already photographic enough
    const thumbUrl = `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`;
    const thumb = await analyze(thumbUrl);
    // Only swap if the video frame is meaningfully richer than the logo card.
    if (thumb.variance > original.variance + 12) {
      p.feedImage = thumbUrl;
      p.dominantColor = thumb.hex;
      swapped++;
      process.stdout.write(`  swapped ${p.slug} (${Math.round(original.variance)} -> ${Math.round(thumb.variance)})\n`);
    }
  } catch (e) {
    console.warn(`  skipped ${p.slug}: ${e.message}`);
  }
  process.stdout.write(`  ${i + 1}/${projects.length}\r`);
}

writeFileSync(file, JSON.stringify(projects, null, 2));
console.log(`\nSwapped ${swapped} flat thumbnails to video frames -> ${file}`);
