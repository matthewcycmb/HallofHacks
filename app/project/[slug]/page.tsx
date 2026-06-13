import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProjectDetail from "@/components/ProjectDetail";
import { getAllProjects, getProjectBySlug } from "@/lib/projects";

export function generateStaticParams() {
  return getAllProjects().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return {};
  const title = `${project.name} — ${project.award}, ${project.hackathon} ${project.year}`;
  return {
    title,
    description: project.oneLiner,
    openGraph: {
      title,
      description: project.oneLiner,
      images: [{ url: project.image }],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: project.oneLiner,
      images: [project.image],
    },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-8">
      <Link
        href="/feed"
        className="inline-flex items-center gap-2 rounded-full px-3 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-soft transition-colors hover:bg-paper-2 hover:text-ink"
      >
        ← Back to the feed
      </Link>
      <div className="mt-3 overflow-hidden rounded-[26px] border border-line bg-paper shadow-[0_18px_40px_-20px_rgba(20,15,2,0.45)]">
        <ProjectDetail project={project} />
      </div>
    </div>
  );
}
