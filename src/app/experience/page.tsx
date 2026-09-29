import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { EXPERIENCE } from "@/data/experience";

export default function ExperiencePage() {
  return (
    <div className="animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold mb-3">experience</h1>
      <p className="text-muted mb-12 max-w-xl">
        Building across web and mobile development &mdash; from freelance projects to team collaborations.
      </p>

      <div className="flex flex-col">
        {EXPERIENCE.map((exp, i) => (
          <ScrollReveal key={i} delay={i * 0.08}>
            <div className="py-8 border-b border-border first:border-t">
              {/* Company header */}
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center text-[11px] font-bold text-muted shrink-0">
                  {exp.company.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-base">{exp.company}</h3>
                  <span className="text-[12px] text-muted">{exp.type}</span>
                </div>
              </div>

              {/* Role */}
              <div className="ml-11 mt-4 border-l-2 border-border pl-6">
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
