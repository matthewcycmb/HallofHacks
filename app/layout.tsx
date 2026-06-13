import type { Metadata } from "next";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/next";
import Providers from "@/components/auth/Providers";
import AccountWidget from "@/components/auth/AccountWidget";
import HeaderSaves from "@/components/handoff/HeaderSaves";
import HeaderSearch from "@/components/handoff/HeaderSearch";
import SiteFooter from "@/components/SiteFooter";
import "./globals.css";

// Prefer an explicit override, else Vercel's production domain, else localhost.
// Keeps OG/canonical URLs absolute in prod without a manually-set env var.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

const title = "Hall of Hacks — the permanent archive of winning hackathon projects";
const description =
  "A bingeable archive of winning hackathon projects from Hack the North, TreeHacks, CalHacks, MHacks and more. Consume winners. Build winners.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: "%s — Hall of Hacks",
  },
  description,
  openGraph: {
    title,
    description,
    siteName: "Hall of Hacks",
    type: "website",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      {/* data-v in the server HTML: the night theme exists before any JS runs */}
      <body data-v="harbor" className="flex h-full flex-col">
        <Providers>
          <main className="flex min-h-0 flex-1 flex-col overflow-y-auto">
            {/* Luma-style top bar: one quiet row, borderless, scrolls with the page */}
            <header className="flex-none py-3.5">
              <div className="mx-auto flex w-full max-w-[1040px] items-center justify-between px-[clamp(20px,4vw,48px)]">
                <Link
                  href="/feed"
                  className="font-display text-[22px] leading-none tracking-[-0.01em] whitespace-nowrap"
                >
                  Hall <em className="font-normal italic text-gold">of</em> Hacks
                </Link>
                <div className="flex items-center gap-6">
                  <HeaderSearch />
                  <Link
                    href="/categories"
                    aria-label="Categories"
                    className="inline-flex items-center gap-2 rounded-full py-2 text-[15px] font-medium text-ink-soft transition-colors hover:text-ink"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
                    </svg>
                    <span className="hidden sm:inline">Categories</span>
                  </Link>
                  <HeaderSaves />
                  <AccountWidget />
                </div>
              </div>
            </header>
            {children}
            <SiteFooter />
          </main>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
