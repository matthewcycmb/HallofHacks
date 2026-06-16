import posthog from "posthog-js";

/**
 * Fire a PostHog event. No-ops on the server and whenever PostHog isn't
 * configured (no NEXT_PUBLIC_POSTHOG_KEY), so it's safe to call from anywhere
 * without guarding. Use for the conversion-funnel events autocapture can't
 * cleanly name (project opens, save intent, the signup wall, auth starts).
 */
export function track(event: string, props?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  if (!posthog.__loaded) return; // not initialized (no key) -> silent no-op
  posthog.capture(event, props);
}
