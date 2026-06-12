"use client";

import Link from "next/link";
import ProjectCardMini from "@/components/handoff/ProjectCardMini";
import { deleteCollection, useCollections } from "@/lib/collections";
import { getAllProjects } from "@/lib/projects";
import { useHydrated } from "@/lib/use-hydrated";

export default function CollectionsPage() {
  const { collections } = useCollections();
  const hydrated = useHydrated();

  const bySlug = new Map(getAllProjects().map((p) => [p.slug, p]));

  if (!hydrated) return null;

  return (
    <div className="mx-auto w-full max-w-[1040px] px-[clamp(20px,4vw,56px)] py-8">
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="font-display text-4xl">My collections</h2>
        <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-soft">
          Kept in this browser — no account needed
        </p>
      </div>

      {collections.length === 0 ? (
        <div className="mx-auto max-w-md rounded-[22px] bg-paper-2 p-10 text-center">
          <p className="font-display text-2xl">No collections yet.</p>
          <p className="mt-2 text-sm text-ink-soft">
            Save any project from{" "}
            <Link href="/" className="text-gold underline underline-offset-2">
              the feed
            </Link>{" "}
            to start one.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-10">
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
