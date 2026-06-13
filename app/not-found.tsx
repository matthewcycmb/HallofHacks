import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto mt-12 max-w-md rounded-[22px] bg-paper-2 p-10 text-center">
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-gold">404</p>
      <p className="mt-2 font-display text-3xl">Not in the record book.</p>
      <p className="mt-2 text-sm text-ink-soft">
        This page doesn&rsquo;t exist — but plenty of winning projects do.
      </p>
      <Link
        href="/feed"
        className="mt-5 inline-block rounded-full bg-ink px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.1em] text-paper hover:bg-gold"
      >
        Back to the feed
      </Link>
    </div>
  );
}
