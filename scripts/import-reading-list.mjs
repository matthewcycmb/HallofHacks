/**
 * Import the curated hackathon reading list (~/MET/hackathon-reading-list.md)
 * into raw project records by fetching each entry's Devpost page.
 *
 * Usage: node scripts/import-reading-list.mjs
 * Output: data/reading-list-raw.json  ->  { records: [...], patches: [...] }
 *
 * The MANIFEST below is hand-transcribed from the MD: the blurbs are the
 * list's insight lines (better than Devpost taglines), awards come from the
 * list, and featuredRank 1-10 mirrors "the 10 highest-density reads".
 * `patch: true` entries already exist in our dataset — only their blurb /
 * award / featuredRank get patched onto the existing record.
 */
import { writeFileSync, mkdirSync } from "node:fs";

const MANIFEST = [
  // ---- The 10 highest-density reads ----
  { slug: "facetime-macos-ai-agent", hackathon: "Cal Hacks 12.0", year: 2025, award: "1st Place Overall — 1st of 699", featuredRank: 1,
    blurb: "FaceTime your Mac and an agent executes tasks while talking back on the call — virtual audio devices hijack FaceTime's stream." },
  { slug: "raising-cane", hackathon: "TreeHacks", year: 2026, award: "Grand Prize", featuredRank: 2,
    blurb: "Motorized white cane that physically steers blind users at 1/20 commercial cost — steer toward maximum clearance, not away from obstacles." },
  { slug: "freak-in-the-sheets-7jl542", hackathon: "TreeHacks", year: 2026, award: "Most Technically Complex", featuredRank: 3,
    blurb: "A real LLVM backend that compiles C to a Google Sheet — 16,666 ints per cell via Unicode memory packing." },
  { slug: "temp-sqyptg", hackathon: "UofTHacks", year: 2026, award: "1st Place Overall", featuredRank: 4,
    blurb: "Multiplayer pixel world where your avatar becomes a persistent AI agent with your personality when you log off." },
  { slug: "quota-fg4pzi", hackathon: "DeltaHacks", year: 2026, award: "1st Place Overall", featuredRank: 5,
    blurb: "A linter for your budget: flags expensive API calls as you type via tree-sitter AST parsing." },
  { slug: "dial-4rqzc3", hackathon: "Cal Hacks 12.0", year: 2025, award: "Winner", featuredRank: 6,
    blurb: "Stranded without housing, they built voice agents that phoned 100+ real hotels and negotiated a luxury room down to $158." },
  { slug: "ross-42pnvi", hackathon: "Hack the North", year: 2025, award: "Finalist", featuredRank: 7, patch: true,
    blurb: "Paintings for blind users: a robot draws the artwork on your palm using temperature as the color channel." },
  { slug: "longshot", hackathon: "TreeHacks", year: 2026, award: "Modal Challenge Winner", featuredRank: 8,
    blurb: "200+ parallel coding agents built Minecraft from one prompt — peak 1,200 commits/hour, $5,500 of compute." },
  { slug: "orca-4po0nm", hackathon: "QHacks", year: 2026, award: "1st Place Overall", featuredRank: 9,
    blurb: "Hum or beatbox plus spoken instructions become editable multi-instrument MIDI — the LLM orchestrates deterministic tools." },
  { slug: "we-use-nix", hackathon: "TreeHacks", year: 2026, award: "2nd Place Overall", featuredRank: 10,
    blurb: "Language-controlled surgical robot whose trajectories are formally verified in Lean to stay within safe physical bounds." },

  // ---- Hardware & robotics ----
  { slug: "artificial-sandwich-intelligence", hackathon: "MHacks", year: 2025, award: "Grand Award",
    blurb: "Imitation-learning sandwich robot trained from 4 hours of teleop on $200 arms — robot learning is now weekend-scale." },
  { slug: "hardware-context-protocol", hackathon: "Cal Hacks 12.0", year: 2025, award: "Best Hardware Hack", patch: true,
    blurb: "MCP for physical devices: schema-defined interfaces so LLMs control arbitrary hardware in world-frame coordinates." },
  { slug: "dum-e-kgx6at", hackathon: "Hack the North", year: 2025, award: "Finalist", patch: true,
    blurb: "Voice-commanded robot arm that skips VLA models entirely: homography bird's-eye view + inverse kinematics, no training." },
  { slug: "chessmate-nwygvq", hackathon: "Hack the North", year: 2025, award: "Finalist",
    blurb: "Gantry + electromagnet chessboard for playing family abroad — physical and digital state stay in sync." },
  { slug: "heartstart", hackathon: "TreeHacks", year: 2026, award: "Best Beginner Hack",
    blurb: "Autonomous robot that detects cardiac arrest, drives to you, and performs CPR — single camera with AprilTag lock-on." },
  { slug: "park-e-rmejf2", hackathon: "Hack the Coast", year: 2026, award: "Winner",
    blurb: "Teleoperated soldering arm that Kalman-filters your hand tremor out — ctrl-z for soldering." },
  { slug: "dose-ebmo9z", hackathon: "HackGT", year: 2025, award: "Best Overall",
    blurb: "Load-cell pill bottle inferring adherence from weight deltas — a simple sensor and clean dashboard beat flashier AI." },
  { slug: "diffuji", hackathon: "TreeHacks", year: 2026, award: "Most Creative Hack",
    blurb: "Instant camera that prints diffusion-warped photos on thermal paper — won on Bayer dithering for receipt paper." },
  { slug: "drip-6ao9m2", hackathon: "LA Hacks", year: 2026, award: "Track Winner",
    blurb: "AI wastes water, ours makes it: edge-inference waste heat drives membrane-distillation desalination." },
  { slug: "lattice-flck7q", hackathon: "Hack the North", year: 2025, award: "Finalist", patch: true,
    blurb: "Star Wars holographic telepresence from three Kinects and a HoloLens at 23fps — a laptop mesh with ICP calibration." },
  { slug: "flappga", hackathon: "uOttaHack", year: 2026, award: "Winner",
    blurb: "Flappy Bird entirely in SystemVerilog with no CPU — even the autopilot is combinational logic." },

  // ---- Body-as-controller & computer vision ----
  { slug: "kinemo", hackathon: "PennApps XXVI", year: 2025, award: "1st Place Overall", patch: true,
    blurb: "Webcam-only party game console — won on signal-processing fundamentals over off-the-shelf pose models." },
  { slug: "rehabify-y2f5mu", hackathon: "nwHacks", year: 2026, award: "1st Place Overall",
    blurb: "CV physical-therapy coach with sub-second voice corrections — MediaPipe-in-WASM keeps all video in the browser." },
  { slug: "mindpad", hackathon: "HackPrinceton", year: 2025, award: "Best Overall Hack", patch: true,
    blurb: "Gesture + voice study canvas — a custom ANN over hand landmarks hits 99% accuracy at sub-200ms." },
  { slug: "freak-cha", hackathon: "HackHarvard", year: 2025, award: "Winner",
    blurb: "A CAPTCHA deepfakes can't pass: answer with tongue flicks, via custom-trained YOLOv8 on hand-labeled tongue positions." },
  { slug: "ghostdiedie", hackathon: "Bitcamp", year: 2026, award: "Winner",
    blurb: "Webcam multiplayer 3D fighting game — splits WebSocket combat from WebRTC video for ~65ms latency." },
  { slug: "67-ranked", hackathon: "UofTHacks", year: 2026, award: "Winner",
    blurb: "Sub-minute body-controlled game with real anti-cheat — embraces brainrot instead of fighting it." },
  { slug: "wand-drawing", hackathon: "JourneyHacks", year: 2026, award: "Winner",
    blurb: "Your phone is the pen — accelerometer integration via a physics-lab app, and Gemini judges your drawing." },

  // ---- Agent systems & AI infrastructure ----
  { slug: "codebreaker-la", hackathon: "LA Hacks", year: 2026, award: "1st Place Overall",
    blurb: "Built the benchmark (real CVEs), the harness, and the remediation agent — reads like a research artifact." },
  { slug: "autopsy-zq5d84", hackathon: "LA Hacks", year: 2026, award: "3rd Place Overall",
    blurb: "NTSB for coding agents: a failure knowledge graph (Run → Symptom → FailureMode → FixPattern) with temporal decay scoring." },
  { slug: "agent-gauntlet", hackathon: "HooHacks", year: 2026, award: "2nd Place Overall",
    blurb: "Red-team agent injects attacks into pages during load, so a browser agent can't distinguish them from legit DOM." },
  { slug: "sentinel-c8ki50", hackathon: "TreeHacks", year: 2026, award: "Best Hardware Hack",
    blurb: "Coding agents for bare-metal firmware, closed-loop via a custom FPGA logic analyzer — generated a Pi OS from scratch." },
  { slug: "stitch-30p6ly", hackathon: "UofTHacks", year: 2026, award: "Winner",
    blurb: "AI video editor where the agent executes edits on a real timeline — every action flows through undo/redo commands." },
  { slug: "superhuman", hackathon: "PennApps XXVI", year: 2025, award: "Winner",
    blurb: "20+ parallel agents over CCTV for cold cases — video inpainting for occluded frames, with an honest ethical self-critique." },
  { slug: "working-memory", hackathon: "HackUTD", year: 2025, award: "Winner",
    blurb: "MCP server that passively watches coding sessions and rebuilds lost context via vector search." },

  // ---- LLM-as-universal-adapter ----
  { slug: "pulse-ql3gok", hackathon: "ProduHacks", year: 2026, award: "1st Place Overall",
    blurb: "Ambulance-to-ER vitals: a webcam pointed at the existing monitor plus vision LLM replaces the device-integration problem." },
  { slug: "screwyouikea", hackathon: "HackHarvard", year: 2025, award: "Winner",
    blurb: "Furniture manual PDF → interactive 3D assembly animation — Gemini emits Scene JSON executed by a Three.js renderer." },
  { slug: "vril", hackathon: "Hack Western", year: 2025, award: "1st Place Overall",
    blurb: "Text → editable parametric 3D models, plus print-ready packaging." },
  { slug: "zeta-jwq9te", hackathon: "TreeHacks", year: 2026, award: "YC Track Winner",
    blurb: "Grammarly for Math: LaTeX proofs → Lean4 with a compile-error repair loop. Won a guaranteed YC interview." },

  // ---- Hard engineering flexes ----
  { slug: "spectra-qbj2gf", hackathon: "LA Hacks", year: 2026, award: "Winner",
    blurb: "Upsamples the iPhone's sparse LiDAR into dense metric depth with a custom-trained 2MB CoreML model." },
  { slug: "presurg", hackathon: "HackPrinceton", year: 2025, patch: true,
    blurb: "Surgical outcome forecasting from actual finite-element analysis plus physics-informed neural nets." },
  { slug: "sentinel-nyx3lz", hackathon: "Hack Western", year: 2025, award: "Winner",
    blurb: "Hardware-aware static analyzer predicting ESP32 RAM/flash within ±3% — calibrated by compiling 100+ real sketches." },
  { slug: "the-ray-marching-band", hackathon: "StormHacks", year: 2025, award: "Winner",
    blurb: "Ray-marched audio-reactive terrain in raw C++/GLSL, optimized from 3fps to 60fps." },
  { slug: "atlasic", hackathon: "nwHacks", year: 2026, award: "Finalist",
    blurb: "Codebase dependency-graph VSCode extension — dropped into Rust via NAPI-RS when JS choked on the Linux kernel." },
  { slug: "duck-duck-goose-jelxr9", hackathon: "Cal Hacks 12.0", year: 2025, award: "Winner",
    blurb: "~1300x DuckDB query speedup (45s → 30ms) via materialized views and query rewriting." },

  // ---- Health & biofeedback ----
  { slug: "post-surgery-pillow-psp", hackathon: "HackHarvard", year: 2025, award: "1st Place", patch: true,
    blurb: "Ward-wide urgency ranking from a sensor pillow — threshold overrides so averaging can't hide a crashing vital." },
  { slug: "ted-ai-x8537t", hackathon: "Cal Hacks 12.0", year: 2025, award: "2nd Place", patch: true,
    blurb: "Emotionally intelligent teddy bear: hug and heart-rate sensor fusion with on-device emotion inference." },
  { slug: "heartkey", hackathon: "HooHacks", year: 2026, award: "Best Hardware Hack",
    blurb: "ECG as a second auth factor — Siamese-network embeddings so raw biometrics never leave the device." },
  { slug: "alleaf", hackathon: "Hacklytics", year: 2026, award: "1st Place Overall",
    blurb: "Wrist device that detects stress from optical heart rate and triggers bilateral-stimulation haptic therapy." },
  { slug: "happynappy", hackathon: "Hack the Coast", year: 2026, award: "Winner",
    blurb: "Nap-optimizing neck pillow — no dataset existed, so they shipped a defensible heuristic: sustained >20% HR drop." },
  { slug: "steadyscript", hackathon: "nwHacks", year: 2026, award: "Best Beginner Hack",
    blurb: "Parkinson's pen whose entire value is one custom metric: jitter perpendicular to intended motion." },

  // ---- Social impact with real engineering ----
  { slug: "concord-d6txpr", hackathon: "nwHacks", year: 2026, award: "Winner",
    blurb: "Offline wildfire-detection mesh: cheap sensors sleep, and a digital nose wakes the camera only on anomaly." },
  { slug: "hearth-pvngm3", hackathon: "youCode", year: 2026, award: "1st Place — Community Impact",
    blurb: "On-device translation for shelter workers — the model was chosen for low-resource languages after interviewing a real shelter." },
  { slug: "mapd-urban-development-intelligence", hackathon: "StormHacks", year: 2025, award: "3× Award Winner",
    blurb: "Vancouver open data → plain-language community impact — the real story is ETL discipline that makes LLM output trustworthy." },
  { slug: "resqme-jq52al", hackathon: "HackHarvard", year: 2025, award: "2nd Best Overall Hack", patch: true,
    blurb: "Self-healing ESP32 disaster mesh with offline GPS and messaging when all networks fail." },
  { slug: "wing-cet3o0", hackathon: "cmd-f", year: 2026, award: "3rd Place Overall",
    blurb: "Domestic-violence safety app disguised as a fully functional weather app." },

  // ---- Pure chaos ----
  { slug: "yes-or-yes", hackathon: "LA Hacks", year: 2026, award: "Winner",
    blurb: "Three live guppies make your life decisions via OpenCV, and a Playwright agent executes the winner." },
  { slug: "clipper-ph49un", hackathon: "nwHacks", year: 2026, award: "Best Design",
    blurb: "Leave the app mid-study-session and it photographs you and broadcasts it to your friends." },
  { slug: "cramsino", hackathon: "JourneyHacks", year: 2026, award: "Winner",
    blurb: "Facial focus-tracking converts verified study time into gacha pulls." },

  // ---- Bonus ----
  { slug: "whalebeing-27sj0w", hackathon: "DeltaHacks", year: 2025, award: "Winner",
    blurb: "Ship routes vs. blue-whale habitats — the collision model is ported from a real ecology paper." },
  { slug: "dance-cv", hackathon: "nwHacks", year: 2026, award: "Best Game Project",
    blurb: "Just Dance for any video on the internet: webcam pose scoring plus an AI voice coach — no Wii remote, no song packs." },

  // ---- 2026 podium scout picks (wow-filtered) ----
  { slug: "shop-a-sketch", hackathon: "UofTHacks", year: 2026, award: "3rd Place Overall",
    blurb: "Draw what you imagine and search finds it — sketch-first shopping for the things you can't put into words." },
  { slug: "snowy-day-3nfbgm", hackathon: "uOttaHack", year: 2026, award: "2nd Place Overall",
    blurb: "Waymo, but for snow plows: reinforcement learning re-routes the city's plows so your street stops losing to the storm." },
  { slug: "scamshield-87rbxe", hackathon: "HooHacks", year: 2026, award: "3rd Place Overall",
    blurb: "Listens to grandma's calls in real time and warns her about scams through lights and voice — then texts the family." },
  { slug: "project-horizon-8iodp2", hackathon: "UofTHacks", year: 2026, award: "2nd Place Overall",
    blurb: "What does the game look like from Messi's point of view? Identity through perspective — be anyone, see through their eyes." },
  { slug: "lifesaver-lnm0tz", hackathon: "YHack", year: 2026, award: "2nd Place Overall",
    blurb: "Surgical training scored like a rhythm game: webcam hand tracking and voice-guided anatomy, before you ever touch a patient." },
  { slug: "chromachord", hackathon: "TreeHacks", year: 2026, award: "3rd Place Overall",
    blurb: "Autocomplete for jazz: real-time chord suggestions from 24-dimensional chroma math — all ~4,000 chords, no neural net." },
  { slug: "search-and-rescue-2pwlkf", hackathon: "HooHacks", year: 2026, award: "1st Place Overall",
    blurb: "HooHacks 2026 overall winner.", fragile: true },
];

const DELAY_MS = 350;
const UA = "HallOfHacks-PoC/0.1 (curated import; contact: jchanh@gmail.com)";
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

function parseProjectPage(html) {
  let demoVideoUrl;
  const videoSrc =
    html.match(/<iframe[^>]*class="video-embed"[^>]*src="([^"]+)"/)?.[1] ??
    html.match(/<iframe[^>]*src="([^"]*(?:youtube\.com|youtube-nocookie\.com|player\.vimeo\.com)[^"]*)"/)?.[1];
  if (videoSrc) {
    const yt = videoSrc.match(/(?:youtube(?:-nocookie)?\.com)\/embed\/([A-Za-z0-9_-]{6,})/);
    const vimeo = videoSrc.match(/player\.vimeo\.com\/video\/(\d+)/);
    if (yt) demoVideoUrl = `https://www.youtube-nocookie.com/embed/${yt[1]}`;
    else if (vimeo) demoVideoUrl = `https://player.vimeo.com/video/${vimeo[1]}`;
  }

  const urlsBlock = html.match(/data-role="software-urls"[\s\S]*?<\/ul>/)?.[0] ?? "";
  const githubUrl = [...urlsBlock.matchAll(/href="([^"]+)"/g)].map((m) => m[1]).find((u) => u.includes("github.com"));

  const name = stripTags(html.match(/<meta property="og:title" content="([^"]*)"/)?.[1] ?? "");
  const ogImage = html.match(/<meta property="og:image" content="([^"]*)"/)?.[1];

  let detailsBlock = html.match(/id="app-details-left"([\s\S]*?)(?:Built With|id="app-team")/)?.[1] ?? "";
  const firstHeading = detailsBlock.search(/<h2/);
  if (firstHeading > -1) detailsBlock = detailsBlock.slice(firstHeading);
  const paragraphs = [...detailsBlock.matchAll(/<p>([\s\S]*?)<\/p>/g)].map((m) => stripTags(m[1])).filter((p) => p.length > 30);
  let description = paragraphs.join(" ").slice(0, 750);
  const lastPeriod = description.lastIndexOf(". ");
  if (lastPeriod > 300) description = description.slice(0, lastPeriod + 1);

  // Team from the software page's "Created by" section
  const teamBlock = html.match(/<section id="app-team">[\s\S]*?<\/section>/)?.[0] ?? "";
  const team = [];
  for (const m of teamBlock.matchAll(/<a[^>]*href="(https:\/\/devpost\.com\/[A-Za-z0-9_-]+)"[^>]*>([\s\S]*?)<\/a>/g)) {
    const alt = m[2].match(/alt="([^"]+)"/)?.[1];
    const nameText = stripTags(alt ?? m[2]);
    if (nameText && !team.some((t) => t.name === nameText) && nameText.length < 50) {
      team.push({ name: nameText, devpostProfileUrl: m[1] });
    }
  }

  const builtWith = [...html.matchAll(/<span class="cp-tag"[^>]*>([^<]*)<\/span>/g)].map((m) => m[1].trim().toLowerCase());

  return { name, ogImage, description, demoVideoUrl, githubUrl, team, builtWith };
}

// Same keyword heuristics as scrape.mjs (suggestion only; tag-overrides refine)
const TAG_KEYWORDS = {
  "ai-ml": ["ai ", " ai", "machine learning", "neural", "llm", "gpt", "opencv", "computer vision", "vision model", "tensorflow", "pytorch", "gemini", "claude", "nlp", "ml ", "model", "rag", "agent", "yolo", "imitation"],
  health: ["health", "medical", "patient", "therap", "fitness", "mental", "sleep", "diagnos", "clinic", "drug", "cancer", "asl", "sign language", "cpr", "surgical", "parkinson", "ecg", "heart"],
  fintech: ["financ", "payment", "bank", "money", "budget", "crypto", "stock", "trading", "wallet", "invest"],
  games: ["game", "arcade", "puzzle", "multiplayer", "unity", "godot", "player", "minecraft", "flappy"],
  "social-good": ["accessib", "community", "donat", "nonprofit", "education", "refugee", "safety", "inclusi", "volunteer", "disaster", "blind", "deaf", "shelter", "wildfire"],
  "dev-tools": ["developer", " api", "cli ", "debug", "codebase", "deploy", "ide ", "devtool", "open source", "documentation", "compiler", "linter", "static analy", "benchmark"],
  "ar-vr": ["augmented reality", "virtual reality", " ar ", " vr ", "hololens", "quest", "headset", "xr ", "hologra"],
  sustainability: ["climate", "sustainab", "recycl", "compost", "energy", "carbon", "waste", "farm", "environment", "solar", "desalination", "whale"],
};
const HARDWARE_KEYWORDS = ["arduino", "raspberry", "esp32", "pcb", "sensor", "robot", "embedded", "iot", "3d print", "cad", "stm32", "servo", "motor", "circuit", "firmware", "lidar", "drone", "fpga", "load cell", "solder", "kinect", "cane", "pillow", "printer", "camera that prints"];

function suggestTags(text) {
  const t = ` ${text.toLowerCase()} `;
  const domainTags = Object.entries(TAG_KEYWORDS)
    .filter(([, kws]) => kws.some((k) => t.includes(k)))
    .map(([tag]) => tag);
  const form = HARDWARE_KEYWORDS.some((k) => t.includes(k)) ? "both" : "software";
  return { domainTags, form };
}

async function main() {
  const records = [];
  const patches = [];

  for (const entry of MANIFEST) {
    const devpostUrl = `https://devpost.com/software/${entry.slug}`;
    if (entry.patch) {
      patches.push({
        slug: entry.slug,
        oneLiner: entry.blurb,
        ...(entry.award ? { award: entry.award } : {}),
        ...(entry.featuredRank ? { featuredRank: entry.featuredRank } : {}),
      });
      console.log(`patch    ${entry.slug}`);
      continue;
    }
    let page;
    try {
      page = parseProjectPage(await get(devpostUrl));
    } catch (e) {
      console.warn(`${entry.fragile ? "skipped (known-fragile)" : "FAILED"}  ${entry.slug}: ${e.message}`);
      continue;
    }
    const { domainTags, form } = suggestTags(
      [page.name, entry.blurb, page.description, page.builtWith.join(" ")].join(" "),
    );
    records.push({
      slug: entry.slug.replace(/[^a-z0-9-]/gi, ""),
      name: page.name || entry.slug,
      oneLiner: entry.blurb,
      description: page.description || entry.blurb,
      image: page.ogImage?.replace(/^http:/, "https:"),
      ...(page.demoVideoUrl ? { demoVideoUrl: page.demoVideoUrl } : {}),
      devpostUrl,
      ...(page.githubUrl ? { githubUrl: page.githubUrl } : {}),
      award: entry.award,
      hackathon: entry.hackathon,
      year: entry.year,
      domainTags,
      form,
      team: page.team,
      ...(entry.featuredRank ? { featuredRank: entry.featuredRank } : {}),
    });
    console.log(`imported ${entry.slug} (${page.team.length} builders, video: ${!!page.demoVideoUrl})`);
  }

  mkdirSync("data", { recursive: true });
  writeFileSync("data/reading-list-raw.json", JSON.stringify({ records, patches }, null, 2));
  console.log(`\nWrote ${records.length} records + ${patches.length} patches -> data/reading-list-raw.json`);
}

main();
