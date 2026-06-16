"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import ProjectCardMini from "@/components/handoff/ProjectCardMini";
import { deleteCollection, useCollections } from "@/lib/collections";
import { getAllProjects } from "@/lib/projects";
import { useHydrated } from "@/lib/use-hydrated";

export default function CollectionsPage() {
  const { collections } = useCollections();
  const { status } = useSession();
  const hydrated = useHydrated();
  const signedIn = status === "authenticated";

  const bySlug = new Map(getAllProjects().map((p) => [p.slug, p]));

  if (!hydrated) return null;

  return (
    <div className="mx-auto w-full max-w-[1040px] px-[clamp(20px,4vw,48px)] pb-[140px] pt-12">
      <h2 className="text-[26px] font-bold tracking-[-0.01em]">My collections</h2>
      <p className="mt-1 text-sm text-ink-soft">
        {signedIn
          ? "Synced to your account across devices."
          : "Saved on this device — sign in to keep them everywhere."}
      </p>

      {!signedIn && collections.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gold/30 bg-gold/[0.06] px-4 py-3">
          <p className="text-sm text-ink-soft">
            These are saved on this device. Sign in free to keep them across devices.
          </p>
          <Link
            href="/signup?next=/collections"
            className="shrink-0 rounded-full bg-ink px-4 py-2 text-[13px] font-bold text-paper transition-colors hover:bg-gold"
          >
            Keep them →
          </Link>
        </div>
      )}

      {collections.length === 0 ? (
        <div className="mx-auto mt-[16vh] flex max-w-sm flex-col items-center gap-2 text-center">
          <span className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-paper-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
            </svg>
          </span>
          <p className="text-[19px] font-bold">No collections yet.</p>
          <p className="text-sm text-ink-soft">
            Save any project from{" "}
            <Link href="/feed" className="text-gold underline underline-offset-2">
              the feed
            </Link>{" "}
            to start one.
          </p>
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-10">
          {collections.map((c) => {
            const saved = c.slugs
              .map((slug) => bySlug.get(slug))
              .filter((p): p is NonNullable<typeof p> => p !== undefined);
            return (
              <section key={c.id}>
                <div className="mb-4 flex items-baseline justify-between gap-3 border-t-2 border-ink pt-4">
                  <h3 className="font-display text-2xl">
                    {c.name}{" "}
                    <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-soft">
                      · {saved.length} {saved.length === 1 ? "project" : "projects"}
                    </span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Delete the collection “${c.name}”?`)) {
                        deleteCollection(c.id);
                      }
                    }}
                    className="rounded-full px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.08em] text-ink-soft transition-colors hover:bg-paper-2 hover:text-ink"
                  >
                    Delete
                  </button>
                </div>
                {saved.length === 0 ? (
                  <p className="text-sm text-ink-soft">Empty so far.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-[18px] sm:grid-cols-3 lg:grid-cols-5">
                    {saved.map((p) => (
                      <ProjectCardMini key={p.slug} project={p} />
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
