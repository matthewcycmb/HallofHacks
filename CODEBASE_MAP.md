# Hall of Hacks — Codebase Map

A structural/navigational guide to where things live and how the pieces connect.
For the **rules, taste, and current state** (the *why*), see `AGENTS.md` — it is
the authoritative project brief. This file is the *where / what*.

> Heads-up: `README.md` is **out of date** — it describes a retired iteration
> (three feeds "Endless Wall / Prize Reel / The Deck", cream + Instrument Serif
> design, a URL modal, "no database, no auth"). The shipped product is the single
> dark "Harbor" feed with Auth.js + Neon Postgres. Trust `AGENTS.md` and the code.

## Orientation

*Hall of Hacks* is a dark, gallery-style archive of **50 hand-curated winning
hackathon projects** across 26+ hackathons, built to inspire builders. Stack:
**Next.js 16 App Router + React 19 + Tailwind v4**, **Auth.js v5 + Drizzle ORM on
Neon Postgres**, **PostHog + Vercel Analytics**. Repo root is `untitled/`. Live at
`https://hallofhackss.com` (Vercel; push to `main` auto-deploys to production).

## The two data planes (key mental model)

The app deliberately keeps two separate data stores:

1. **Static archive** — the 50 projects live in `data/projects.json`, baked in at
   **build time** and served **SSG**. Search (`?q=`) and category (`?cat=`) filters
   run **client-side** over the in-memory list (`lib/projects.ts`) — there is no
   project search backend. This keeps `/`, `/feed`, `/project/[slug]`, etc. static.
2. **User data** — **Neon Postgres** (via Drizzle) holds *only* users, OAuth
   accounts, and saved collections. Nothing about the archive itself is in the DB.

Consequence: almost the entire site is static; only `/api/auth/*` and `/api/stats`
are dynamic. Auth session is delivered **client-side** (`SessionProvider`) so the
archive pages stay SSG — never call `auth()` in the root layout.

## Directory map

```
app/                          App Router routes (mostly SSG)
  page.tsx                    /          onboarding landing (full-screen overlay)
  onboarding/page.tsx         /onboarding  307 -> / (legacy link)
  feed/page.tsx               /feed      the "Harbor" card feed — the main archive
  project/[slug]/page.tsx     /project/* SSG project page (2-sentence + gold "Why it won")
  categories/page.tsx         /categories  genre picker -> /feed?cat=
  hackathons/page.tsx         /hackathons  roster of events + counts
  collections/page.tsx        /collections  saved projects (local or cloud)
  account/page.tsx            /account   profile, data export, delete account
  signup/page.tsx             /signup    Google + GitHub OAuth sign-in
  privacy/  terms/            legal pages (contact: matthewashere0@gmail.com)
  guide/page.tsx              /guide
  api/auth/[...nextauth]/route.ts   Auth.js v5 route handler
  api/stats/route.ts          analytics endpoint
  layout.tsx                  root: header (logo, search, categories, saves, account) + providers
  template.tsx                opacity-only between-page fade
  globals.css                 design tokens, dark "harbor" theme, motion gating
  error.tsx  global-error.tsx  not-found.tsx
  opengraph-image.tsx  twitter-image.tsx  sitemap.ts  robots.ts  llms.txt/route.ts  icon.png

components/
  handoff/                    the "Harbor" design system (Figma handoff)
    HarborView.tsx            main card gallery (desktop console + mobile inline)
    FeedSwitcher.tsx          route + filter orchestrator for /feed
    NightCard.tsx             a single project card
    Cover.tsx  PosterCover.tsx  deterministic poster covers (style/hue from slug)
    DetailConsole.tsx  DetailSave.tsx   sticky right detail panel + its save control
    HeaderSearch.tsx  HeaderSaves.tsx   header search box + saves entry
    OnboardingFlow.tsx  SignupCard.tsx  SocialProof.tsx
    ProjectCardMini.tsx  PrizeChip.tsx  SaveStar.tsx
  auth/
    Providers.tsx             SessionProvider wrapper (client session, keeps SSG)
    CollectionsBridge.tsx     local<->server mode switch + first-login migration; PostHog identify
    AccountWidget.tsx         sign-in button / avatar dropdown
  analytics/
    PostHogProvider.tsx       client PostHog init (via /ingest proxy)
    TrackProjectOpen.tsx      fires project_opened
  ProjectDetail.tsx           full project detail (video, award, "Why it won", team, links)
  ProjectImage.tsx  SaveMenu.tsx  Toaster.tsx  SiteFooter.tsx  JsonLd.tsx

lib/
  types.ts                    Project domain model + DOMAIN_TAGS / FORMS
  projects.ts                 load / filter / search / shuffle / featured split
  handoff.ts                  Project -> card adapter (hashes slug -> poster style, hue, tier)
  feed-rotation.ts            per-visit hackathon rotation (stable within a session)
  categories.ts               filter predicates (domain tags + form)
  collections.ts              session-aware store (localStorage <-> server, useSyncExternalStore)
  collections/actions.ts      server actions (save/unsave, create collection) — gated by auth
  collections/types.ts        collection types
  auth/dal.ts                 verifySession() / getUserId() — the auth check (no middleware)
  auth/member-flag.ts         "returning member" localStorage flag (-> /feed redirect)
  db/schema.ts                Drizzle tables (see Data model)
  db/client.ts                Neon HTTP client (throws if DATABASE_URL unset)
  allowlist.ts                media host allowlist (Devpost CDN, YouTube, Vimeo, avatars)
  analytics.ts                track() client helper        posthog-server.ts  server PostHog singleton
  jsonld.ts                   structured data for SEO       site-url.ts  canonical origin resolver
  in-app-browser.ts  local-pref.ts  toast.ts  use-hydrated.ts

data/                         content dataset + curation source files (see Pipeline)
scripts/                      offline content + marketing pipeline (*.mjs)
drizzle/                      0000_init_auth_collections.sql + meta (migrations)
marketing/                    generated outreach kit (contacts, templates, CRM tracker)
public/                       croc.png logo, featured-badge.svg, fallback.svg, icons
auth.ts                       Auth.js v5 config (Google + GitHub, JWT sessions, Drizzle adapter)
next.config.ts                CSP + security headers, image hosts, /ingest rewrite
drizzle.config.ts             Drizzle Kit config (db:push / db:generate)
```

## Data model

**`Project`** (`lib/types.ts`) — the static archive record:
`slug`, `name`, `oneLiner`, `description`, `whyWon?`, `image`, `feedImage?`,
`demoVideoUrl?`, `devpostUrl`, `githubUrl?`, `award`, `hackathon`, `year`,
`domainTags[]`, `form` (`software` | `hardware` | `both`), `team[]`
(`{ name, devpostProfileUrl? }`), `featuredRank?` (1-based, pinned only),
`dominantColor?` (painted before image loads).

**Database tables** (`lib/db/schema.ts`, migration in `drizzle/`):
- `user` — Auth.js users (id, name, email unique, image)
- `account` — OAuth provider links (composite PK provider + providerAccountId)
- `verificationToken` — present but **unused** (sessions are JWT, not DB)
- `collection` — user-owned folders (id, userId, name, isDefault, sortOrder)
- `collection_item` — projects in a collection (composite PK collectionId + slug)

## Content pipeline — never hand-edit `data/projects.json`

`projects.json` is **generated**, not edited. Ordered flow (see `data/README.md`
and `data/CURATION.md`):

```
import-reading-list.mjs   fetch each reading-list entry's Devpost page (-> reading-list-raw.json)
  -> rebuild-dataset.mjs  keep-list + imports, reading order, tag overrides (-> merged-raw.json)
  -> sanitize.mjs         SECURITY GATE: strip HTML/control chars, media host allowlist,
                          unique slugs, length caps (-> projects.json)
  -> extract-colors.mjs   add dominantColor (sharp histogram)        [idempotent]
  -> enrich-images.mjs    add feedImage (video frame) for flat cards [idempotent]
  -> final-cut.mjs        TAIL STEP: roster + ranks 1-10, quantify awards, bake in text
                          (re-runnable alone after editing source files)
```

`scout-2026.mjs` finds new-season overall-podium candidates for hand review before
they enter the import manifest.

Source files (`data/*.json`):

| File | Role |
|------|------|
| `projects.json` | **Final served dataset** (generated). Do not edit by hand. |
| `final-cut.json` | Roster: array order = display order, first 10 = featured. |
| `blurbs.json` | Hand-written 2-sentence `oneLiner` per slug. |
| `why-won.json` | Hand-written one-line `whyWon` per slug (plain English, no jargon). |
| `event-sizes.json` | Per-event field sizes -> award quantification ("1st of 699"). |
| `keep-list.json` | Survivor slugs carried forward through rebuild. |
| `tag-overrides.json` | Manual corrections to auto-suggested `domainTags` / `form`. |
| `merged-raw.json` | Full pre-final-cut pool in reading order (provenance). |
| `reading-list-raw.json` | `import-reading-list.mjs` output (records + patches). |
| `raw-projects.json` | One-time legacy Devpost scrape (`scrape.mjs`). |
| `curated-projects.json` | Legacy scored/ranked set (archived). |
| `scout-2026.json` | 2026 podium candidates pending review. |

To **add/cut a project** or **reword text**: edit the relevant source file, then
re-run the pipeline (full chain for a new project; `node scripts/final-cut.mjs`
alone after editing `blurbs.json` / `why-won.json` / `final-cut.json`).

## Key flows

- **Feed render** — `lib/projects.ts` (load/filter/featured split) + `lib/feed-rotation.ts`
  (rotate the leading hackathon per visit, stable within a session to avoid
  hydration mismatch) feed `components/handoff/FeedSwitcher` -> `HarborView`.
- **Collections** — `lib/collections.ts` (`useSyncExternalStore`) is one store with
  two modes: logged-OUT writes to localStorage and toasts "Saved — sign in to keep
  it" (**not gated**); logged-IN goes through server actions in
  `lib/collections/actions.ts`. `components/auth/CollectionsBridge.tsx` switches
  modes and runs a one-time local->account migration on first login; the
  `/signup?next=<path>` prompt fires only when a server action reports the session
  expired mid-use.
- **Auth** — `auth.ts` (Auth.js v5, Google + GitHub, JWT sessions, Drizzle adapter);
  there is **no `middleware.ts`** (Next 16 renamed it). Auth is checked via
  `lib/auth/dal.ts` (`getUserId()`), called from the collections server actions.
- **Analytics** — `lib/analytics.ts` (`track()`, client) and `lib/posthog-server.ts`
  (server singleton). Browser traffic is proxied through the `/ingest` rewrite in
  `next.config.ts` to satisfy CSP. Events: landing CTAs, search, project opens/link
  clicks, sign in/out, save/unsave, collection create.

## Common changes — "I want to… → edit…"

- **Add or remove a project** → edit pipeline source files (manifest in
  `import-reading-list.mjs`, `final-cut.json`, `blurbs.json`, `why-won.json`,
  `event-sizes.json`), re-run the pipeline. Never edit `projects.json` directly.
- **Reword a blurb / why-it-won** → `data/blurbs.json` / `data/why-won.json`, then
  `node scripts/final-cut.mjs`.
- **Fix a wrong tag / form** → `data/tag-overrides.json`, re-run pipeline.
- **Change card / feed look** → `lib/handoff.ts` + `components/handoff/`.
- **Project detail page** → `app/project/[slug]/page.tsx` + `components/ProjectDetail.tsx`.
- **Header / nav / theme** → `app/layout.tsx`, `app/globals.css`.
- **Auth or saved data** → `auth.ts`, `lib/auth/`, `lib/db/`, `lib/collections/`.
- **Env / secrets** → `.env.local` locally + the same vars in Vercel: `AUTH_SECRET`,
  `AUTH_TRUST_HOST`, `AUTH_GOOGLE_ID/SECRET`, `AUTH_GITHUB_ID/SECRET`, `DATABASE_URL`,
  `NEXT_PUBLIC_POSTHOG_KEY/HOST`, `NEXT_PUBLIC_SITE_URL`. See `AUTH_SETUP.md`.

## Run / deploy

- **Local prod build:** kill anything on the dev port **first**, then
  `npm run build && npm run start` (building over a running server invalidates the
  hashed CSS/JS chunks and renders unstyled — see `AGENTS.md`). Build needs env
  present (`lib/db/client.ts` throws if `DATABASE_URL` is unset).
- **Dev:** `npm run dev`.
- **DB schema:** `npm run db:push` (sync) / `npm run db:generate` (migration).
- **Deploy:** push to `main` → Vercel deploys to production (`hallofhackss.com`).

## Doc map

- `AGENTS.md` — authoritative brief: product, auth, taste rules, pending threads. **Start here.**
- `AUTH_SETUP.md` — auth + Neon + env setup steps.
- `data/README.md`, `data/CURATION.md` — pipeline mechanics + editorial methodology.
- `marketing/README.md` — outreach/growth playbook.
- `posthog-setup-report.md` — analytics instrumentation details.
- `README.md` — **stale** (retired design); do not rely on it.
