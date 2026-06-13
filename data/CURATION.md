# Hall of Hacks — Curation Rulebook

The filter for adding new projects. Derived from the 22 keepers in
`final-cut.json` and — just as importantly — the 67 projects that were
considered and cut (they still live in `merged-raw.json`). Read this before
adding anything. If a candidate doesn't clearly pass, it doesn't go in.

## Who we curate for

A beginner at their first hackathon, scrolling the feed the night before.
Every card must do one of two things to them within ten seconds:

1. **"Wow, I never thought of that."** — an idea-level surprise.
   *(YES? or YES! — live fish make your decisions. Get Clipped — quit studying
   and your friends get a photo of you. Wing — a safety app disguised as a
   weather app.)*
2. **"Wow, I didn't know you could DO that."** — a capability-level surprise.
   *(FaceTimeOS — call your Mac and it obeys. Longshot — 200 agents rebuilt
   Minecraft overnight. ScrewYouIKEA — a PDF manual becomes a 3D animation.)*

And then a third feeling, which is the actual product: **"I could build
something like that."** The reader closes the tab inspired, not intimidated.
A project that impresses but discourages is a failed entry, no matter how
hard it won.

## The six gates (a candidate must pass ALL of them)

### Gate 1 — The First-Read Test
The project must be fully explainable in two plain sentences with **zero
jargon**. If the explanation needs a defined term (LLVM, AST, Lean, FPGA,
MCP, Kalman filter, Siamese network), it's out — no matter how brilliant.
> Cut for this: *Freak in the Sheets* (an LLVM backend compiling C to Google
> Sheets — astonishing, and totally opaque to a beginner), *Quota* (1st place
> overall, but "tree-sitter AST linting for cloud spend" means nothing to the
> audience), *Zeta* (LaTeX → Lean4 proof checking).

### Gate 2 — The Idea-Wow Test
The wow must live in the **idea or the demo**, never in the implementation.
If you have to understand how it was built to be impressed, cut it.
> Cut for this: *Duck Duck Goose* (a 1300× query speedup — pure technical
> flex), *Music March* (ray-marched GLSL optimized 3fps→60fps), *FlapPGA*
> (Flappy Bird in pure SystemVerilog). All real achievements; none of them
> give a beginner a picture in their head.

### Gate 3 — The Picture-In-Your-Head Test
Reading the one-liner must produce a vivid mental image of the demo: a cane
pulling someone forward, fish swimming toward an answer, a robotic finger
swiping an iPhone. If the candidate is a dashboard, a pipeline, a copilot, a
platform, or an "insights" tool, there is no picture — cut it.
> Cut for this: *Mapd* (open-data ETL → plain-language summaries), *Working
> Memory* (an MCP server watching your coding session), *Conductor AI*
> (agent routing infrastructure), *Dispatch* / *Pulse* (911 / ambulance
> operations consoles — worthy, but hospital-ops, not inspiring).
> Kept counterexample: *Snowy Day* is civic software but you can SEE it —
> snowplows racing through a city you've lived in.

### Gate 4 — The Pedigree Test
It must have **actually won big at a real, sizable hackathon**:
- **Top-3 overall finish is the standard.** 15 of the 22 keepers placed
  top-3 overall or won outright.
- A category/sponsor prize (Most Creative, Best Game, sponsor challenge) is
  acceptable **only when the concept is overwhelming on its own** — that's
  the Longshot / diffuji / Wordhawk exception, and it should stay rare.
- The event must have a known field size, recorded in `event-sizes.json`,
  so the award renders as "1st out of 699 teams". An award we can't
  quantify is a weaker award.
- Prefer the major circuits: TreeHacks, Cal Hacks, Hack the North, HackMIT,
  PennApps, MHacks, LA Hacks, UofTHacks, nwHacks, HackHarvard, and peers.
  A 1st at a 40-team event needs a truly exceptional concept to compete
  with a finalist at a 400-team event.

### Gate 5 — The Receipts Test
Every entry needs a live Devpost page with a real write-up, a usable cover
image, a team list, and — near-mandatory — a **playable demo video**
(YouTube or Vimeo). 47 of the 50 keepers have one (Snowy Day, Get Clipped,
and Wing are grandfathered exceptions); the detail console is built
around it. Do not add new no-video entries. Watch at least 30 seconds: the demo must show the thing actually
working. GitHub link strongly preferred.
> Cut for this: the HooHacks *search-and-rescue* entry — 1st overall, but
> the Devpost page had nothing on it. No write-up, no entry.

### Gate 6 — The Genre-Slot Test
The archive is a tasting menu, not a buffet. One best-in-class
representative per genre. A newcomer in an occupied slot must **dethrone
the incumbent**, not sit beside it — adding it means cutting the holder.
Current slots:

| Slot | Held by | Already rejected for this slot |
|---|---|---|
| Talk to your computer, it acts | FaceTimeOS | Tango |
| Agents at absurd scale | Longshot | Conductor AI |
| Agents doing real-world errands | DIAL(*) | — |
| A persistent AI version of you | Identity Matrix | — |
| Hum/draw instead of typing | Orca, Shop-A-Sketch | — |
| Webcam motion games | kinemo | 67Ranked, GhostDieDie, Slap Game |
| Webcam skill coaching | Dance CV | Rehabify, MindPad |
| Accessibility you can feel | Shepherd, ROSS | BlinkAI, Ranger, Portable Braille, MemARy |
| Life-saving robot | HeartStart | — |
| Guardian for the vulnerable | ScamShield, Wing | — |
| Social-pressure accountability | Get Clipped! | Cramsino |
| Absurd but completely real | YES? or YES!, Wordhawk | Jarvis |
| Everyday pain, killed | ScrewYouIKEA, Snowy Day | — |
| Physical whimsy | diffuji | — |
| Cheap robots that learn | Artificial Sandwich Intelligence | MARC, DUM-E, OmNom |
| Practice the un-practicable | LifeSaver | Synovia |
| Security made playful | freak-cha | HeartKey, C2Pay |

## Automatic disqualifiers (no appeal)

These come from `AGENTS.md` taste rules and the cut list. Reject on sight:

1. **Opaque technical flexes** — compiler/DB/GPU/formal-verification feats
   whose audience is other engineers. *(Freak in the Sheets, Duck Duck
   Goose, Music March, Atlasic, Robosurge.)*
2. **AI-dashboard slop and "copilot for X"** — anything whose demo is a
   chat panel next to a table of insights. *(Autopsy, codebreaker, Agent
   Gauntlet, Stitch, Working Memory.)*
3. **Hospital-ops / clinical workflow tools** — triage queues, vitals
   consoles, dispatcher copilots. *(Dispatch, Pulse, Post Surgery Pillow,
   Synovia.)* Health projects must be visceral and personal — HeartStart
   and LifeSaver are the model.
4. **Lab-grade hardware and deep-ML additions.** Fun-framed hardware is
   allowed (decided June 2026, expanding the roster to 50): a robot or
   device that does something delightful a beginner instantly gets — the
   CPR robot, sandwich robot, wizard chessboard, feeling teddy bear. What
   stays banned: lab-grade rigs, sensor-platform builds, and anything whose
   core is a custom-trained model. *(Cut despite winning: SPECTRA, HeartKey,
   Sentinel, Embers, MIRAI, Telebuddy.)*
5. **Thin LLM wrappers** — if the honest description is "we prompt a model
   and show the answer", it's not a Hall of Hacks project.
6. **Empty or broken Devpost listings** — no write-up, dead video, no team.

## Multipliers (what separates a keeper from a maybe)

None of these substitute for the gates; they break ties and earn featured
ranks (top 10 of the roster):

- **A human story.** DIAL(*) is in the top 4 because the team was actually
  stranded and the bots actually got them a room for $158. "We had this
  problem AT the hackathon and solved it live" is the best story shape.
- **One concrete number that does the selling.** $158 room. $200 robot
  arms. 200 agents. 100 hotels called. 20× cheaper than store-bought.
  Four hours of watching. Find the number; put it in the blurb.
- **Cheapness.** "Built from $200 parts" tells the beginner *you could
  afford to try this*. Expensive rigs intimidate; cheap rigs inspire.
- **Physical, visceral demos.** Things that move, print, swim, swipe, or
  pull your hand. The screen-only keepers all compensate with a killer
  concept.
- **Humor that ships.** YES? or YES! and freak-cha won because the joke was
  fully engineered, end to end. A joke with real infrastructure beats a
  serious project with none.
- **Emotional stakes.** Shepherd, Wing, ScamShield, HeartStart protect
  someone the reader loves. "Who is this FOR" should have a face.

## Blurb rules (`blurbs.json`)

Every new project gets a blurb in the established style. Non-negotiable:

- **Crystal clear on the very first read.** If a friend would say "wait,
  what?", rewrite it.
- 1–2 complete natural sentences, roughly 25–45 words. No fragments, no
  "X, but for Y" constructions, no jargon, no stack names (never "Gemini",
  "MediaPipe", "React"), no acronyms the reader must already know.
- Sentence 1: what you do / what it is, in second person where natural.
  Sentence 2: the magic detail or consequence — ideally the concrete number.
- Describe the experience, not the architecture. "The webcam watches your
  body" — never "pose estimation via MediaPipe".

Calibration examples from the current set:

> ✅ "You hum or beatbox a melody and say which instruments you want. It
> turns that into a real song you can keep editing, so you can make music
> without knowing any music software." *(Orca — experience first, zero tech.)*

> ✅ "The team arrived at the hackathon with nowhere to sleep, so they built
> phone bots that called more than 100 real hotels and negotiated a luxury
> room down to $158." *(DIAL — story + number.)*

> ❌ "Multiplayer pixel world where your avatar becomes a persistent
> stateful agent via a continual-learning memory bank." *(Jargon, fragment —
> this is reading-list style, not blurb style.)*

## Sourcing workflow (Devpost)

1. Work the major-circuit galleries each season: the events already in
   `event-sizes.json`, plus any new flagship (HackMIT, TreeHacks, Cal
   Hacks, Hack the North, etc.).
2. In each gallery, **note the total project count first** — that's the
   field size for `event-sizes.json` and the award quantification.
3. Read the top-3 overall winners before anything else. Then scan named
   category awards (Most Creative, Best Game, Best Beginner) only for
   concept bombs — that's where diffuji and Get Clipped came from.
4. For each candidate: watch 30s of demo video, read the full write-up,
   then run the six gates. Expect to keep roughly **1 in 4** even of
   overall winners — that's the historical rate (22 kept of 89 considered).
5. The roster stays at ~20–24 projects. Past that, every add means cutting
   the current weakest. The first 10 roster positions are the featured
   ranks — re-evaluate the order when inserting, don't just append.

## Mechanical checklist for adding a project

Never hand-edit `projects.json`. For each accepted project:

1. Add a MANIFEST entry in `scripts/import-reading-list.mjs` (slug,
   hackathon, year, award, insight-line blurb).
2. Add/verify the event in `data/event-sizes.json` (`"Hackathon YEAR": N`).
3. Write the beginner blurb in `data/blurbs.json` (style rules above).
4. Insert the slug into `data/final-cut.json` roster at its reading-order
   position (first 10 = featured; FaceTimeOS always opens).
5. Run the pipeline: `import-reading-list.mjs` → `rebuild-dataset.mjs` →
   `sanitize.mjs` → `extract-colors.mjs` + `enrich-images.mjs` →
   `final-cut.mjs` (details in `data/README.md`).
6. Kill the server on the port, `npm run build && npm run start`, lint
   clean, and verify the new card + detail console with a real browser
   screenshot.

## The final gut check

Read the finished card as a nervous first-timer the night before their
first hackathon. If their honest reaction is **"that's so cool — and I
want to try building something"**, ship it. If it's "I guess that's
impressive?" or "I don't get it", it doesn't matter who won what:
**cut it.**
