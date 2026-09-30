import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { PageIntro } from "@/components/ui/PageIntro";
import { PROJECTS } from "@/data/projects";
import { getPublishedItems, getPageIntro } from "@/lib/portfolio-content";
import { ArrowUpRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const [projectRows, intro] = await Promise.all([
    getPublishedItems<typeof PROJECTS[number]>("project", PROJECTS),
    getPageIntro("projects", { title: "projects", description: "Products and platforms I've designed and shipped — spanning web apps, mobile apps, and developer tools." }),
  ]);
  const projects = projectRows.map((row) => ({ ...row.data, id: row.id }));
  return (
    <div className="page-enter">
      <PageIntro
        title={intro.title}
        description={intro.description}
      />

      <div className="flex flex-col">
        {projects.map((project, i) => (
          <ScrollReveal key={project.id} delay={i * 0.08}>
            <a
              href={project.link}
              target={project.link.startsWith("http") ? "_blank" : undefined}
              rel={project.link.startsWith("http") ? "noopener noreferrer" : undefined}
              className="project-row group block py-6 border-b border-border first:border-t hover:bg-card/50 -mx-4 px-4 rounded-lg"
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
