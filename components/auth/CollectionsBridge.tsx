"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  enterLocalMode,
  enterServerMode,
  refetch,
  registerAuthPrompt,
  runMigrationOnce,
} from "@/lib/collections";
import { MEMBER_FLAG_KEY } from "@/lib/auth/member-flag";

/**
 * Drives the collections store from session state: server mode (synced) when
 * signed in, local mode (read-only, saves gated) when not. Registers the
 * sign-in prompt (→ /signup with a return path) and refetches on focus so saves
 * made on another device show up.
 */
export default function CollectionsBridge() {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

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
    } else if (status === "unauthenticated") {
      try {
        localStorage.removeItem(MEMBER_FLAG_KEY);
      } catch {
        /* ignore */
      }
      enterLocalMode();
    }
  }, [status]);

  useEffect(() => {
    if (status !== "authenticated") return;
    const onFocus = () => refetch();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [status]);

  return null;
}
