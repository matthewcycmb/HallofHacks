"use client";

import type { Project } from "@/lib/types";
import { DOMAIN_TAGS, FORMS } from "@/lib/types";
import { isAllowedVideoEmbedUrl, watchUrlFromEmbed } from "@/lib/allowlist";
import { track } from "@/lib/analytics";
import SaveStar from "./handoff/SaveStar";
import ProjectImage from "./ProjectImage";
import TrackProjectOpen from "./analytics/TrackProjectOpen";

export default function ProjectDetail({ project }: { project: Project }) {
  const showVideo = project.demoVideoUrl && isAllowedVideoEmbedUrl(project.demoVideoUrl);
  const watch = showVideo ? watchUrlFromEmbed(project.demoVideoUrl!) : null;

  return (
    <div className="flex flex-col">
      <TrackProjectOpen slug={project.slug} name={project.name} hackathon={project.hackathon} />
      {/* Media pane — big video on top, mobile-style stacked layout.
          No fill: the video sits on the card's black so the top isn't a grey frame. */}
      <div className="flex items-center justify-center rounded-t-[26px] p-3 sm:p-4">
        {showVideo ? (
          <div className="w-full">
            <div className="aspect-video w-full overflow-hidden rounded-2xl shadow-sm">
              <iframe
                src={project.demoVideoUrl}
                title={`${project.name} demo video`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
                className="h-full w-full"
              />
            </div>
            {watch && (
              <div className="mt-2.5 flex justify-center">
                <a
                  href={watch.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-line px-3.5 py-2 font-mono text-[10.5px] uppercase tracking-[0.1em] text-ink-soft transition-colors hover:text-ink"
                >
                  Watch on {watch.label} ↗
                </a>
              </div>
            )}
          </div>
        ) : (
          <ProjectImage src={project.image} alt={`${project.name} project image`} className="block w-full rounded-2xl shadow-sm" />
        )}
      </div>

      {/* Info pane */}
      <div className="flex flex-col gap-3.5 p-5 md:p-6">
        {/* Devpost / GitHub links — pinned to the bottom of the info pane. */}
        <div className="order-last flex items-center justify-between gap-3 border-t border-line pt-4">
          <div className="flex items-center gap-1.5">
            <a
              href={project.devpostUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("project_link_opened", { slug: project.slug, destination: "devpost" })}
              className="rounded-full px-3 py-2 font-mono text-[10.5px] uppercase tracking-[0.1em] text-ink-soft transition-colors hover:bg-paper-2 hover:text-ink"
            >
              Devpost ↗
            </a>
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track("project_link_opened", { slug: project.slug, destination: "github" })}
                className="rounded-full px-3 py-2 font-mono text-[10.5px] uppercase tracking-[0.1em] text-ink-soft transition-colors hover:bg-paper-2 hover:text-ink"
              >
                GitHub ↗
              </a>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-display text-[28px] leading-[1.1] tracking-[-0.01em]">
              {project.name}
            </h2>
            {/* save sits on the right of the title row */}
            <div className="flex-none">
              <SaveStar slug={project.slug} className="mt-0.5" />
            </div>
          </div>
          <p className="mt-1.5 text-[16px] font-semibold text-gold">{project.award}</p>
          <p className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
            {project.hackathon} · {project.year}
          </p>
        </div>

        <p className="text-[15px] font-medium leading-snug text-ink-soft">{project.oneLiner}</p>

        {project.whyWon && (
          <div className="rounded-xl border border-gold/25 bg-paper-2 px-4 py-3.5">
            <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-gold">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M6 9a6 6 0 0 0 12 0V3H6v6Z" />
                <path d="M6 5H3v2a4 4 0 0 0 4 4M18 5h3v2a4 4 0 0 1-4 4M12 15v4M8 21h8" />
              </svg>
              Why it won
            </p>
            <p className="mt-1.5 text-sm leading-relaxed">{project.whyWon}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-1.5">
          {project.domainTags.map((t) => (
            <span
              key={t}
              className="rounded-full bg-paper-2 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-ink-soft"
            >
              {DOMAIN_TAGS[t] ?? t}
            </span>
          ))}
          <span className="rounded-full border border-line px-3 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-ink-soft">
            {FORMS[project.form]}
          </span>
        </div>

        <div className="border-t border-line pt-3.5">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
            The builders
          </p>
          <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            {project.team.map((member) => (
              <li key={member.name} className="font-display text-[16px]">
                {member.devpostProfileUrl ? (
                  <a
                    href={member.devpostProfileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline decoration-gold decoration-2 underline-offset-3 hover:text-gold"
                  >
                    {member.name}
                  </a>
                ) : (
                  member.name
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
