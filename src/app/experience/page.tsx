import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { PageIntro } from "@/components/ui/PageIntro";
import { EXPERIENCE } from "@/data/experience";
import { getPublishedItems, getPageIntro } from "@/lib/portfolio-content";
import { getPublicPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata = getPublicPageMetadata("/experience");

export default async function ExperiencePage() {
  const [entries, intro] = await Promise.all([
    getPublishedItems<typeof EXPERIENCE[number]>("experience", EXPERIENCE),
    getPageIntro("experience", { title: "experience", description: "Building across web and mobile development — from freelance projects to team collaborations." }),
  ]);
  return (
    <div className="page-enter">
      <PageIntro
        title={intro.title}
        description={intro.description}
      />

      <div className="flex flex-col">
        {entries.map(({ data: exp, id }, i) => (
          <ScrollReveal key={id} delay={i * 0.08}>
            <div className="py-8 border-b border-border first:border-t">
              {/* Company header */}
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center text-[11px] font-bold text-muted shrink-0">
                  {exp.company.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-base break-words">{exp.company}</h3>
                  <span className="text-[12px] text-muted">{exp.type}</span>
                </div>
              </div>

              {/* Role */}
              <div className="ml-4 sm:ml-11 mt-4 border-l-2 border-border pl-4 sm:pl-6">
                <h4 className="font-semibold text-[15px]">{exp.role}</h4>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-[12px] font-mono text-muted">
                  <span>{exp.period}</span>
                  {exp.location && (
                    <>
                      <span className="text-border">·</span>
                      <span>{exp.location}</span>
                    </>
                  )}
                </div>

                <p className="text-fg/70 text-[14px] leading-relaxed mt-4 max-w-2xl">
                  {exp.description}
                </p>

                {exp.skills && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {exp.skills.map((skill) => (
                      <span
                        key={skill}
                        className="text-[11px] font-mono text-muted border border-border/60 rounded px-2 py-0.5"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}
