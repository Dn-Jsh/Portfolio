import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { PROJECTS } from "@/data/projects";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function ProjectsPage() {
  return (
    <div className="animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold mb-3">projects</h1>
      <p className="text-muted mb-12 max-w-xl">
        Products and platforms I&apos;ve designed and shipped &mdash; spanning web apps, mobile apps, and developer tools.
      </p>

      <div className="flex flex-col">
        {PROJECTS.map((project, i) => (
          <ScrollReveal key={project.id} delay={i * 0.08}>
            <a
              href={project.link}
              target={project.link.startsWith("http") ? "_blank" : undefined}
              rel={project.link.startsWith("http") ? "noopener noreferrer" : undefined}
              className="group block py-6 border-b border-border first:border-t transition-colors hover:bg-card/50 -mx-4 px-4 rounded-lg"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  {project.status && (
                    <span className="text-[11px] font-mono uppercase tracking-wider text-muted border border-border rounded-full px-2.5 py-0.5">
                      {project.status}
                    </span>
                  )}
                </div>
                <ArrowUpRight
                  size={16}
                  className="text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5"
                />
              </div>

              <h3 className="text-xl font-semibold mb-2 group-hover:text-muted transition-colors break-words">
                {project.title}
              </h3>
              <p className="text-fg/70 text-[15px] leading-relaxed mb-4 max-w-2xl">
                {project.description}
              </p>

              {project.tags && (
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] font-mono text-muted border border-border/60 rounded px-2 py-0.5"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </a>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}
