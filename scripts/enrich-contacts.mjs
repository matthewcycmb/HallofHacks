/**
 * Enrich marketing/contacts.json via the GitHub API. Each builder's GitHub
 * handle came from the account that owns the project repo, so its profile
 * fields (twitter_username, blog, name, bio) are high-confidence and tied to
 * the right person. Fills Twitter + personal sites the Devpost pull missed.
 *
 * Usage: node scripts/enrich-contacts.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";

const contacts = JSON.parse(readFileSync("marketing/contacts.json", "utf8"));
const UA = "HallOfHacks-scout (contact: jchanh@gmail.com)";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function gh(handle) {
  try {
    await sleep(250);
    const res = await fetch(`https://api.github.com/users/${handle}`, {
      headers: { "User-Agent": UA, Accept: "application/vnd.github+json" },
    });
    if (!res.ok) return { _err: res.status };
    const j = await res.json();
    return {
      twitter: j.twitter_username ? "@" + j.twitter_username : undefined,
      blog: j.blog || undefined,
      name: j.name || undefined,
      bio: j.bio || undefined,
    };
  } catch (e) {
    return { _err: String(e).slice(0, 40) };
  }
}

for (const t of contacts.flatMap((c) => c.team)) {
  if (!t.github) continue;
  const g = await gh(t.github);
  if (g._err) {
    process.stdout.write(`  ${t.name} (${t.github}): gh ${g._err}\n`);
    continue;
  }
  if (!t.twitter && g.twitter) t.twitter = g.twitter; // fill, don't overwrite Devpost
  const blog = g.blog;
  if (blog) {
    const url = /^https?:\/\//.test(blog) ? blog : "https://" + blog;
    if (/linkedin\.com/i.test(url) && !t.linkedin) t.linkedin = url.replace(/\/$/, "");
    else if (!/linkedin\.com/i.test(url)) {
      (t.sites ??= []).push(url);
      t.sites = [...new Set(t.sites)];
    }
  }
  if (g.name && g.name !== t.name) t.ghName = g.name;
  const got = ["twitter", "linkedin"].filter((k) => t[k]);
  process.stdout.write(`  ${t.name} (${t.github}): +${got.join(",") || (blog ? "site" : "nothing new")}\n`);
}

writeFileSync("marketing/contacts.json", JSON.stringify(contacts, null, 2));
const flat = contacts.flatMap((c) => c.team);
const have = (k) => flat.filter((t) => t[k]).length;
console.log(`\nAfter GitHub enrichment: twitter ${have("twitter")} · linkedin ${have("linkedin")} · github ${have("github")} · site ${flat.filter((t) => t.sites).length}`);
// Per-team reachability: does at least one member have a non-Devpost channel?
const reachable = contacts.filter((c) => c.team.some((t) => t.twitter || t.linkedin || t.sites)).length;
console.log(`Teams with a Twitter/LinkedIn/site for at least one member: ${reachable}/${contacts.length}`);
