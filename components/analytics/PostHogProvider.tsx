"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react";

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;

/**
 * Client-side PostHog (session replay, funnels, heatmaps, autocapture).
 *
 * No-ops entirely until NEXT_PUBLIC_POSTHOG_KEY is set (in .env.local + Vercel),
 * so the build is safe before it's configured. Stays client-only so every page
 * keeps its static rendering. Pageviews are captured manually because the App
 * Router doesn't emit route changes to analytics SDKs on its own.
 */
export default function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!KEY || posthog.__loaded) return;
    posthog.init(KEY, {
      api_host: "/ingest",
      ui_host: "https://us.posthog.com",
      defaults: "2026-01-30",
      capture_pageview: false, // captured manually below for the App Router
      capture_pageleave: true, // time-on-page / drop-off signal
      capture_exceptions: true,
      person_profiles: "identified_only",
      debug: process.env.NODE_ENV === "development",
    });
  }, []);

  if (!KEY) return <>{children}</>;
  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PageviewTracker />
      </Suspense>
      {children}
    </PHProvider>
  );
}

/** Fire a $pageview on every client-side route change. */
function PageviewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const ph = usePostHog();
  useEffect(() => {
    if (!pathname || !ph) return;
    let url = window.origin + pathname;
    const qs = searchParams?.toString();
    if (qs) url += `?${qs}`;
    ph.capture("$pageview", { $current_url: url });
  }, [pathname, searchParams, ph]);
  return null;
}
