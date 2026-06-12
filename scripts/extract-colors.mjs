/**
 * Extract each project thumbnail's dominant color so tiles can paint
 * instantly as colored blocks before the image loads (Pinterest-style).
 *
 * Usage: node scripts/extract-colors.mjs [file=data/projects.json]
 * Mutates the file in place, adding `dominantColor: "#rrggbb"`.
 */
import { readFileSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const file = process.argv[2] ?? "data/projects.json";
const projects = JSON.parse(readFileSync(file, "utf8"));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let done = 0;
for (const p of projects) {
  if (p.dominantColor) {
    done++;
    continue;
  }
  try {
    await sleep(120);
    const res = await fetch(p.image, {
      headers: { "User-Agent": "HallOfHacks-PoC/0.1 (color extraction)" },
    });
    if (!res.ok) throw new Error(String(res.status));
    const buf = Buffer.from(await res.arrayBuffer());
    const { dominant } = await sharp(buf).stats();
    const hex = `#${[dominant.r, dominant.g, dominant.b]
      .map((c) => c.toString(16).padStart(2, "0"))
      .join("")}`;
    p.dominantColor = hex;
    done++;
    process.stdout.write(`  ${done}/${projects.length} ${p.slug} ${hex}\r`);
  } catch (e) {
    console.warn(`\n  failed for ${p.slug}: ${e.message}`);
  }
}

writeFileSync(file, JSON.stringify(projects, null, 2));
console.log(`\nWrote dominant colors for ${done}/${projects.length} -> ${file}`);
