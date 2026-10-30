import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/data/projects";
import { ProjectDialog } from "./ProjectDialog";
import { ProjectDetails } from "./ProjectDetails";

export function ProjectItem({ project, compact = false }: { project: Project; compact?: boolean }) {
  const className = `project-row group block w-full text-left border-b border-border hover:bg-card/50 content-row rounded-lg ${compact ? "py-4" : "py-6 first:border-t"}`;
  const content = (
    <>
      <span className="flex items-start justify-between gap-4">
        <span className="min-w-0">
          {!compact && project.status && <span className="inline-block mb-3 text-[11px] font-mono uppercase tracking-wider text-muted border border-border rounded-full px-2.5 py-0.5">{project.status}</span>}
          <span role="heading" aria-level={3} className={`block font-semibold group-hover:text-muted transition-colors break-words ${compact ? "text-[15px]" : "text-xl mb-2"}`}>{project.title}</span>
          <span className={`block text-muted ${compact ? "text-[13px] mt-0.5 line-clamp-1" : "text-[15px] leading-relaxed mb-4 max-w-2xl"}`}>{project.description}</span>
        </span>
        <ArrowUpRight size={compact ? 15 : 16} aria-hidden="true" className="text-muted shrink-0 mt-1" />
      </span>
      {!compact && <span className="flex flex-wrap gap-2">{project.tags?.map((tag) => <span key={tag} className="text-[11px] font-mono text-muted border border-border/60 rounded px-2 py-0.5">{tag}</span>)}</span>}
    </>
  );
  const details = project.details;
  if (!details) return <a href={project.link} className={className} target={project.link.startsWith("http") ? "_blank" : undefined} rel={project.link.startsWith("http") ? "noopener noreferrer" : undefined}>{content}</a>;

  return <ProjectDialog title={project.title} icon={project.icon} className={className} details={<ProjectDetails project={project} details={details} />}>{content}</ProjectDialog>;
}
