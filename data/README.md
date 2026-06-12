# Data

`projects.json` is the app's database: a strictly curated set of winning
hackathon projects where every entry passes the "worth your time reading" bar
(one sharp technical insight, an honest pivot, or a visceral demo). The
curation spec is the user's hackathon reading list
(`~/MET/hackathon-reading-list.md`); its "10 highest-density reads" are the
featured ranks 1–10 and the file order is the reading order. **Never edit
projects.json by hand** — regenerate via the pipeline:

1. `node scripts/import-reading-list.mjs` → `reading-list-raw.json`
   (fetches each reading-list entry's Devpost page; the hand-transcribed
   manifest inside the script carries hackathon/year/award/blurb/rank)
2. `node scripts/rebuild-dataset.mjs` → `merged-raw.json`
   (keep-list survivors + imports, overlap patching, reading order,
   applies `tag-overrides.json`)
3. `node scripts/sanitize.mjs data/merged-raw.json data/projects.json`
4. `node scripts/extract-colors.mjs` then `node scripts/enrich-images.mjs`
   (idempotent — only fills records missing dominantColor/feedImage)
5. `node scripts/final-cut.mjs` — applies `final-cut.json`, the relentless
   ~21-project roster (creative trick + real result, top-3-overall biased).
   To restore a cut project, add its slug back and re-run steps 2–5.

`keep-list.json` — the explicit survivor list from the strict prune of the
original 100-project scrape. `tag-overrides.json` — manual corrections to
keyword-suggested tags (slug → `{ domainTags, form }`).

Legacy provenance (unused going forward): `raw-projects.json`,
`curated-projects.json`, `scripts/scrape.mjs`, `scripts/curate.mjs` — the
original 8-event winner scrape that seeded the first dataset.
