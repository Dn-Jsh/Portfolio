import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { PROJECTS } from "@/data/projects";
import { getPublishedItems } from "@/lib/portfolio-content";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";

export async function ProjectsPreview() {
  const projects = await getPublishedItems<typeof PROJECTS[number]>("project", PROJECTS);
  return (
    <section className="mb-20">
      <ScrollReveal>
        <SectionTitle
          number="02"
          title="projects"
          action={
            <Link
              href="/projects"
              className="text-sm font-mono flex items-center gap-1 hover:text-muted transition-colors"
            >
              ALL PROJECTS <ArrowRight size={14} />
            </Link>
          }
        />
      </ScrollReveal>

      <div className="flex flex-col">
        {projects.slice(0, 3).map(({ data: project, id }, i) => (
          <ScrollReveal key={id} delay={i * 0.06}>
            <a
              href={project.link}
              className="project-row group flex items-center justify-between gap-4 py-4 border-b border-border hover:bg-card/50 content-row rounded-lg"
            >
              <div className="min-w-0">
                <h3 className="font-semibold text-[15px] group-hover:text-muted transition-colors">
                  {project.title}
                </h3>
                <p className="text-[13px] text-muted mt-0.5 line-clamp-1">
                  {project.description}
                </p>
              </div>
              <ArrowUpRight
                size={15}
                className="text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0 group-hover:translate-x-1 group-hover:-translate-y-1 duration-200"
              />
            </a>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
