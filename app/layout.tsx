import type { Metadata } from "next";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/next";
import Providers from "@/components/auth/Providers";
import AccountWidget from "@/components/auth/AccountWidget";
import HeaderSaves from "@/components/handoff/HeaderSaves";
import HeaderSearch from "@/components/handoff/HeaderSearch";
import SiteFooter from "@/components/SiteFooter";
import Toaster from "@/components/Toaster";
import JsonLd from "@/components/JsonLd";
import { siteUrl } from "@/lib/site-url";
import { siteJsonLd } from "@/lib/jsonld";
import "./globals.css";

const title = "Hall of Hacks — the permanent archive of winning hackathon projects";
const description =
  "A bingeable archive of winning hackathon projects from Hack the North, TreeHacks, CalHacks, MHacks and more. Consume winners. Build winners.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: title,
    template: "%s — Hall of Hacks",
  },
  description,
  keywords: [
    "winning hackathon projects",
    "hackathon winners",
    "hackathon project ideas",
    "how to win a hackathon",
    "best hackathon projects",
    "Hall of Hacks",
  ],
  alternates: { canonical: "/" },
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
        <JsonLd data={siteJsonLd()} />
        <Providers>
          <main className="flex min-h-0 flex-1 flex-col overflow-y-auto">
            {/* Luma-style top bar: one quiet row, borderless, scrolls with the page */}
            <header className="flex-none py-3.5">
              <div className="mx-auto flex w-full max-w-[1040px] items-center justify-between px-[clamp(20px,4vw,48px)]">
                <Link
                  href="/feed"
                  className="group inline-flex items-center gap-2 whitespace-nowrap font-display text-[19px] leading-none tracking-[-0.01em] sm:text-[22px]"
                >
                  {/* hidden on the smallest phones (≤~375px) so the wordmark + nav don't collide */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/croc.png" alt="" className="croc-mark hidden h-[18px] w-auto min-[390px]:block sm:h-[22px]" />
                  Hall <em className="font-normal italic text-gold">of</em> Hacks
                </Link>
                <div className="flex items-center gap-3.5 sm:gap-6">
                  <HeaderSearch />
                  <Link
                    href="/categories"
                    className="inline-flex items-center gap-2 rounded-full py-2 text-[15px] font-medium text-ink-soft transition-colors hover:text-ink"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
                    </svg>
                    <span className="sr-only sm:not-sr-only">Categories</span>
                  </Link>
                  <HeaderSaves />
                  <AccountWidget />
                </div>
              </div>
            </header>
            {/* grow wrapper: fills the viewport on short pages (footer glued to bottom)
                and takes its content height on tall pages (footer flows after, never overlaps) */}
            <div className="flex shrink-0 grow flex-col">{children}</div>
            <SiteFooter />
          </main>
        </Providers>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
