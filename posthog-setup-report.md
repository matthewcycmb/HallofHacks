# PostHog post-wizard report

The wizard completed a deep integration of PostHog into Hall of Hacks. Key changes:

- **Reverse proxy** added to `next.config.ts` so all PostHog traffic routes through `/ingest` (same-origin), fixing the `connect-src 'self'` CSP that was silently blocking analytics in production.
- **PostHogProvider** updated to use the proxy (`api_host: "/ingest"`), `ui_host`, `defaults: "2026-01-30"`, and `capture_exceptions: true` for error tracking.
- **posthog-node** installed and a server-side client (`lib/posthog-server.ts`) created for server action tracking.
- **User identification** wired in `CollectionsBridge` — calls `posthog.identify()` with the Auth.js user ID on sign-in transition, and `posthog.reset()` on sign-out in `AccountWidget`.
- **8 new events** added across 6 files (see table below).

## Events

| Event | Description | File |
|---|---|---|
| `landing_cta_clicked` | User clicks Get started, Browse projects, or Sign in on the landing page | `components/handoff/OnboardingFlow.tsx` |
| `search_opened` | User opens the header search input | `components/handoff/HeaderSearch.tsx` |
| `search_submitted` | User commits a non-empty search query | `components/handoff/HeaderSearch.tsx` |
| `project_link_opened` | User opens Devpost or GitHub from the project detail page | `components/ProjectDetail.tsx` |
| `user_signed_in` | User completes OAuth sign-in (also triggers `posthog.identify`) | `components/auth/CollectionsBridge.tsx` |
| `user_signed_out` | User signs out via the account dropdown (also triggers `posthog.reset`) | `components/auth/AccountWidget.tsx` |
| `project_saved` | Save or unsave action on a project (server-side, from Server Action) | `lib/collections/actions.ts` |
| `collection_created` | User creates a new named collection (server-side) | `lib/collections/actions.ts` |

Previously-existing events (`project_opened`, `save_clicked`, `signup_wall_triggered`, `signup_viewed`, `signup_started`) were not modified.

## Next steps

We've built a dashboard and five insights to keep an eye on user behavior:

- **Dashboard:** [Analytics basics (wizard)](https://us.posthog.com/project/473056/dashboard/1720236)
- **Sign-up conversion funnel** — Landing CTA → Signup viewed → Auth started → Signed in: [gQJyxFIh](https://us.posthog.com/project/473056/insights/gQJyxFIh)
- **Save wall funnel** — Project opened → Save clicked → Project saved: [giRqoidz](https://us.posthog.com/project/473056/insights/giRqoidz)
- **Engagement events over time** — Project opens, saves, external links, searches: [YPvRZXOM](https://us.posthog.com/project/473056/insights/YPvRZXOM)
- **Signup wall friction** — Save gate hits vs. auth started after: [H6ukI0xD](https://us.posthog.com/project/473056/insights/H6ukI0xD)
- **Landing CTA clicks by button** — Breakdown by `cta` property: [qt0GmQNS](https://us.posthog.com/project/473056/insights/qt0GmQNS)

## Verify before merging

- [ ] Run a full production build (`npm run build`) and fix any lint or type errors introduced by the generated code.
- [ ] Run the test suite — call sites that were rewritten or instrumented may need updated mocks or fixtures.
- [ ] Add `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` to `.env.example` and any onboarding docs so collaborators know what to set.
- [ ] Wire source-map upload (`posthog-cli sourcemap` or equivalent) into CI so production stack traces de-minify.
- [ ] Confirm the returning-visitor path also calls `identify` — the current implementation fires `identify` on every authenticated status resolution (not only on the `unauthenticated → authenticated` transition), so returning logged-in sessions are covered. Verify this in PostHog by checking that session replays for returning users show an identified person, not an anonymous ID.

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.
