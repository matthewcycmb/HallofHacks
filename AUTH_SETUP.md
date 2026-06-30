# Auth go-live checklist

Google + GitHub sign-in with cloud-synced collections is fully wired in code. To
make it actually work you need to provision three things (OAuth apps + a database)
and set the env vars. ~20 minutes.

## 1. Database (Neon Postgres)

1. Create a free project at https://neon.tech and copy the **pooled** connection string.
2. Put it in `.env.local` as `DATABASE_URL=...`.
3. Create the tables: `npm run db:push` (or `npm run db:migrate` to apply the
   committed SQL in `drizzle/`). The schema is `lib/db/schema.ts`.

## 2. Google OAuth

1. Google Cloud Console → **APIs & Services → Credentials → Create OAuth client ID → Web application**.
2. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://<your-prod-domain>/api/auth/callback/google`
3. Configure the **OAuth consent screen**: app name, support email, and the
   **Privacy policy URL** (`https://<domain>/privacy`) + Terms URL (`/terms`) —
   these pages already exist.
4. **Publish the app** (Publishing status → "In production"). Scopes are
   profile/email (non-sensitive), so this goes live **without** Google's review.
   ⚠️ While in "Testing" you're capped at **100 users** — publish before launch.
5. Copy the client ID/secret into `.env.local` as `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`.

## 3. GitHub OAuth

1. GitHub → Settings → **Developer settings → OAuth Apps → New OAuth App**.
2. Authorization callback URL: `https://<your-prod-domain>/api/auth/callback/github`.
   GitHub allows one callback per app, so for local dev create a **second** OAuth
   app pointing at `http://localhost:3000/api/auth/callback/github`.
3. Copy into `.env.local` as `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET`.

## 4. Env vars

`.env.local` is already created with a generated `AUTH_SECRET` — just replace the
PLACEHOLDER values from steps 1–3. See `.env.example` for the full list. Then set
the **same vars in Vercel** → Project → Settings → Environment Variables
(Production + Preview), including `AUTH_TRUST_HOST=true`.

## 5. Verify

```
npm run build && npm run start     # kill :3000 first
```
- Sign in with Google, then GitHub on the same email → check Neon: expect **one**
  `user` row and **two** `account` rows (account linking is on).
- Save a project → row appears in `collection` / `collection_item`.
- Sign in on a second browser → the save is there (cross-device sync).
- Saving while signed out should bounce you to `/signup?next=...`.

## Before you ship to 1000 people

- ✅ Real `/privacy` + `/terms` — done (edit the contact emails: currently
  `privacy@hallofhacks.app` / `hello@hallofhacks.app`).
- ✅ Secure session cookies — Auth.js defaults.
- ✅ Account deletion — `deleteAccountAction()` exists in `lib/collections/actions.ts`
  (not yet surfaced in UI; add an `/account` page if you want it user-facing).
- Optional: rate-limit the collection mutation actions (Upstash) — low risk since
  every action requires a valid session; add only if you see abuse.

## How it's built (for future you)

- `auth.ts` — Auth.js v5, Google + GitHub, **JWT sessions** (no per-request DB hit).
- No `middleware.ts`/`proxy.ts` — auth is checked via `auth()` in `lib/auth/dal.ts`,
  called from the server actions in `lib/collections/actions.ts`.
- The archive stays **static**: auth state is client-side via `SessionProvider`
  (`components/auth/Providers.tsx`) + `useSession`, so `/`, `/project/[slug]`, etc.
  remain SSG. Only `/api/auth/*` is dynamic.
- `lib/collections.ts` is session-aware: logged-out saves write to localStorage
  (with a "Saved — sign in to keep it" toast — **not** gated), optimistic +
  server-synced when logged in. `CollectionsBridge` drives the mode and runs a
  one-time localStorage→account migration on first login. The `/signup?next=`
  prompt only fires if a server action reports the session expired mid-use.
