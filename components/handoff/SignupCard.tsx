"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { pinCuratedNextVisit } from "@/lib/feed-rotation";
import { detectInAppBrowser } from "@/lib/in-app-browser";
import { useHydrated } from "@/lib/use-hydrated";
import { track } from "@/lib/analytics";
import { BTN_GHOST } from "./OnboardingFlow";

/**
 * /signup — Google + GitHub OAuth (email login intentionally out for launch).
 * Reads `?next=` (where to return after sign-in) and `?error=` (OAuth failure).
 */

/**
 * Only follow a same-origin relative path. Blocks `//evil.com` (protocol-
 * relative) and `/\evil.com` (backslash) open-redirects, since `next` is used
 * both as a redirect target here and as the OAuth callbackUrl. Keep in sync with
 * the pre-paint script in app/signup/page.tsx.
 */
function safeNext(raw: string | null): string {
  return raw && raw.charAt(0) === "/" && raw.charAt(1) !== "/" && raw.charAt(1) !== "\\"
    ? raw
    : "/feed";
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px] flex-none" aria-hidden>
      <path d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81Z" />
    </svg>
  );
}

function GitHubMark() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px] flex-none" aria-hidden>
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.69 1.25 3.34.96.1-.74.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.16 1.18a11 11 0 0 1 5.75 0c2.2-1.49 3.16-1.18 3.16-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.26 5.66.41.36.78 1.06.78 2.14 0 1.55-.01 2.79-.01 3.17 0 .31.21.67.8.56A10.52 10.52 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

const ERROR_COPY: Record<string, string> = {
  OAuthAccountNotLinked:
    "That email is already linked to a different sign-in method. Use the provider you signed up with.",
  AccessDenied: "Sign-in was cancelled or access was denied.",
  Configuration: "Sign-in isn't configured yet. Please try again shortly.",
};

export default function SignupCard() {
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const errorKey = params.get("error");
  const errorMsg = errorKey
    ? ERROR_COPY[errorKey] ?? "Something went wrong signing in. Please try again."
    : null;

  // Already signed in? Don't show the sign-in card — send them where they were
  // headed (`next`, default /feed). Authoritative backstop to the pre-paint
  // script on /signup, for when localStorage is unavailable (Safari private mode).
  const { status } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (status === "authenticated") router.replace(next);
  }, [status, router, next]);

  // Reached the sign-in screen. `next` !== /feed means they were gated here by an
  // action (e.g. a save), which pairs with the signup_wall_triggered event.
  useEffect(() => {
    track("signup_viewed", { next, gated: next !== "/feed" });
  }, [next]);

  // In-app browsers (Instagram, Facebook, TikTok, …) can't show Google's account
  // chooser and Google often blocks OAuth in them. Derive this only after hydration
  // (the page is statically prerendered, so there's no UA at render time) so the
  // SSR markup and first client paint match, then nudge to open in Safari/Chrome.
  const hydrated = useHydrated();
  const inApp = hydrated
    ? detectInAppBrowser(navigator.userAgent)
    : { isInApp: false, appName: null };
  const [copied, setCopied] = useState(false);
  function copyLink() {
    navigator.clipboard
      ?.writeText(window.location.href)
      .then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {});
  }

  if (status === "authenticated") {
    return <div className="fixed inset-0 z-50 bg-black" aria-hidden />;
  }

  return (
    // Full-screen over the site chrome, card centered with a slight downward bias.
    <div className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden bg-black text-ink">
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(60% 44% at 18% 0%, rgba(227,190,110,0.018), transparent 75%), radial-gradient(54% 40% at 85% 12%, rgba(160,170,200,0.022), transparent 75%)",
        }}
        aria-hidden
      />
      <div className="relative flex min-h-full items-center justify-center p-5 pt-[6vh]">
        <div className="flex w-[min(430px,100%)] flex-col items-start gap-4 rounded-3xl border border-white/[0.07] bg-white/[0.055] p-[30px] pb-7">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/croc.png" alt="" className="croc-mark h-7 w-auto" />
          <h1 className="-mt-1 whitespace-nowrap font-display text-[clamp(19px,5.6vw,25px)] tracking-[-0.01em]">
            Welcome to Hall of Hacks
          </h1>
          <p className="-mt-2 text-[15px] text-ink-soft">Please sign up or sign in below.</p>

          {inApp.isInApp && (
            <div className="w-full rounded-xl border border-gold/30 bg-gold/[0.07] px-3.5 py-3 text-[13px] leading-relaxed text-ink-soft">
              <p className="flex items-center gap-1.5 font-semibold text-ink">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <path d="M15 3h6v6M10 14 21 3" />
                </svg>
                Open in Safari or Chrome to sign in
              </p>
              <p className="mt-1.5">
                You&rsquo;re in {inApp.appName ?? "an in-app"}&rsquo;s built-in browser, which
                can&rsquo;t show your Google accounts. Tap the{" "}
                <b className="text-ink">&middot;&middot;&middot;</b> menu in the top corner and
                choose <b className="text-ink">&ldquo;Open in browser,&rdquo;</b> then sign in
                there.
              </p>
              <button
                type="button"
                onClick={copyLink}
                className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-[12.5px] font-medium text-ink transition-colors hover:bg-white/10"
              >
                {copied ? "Link copied ✓" : "Copy link"}
              </button>
            </div>
          )}

          {errorMsg && (
            <p className="w-full rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-[13px] text-red-200">
              {errorMsg}
            </p>
          )}

          <button
            type="button"
            onClick={() => {
              track("signup_started", { provider: "google" });
              pinCuratedNextVisit();
              signIn("google", { callbackUrl: next });
            }}
            className={`${BTN_GHOST} w-full rounded-[13px] py-[13px] text-[15.5px]`}
          >
            <GoogleMark /> Continue with Google
          </button>
          <button
            type="button"
            onClick={() => {
              track("signup_started", { provider: "github" });
              pinCuratedNextVisit();
              signIn("github", { callbackUrl: next });
            }}
            className={`${BTN_GHOST} w-full rounded-[13px] py-[13px] text-[15.5px]`}
          >
            <GitHubMark /> Continue with GitHub
          </button>

          {/* Reassurance at the commitment moment. */}
          <p className="w-full text-center text-[12px] text-ink-soft">
            Free forever. Takes ten seconds.
          </p>
          <p className="text-[11.5px] leading-normal text-white/40">
            By continuing you agree to the{" "}
            <Link href="/terms" className="text-ink-soft underline underline-offset-2">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-ink-soft underline underline-offset-2">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
