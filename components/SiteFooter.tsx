"use client";

import { usePathname } from "next/navigation";

/** The feed must never visibly end — the footer lives on every other page. */
export default function SiteFooter() {
  const pathname = usePathname();
  if (pathname === "/") return null;

  return (
    <footer className="mt-auto border-t border-line">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-2 px-4 py-6 font-mono text-[10.5px] tracking-[0.04em] text-ink-soft sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p>Hall of Hacks · winning projects, remembered. Data from public Devpost pages.</p>
        <p>
          On a team and want a project removed?{" "}
          <a
            href="mailto:jchanh@gmail.com?subject=Hall%20of%20Hacks%20removal%20request"
            className="text-gold underline underline-offset-2"
          >
            Request removal
          </a>
        </p>
      </div>
    </footer>
  );
}
