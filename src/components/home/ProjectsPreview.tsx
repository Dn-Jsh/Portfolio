import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { ProjectItem } from "@/components/ui/ProjectItem";
import { PROJECTS, type Project } from "@/data/projects";
import { getPublishedItems } from "@/lib/portfolio-content";
import { includeRedCrossProject, includeSundaySetlistProject } from "@/lib/projects";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export async function ProjectsPreview() {
  const projects = includeRedCrossProject(includeSundaySetlistProject(await getPublishedItems<Project>("project", PROJECTS)));
  return (
    <section className="mb-20">
      <ScrollReveal>
        <SectionTitle
          number="02"
          title="projects"
          action={
            <Link href="/projects" className="text-sm font-mono flex items-center gap-1 hover:text-muted transition-colors">
              ALL PROJECTS <ArrowRight size={14} />
            </Link>
          }
        />
      </ScrollReveal>
      <div className="flex flex-col">
        {projects.slice(0, 3).map(({ data: project, id }, i) => (
          <ScrollReveal key={id} delay={i * 0.06}>
            <ProjectItem project={project} compact />
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
