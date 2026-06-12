# Hall of Hacks

**The permanent archive of winning hackathon projects — relentlessly curated.**
30 reads from the 2025-26 season, selected from thousands of submissions
across 25+ hackathons (including the 2026 podiums at TreeHacks, UofTHacks,
uOttaHack, HooHacks, and YHack). Awards are quantified — "1st of 699
projects" — and the feed opens best-first: FaceTimeOS is always the first
project a visitor sees, followed by the reading list's highest-density picks,
then the rest in quality order before the endless remix begins. The bar: a **"wow, I didn't think of that"** concept
anyone can grasp in one sentence, backed by a real result — Just Dance for
any video on the internet; FaceTime your Mac and an agent picks up; three
live guppies making your life decisions; an IKEA manual turned into a 3D
assembly animation. Opaque technical flexes and sponsor-prize dashboard slop
are excluded by design.

Consume winners. Build winners.

## What it does

Three user-selectable binge feeds on `/` (bottom pill rail, keys 1–3, choice
persisted), implementing the high-fidelity design handoff in
`design_handoff_hall_of_hacks_feeds`:

- **01 The Endless Wall** — infinite masonry with parallax column drift, a
  marquee ticker of winners, hover blurb veils and hover-to-play demo videos.
- **02 The Prize Reel** — full-viewport snap feed, one winner per flick, with
  palette tints and ghost rank numerals.
- **06 The Deck** — a dealt card stack: drag right to save, left to pass
  (arrow keys work too).
- **Categories** (`/categories`) — pick a genre (AI/ML, games, hardware…) on a
  dedicated page; the feed then shows only that category with a clear-pill to
  reset.

Covers show real screenshots/video frames; projects without usable imagery get
deterministic generated typographic posters (5 styles, hue-keyed palettes),
which also serve as loading placeholders.

- **Project pages** (`/project/[slug]`) — click anything for a modal (URL
  updates, fully shareable with OG tags); direct visits get a full page. Demo
  video embed, full award list, builders credited with Devpost links, and
  "more winners like this".
- **Collections** (`/collections`) — ✶ quick-saves into a default "Saved"
  collection from any feed; named folders via the picker in the detail view.
  Stored in `localStorage`; no account needed.

## Stack

Next.js (App Router) + Tailwind v4, deployed anywhere static-friendly (Vercel).
No database, no auth — the "database" is `data/projects.json`, baked in at build
time. The modal-with-URL uses parallel + intercepting routes (`app/@modal`).
Design system: Instrument Serif / Archivo / JetBrains Mono over cream + ink with
a single gold accent (`lib/handoff.ts` adapts project data to the handoff's card
model; `components/handoff/` holds the four layouts and shared pieces).

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

For correct OG/social URLs in production set `NEXT_PUBLIC_SITE_URL=https://yourdomain`.

## Data pipeline

The dataset is built from a hand-curated reading list (the spec for "worth
reading") plus strict survivors of an earlier 8-event winner scrape:

```bash
node scripts/import-reading-list.mjs   # fetch each reading-list entry's Devpost page
node scripts/rebuild-dataset.mjs       # keep-list + imports, reading order, tag overrides
node scripts/sanitize.mjs data/merged-raw.json data/projects.json
node scripts/extract-colors.mjs && node scripts/enrich-images.mjs
node scripts/final-cut.mjs               # roster + ranks 1-10 + quantified awards (event-sizes.json)
```

`scripts/scout-2026.mjs` finds overall-podium candidates in new galleries for
hand review before they're added to the import manifest.

The featured ranks 1–10 are the reading list's "highest-density reads"; the
Index page's № order is the reading order. See `data/README.md` for details.

`sanitize.mjs` is the security gate: strips any HTML/control chars from every
text field, drops media not on the host allowlist (`lib/allowlist.ts` — Devpost
CDN for images; YouTube/Vimeo for embeds), and enforces unique slugs and length
caps. Nothing enters `projects.json` without passing it.

## Security posture (PoC scope)

- All scraped text sanitized at ingest; React escapes at render; no
  `dangerouslySetInnerHTML` anywhere.
- Media host allowlist enforced twice: at ingest (sanitize) and at runtime (CSP
  `img-src` / `frame-src` in `next.config.ts`).
- Strict security headers: CSP, `X-Content-Type-Options`, `Referrer-Policy`,
  `Permissions-Policy`.
- No secrets, no user accounts, no server-side state.
- Known accepted finding: `npm audit` reports a moderate advisory in postcss via
  Next.js's own bundled copy (build-time only; the suggested "fix" downgrades
  Next to v9 — not applicable).

## Recognition & removal

All project data comes from public Devpost pages and credits the original
builders with links back to Devpost. On a team and want your project removed?
Email the address in the site footer.
