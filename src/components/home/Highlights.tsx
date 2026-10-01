import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { PROJECTS } from "@/data/projects";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";

export function Highlights() {
  return (
    <section className="mb-24">
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
        <div className="flex flex-col">
          {PROJECTS.slice(0, 2).map((project, i) => (
            <ScrollReveal key={project.id} delay={i * 0.08}>
              <a
                href={project.link}
                className="group flex items-start gap-4 py-5 border-b border-border hover:bg-card/50 content-row rounded-lg transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {project.status && (
                      <span className="text-[10px] font-mono uppercase tracking-wider text-muted border border-border rounded-full px-2 py-0.5">
                        {project.status}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-base group-hover:text-muted transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-[13px] text-fg/60 mt-1 line-clamp-1">
                    {project.description}
                  </p>
                </div>
                <ArrowUpRight
                  size={16}
                  className="text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1"
                />
              </a>
            </ScrollReveal>
          ))}
        </div>
      </ScrollReveal>
    </section>
  );
}
