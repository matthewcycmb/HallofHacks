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
      enterServerMode().then(runMigrationOnce);
    } else if (status === "unauthenticated") {
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
