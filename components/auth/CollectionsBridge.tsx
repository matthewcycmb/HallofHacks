"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import posthog from "posthog-js";
import {
  enterLocalMode,
  enterServerMode,
  refetch,
  registerAuthPrompt,
  runMigrationOnce,
} from "@/lib/collections";
import { MEMBER_FLAG_KEY } from "@/lib/auth/member-flag";
import { track } from "@/lib/analytics";

/**
 * Drives the collections store from session state: server mode (synced) when
 * signed in, local mode (saved to localStorage with a "sign in to keep it"
 * toast — not gated) when not. Registers the sign-in prompt (→ /signup with a
 * return path) used when a session expires mid-use, and refetches on focus so
 * saves made on another device show up.
 */
export default function CollectionsBridge() {
  const { status, data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const prevStatus = useRef<string | null>(null);

  useEffect(() => {
    registerAuthPrompt(() => router.push(`/signup?next=${encodeURIComponent(pathname)}`));
    return () => registerAuthPrompt(null);
  }, [router, pathname]);

  useEffect(() => {
    if (status === "authenticated") {
      // Remember this device is signed in so the static home page can skip
      // onboarding on the next visit (read pre-paint by the inline script on `/`).
      try {
        localStorage.setItem(MEMBER_FLAG_KEY, "1");
      } catch {
        /* private mode — useSession backstop covers it */
      }
      enterServerMode().then(runMigrationOnce);

      // Identify the user in PostHog and fire user_signed_in only on the
      // transition from loading/unauthenticated → authenticated (not on every render).
      if (prevStatus.current !== "authenticated" && session?.user?.id) {
        posthog.identify(session.user.id, {
          email: session.user.email ?? undefined,
          name: session.user.name ?? undefined,
        });
        if (prevStatus.current === "unauthenticated") {
          track("user_signed_in");
        }
      }
    } else if (status === "unauthenticated") {
      try {
        localStorage.removeItem(MEMBER_FLAG_KEY);
      } catch {
        /* ignore */
      }
      enterLocalMode();
    }
    prevStatus.current = status;
  }, [status, session]);

  useEffect(() => {
    if (status !== "authenticated") return;
    const onFocus = () => refetch();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [status]);

  return null;
}
