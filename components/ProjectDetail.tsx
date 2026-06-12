import type { Project } from "@/lib/types";
import { DOMAIN_TAGS, FORMS } from "@/lib/types";
import { isAllowedVideoEmbedUrl } from "@/lib/allowlist";
import DetailSave from "./handoff/DetailSave";
import ProjectImage from "./ProjectImage";

export default function ProjectDetail({ project }: { project: Project }) {
  const showVideo = project.demoVideoUrl && isAllowedVideoEmbedUrl(project.demoVideoUrl);

  return (
    <div className="grid md:grid-cols-2">
      {/* Media pane */}
      <div className="flex items-center justify-center rounded-t-[26px] bg-paper-2 p-3 md:rounded-l-[26px] md:rounded-tr-none md:p-5">
        {showVideo ? (
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
        ) : (
          <ProjectImage src={project.image} alt={`${project.name} project image`} className="block w-full rounded-2xl shadow-sm" />
        )}
      </div>

      {/* Info pane */}
      <div className="flex flex-col gap-3.5 p-5 md:p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <a
              href={project.devpostUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full px-3 py-2 font-mono text-[10.5px] uppercase tracking-[0.1em] text-ink-soft transition-colors hover:bg-paper-2 hover:text-ink"
            >
              Devpost ↗
            </a>
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full px-3 py-2 font-mono text-[10.5px] uppercase tracking-[0.1em] text-ink-soft transition-colors hover:bg-paper-2 hover:text-ink"
              >
                GitHub ↗
              </a>
            )}
          </div>
          <DetailSave slug={project.slug} />
        </div>

        <div>
          <h2 className="font-display text-[28px] leading-[1.1] tracking-[-0.01em]">
            {project.name}
          </h2>
          <p className="mt-1.5 text-[16px] font-semibold text-gold">{project.award}</p>
          <p className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
            {project.hackathon} · {project.year}
          </p>
        </div>

        <p className="text-[15px] font-medium leading-snug text-ink-soft">{project.oneLiner}</p>

        <p className="line-clamp-6 text-sm leading-relaxed">{project.description}</p>

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
