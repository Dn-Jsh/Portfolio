import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { PageIntro } from "@/components/ui/PageIntro";
import { ProjectItem } from "@/components/ui/ProjectItem";
import { PROJECTS, type Project } from "@/data/projects";
import { getPublishedItems, getPageIntro } from "@/lib/portfolio-content";
import { includeRedCrossProject, includeSundaySetlistProject } from "@/lib/projects";
import { getPublicPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata = getPublicPageMetadata("/projects");

export default async function ProjectsPage() {
  const [projectRows, intro] = await Promise.all([
    getPublishedItems<Project>("project", PROJECTS),
    getPageIntro("projects", { title: "projects", description: "Products and platforms I've designed and shipped — spanning web apps, mobile apps, and developer tools." }),
  ]);
  return (
    <div className="page-enter">
      <PageIntro title={intro.title} description={intro.description} />
      <div className="flex flex-col">
        {includeRedCrossProject(includeSundaySetlistProject(projectRows)).map(({ data: project, id }, i) => (
          <ScrollReveal key={id} delay={i * 0.08}>
            <ProjectItem project={project} />
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}
