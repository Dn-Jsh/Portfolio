import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { EXPERIENCE } from "@/data/experience";
import { STACK } from "@/data/stack";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function ExperiencePreview() {
  // Flatten all stack items, show first 10
  const allItems = STACK.flatMap((g) => g.items);
  const previewItems = allItems.slice(0, 10);
  const remaining = allItems.length - previewItems.length;

  return (
    <section className="mb-20">
      <ScrollReveal>
        <SectionTitle
          number="03"
          title="experience"
          action={
            <Link
              href="/experience"
              className="text-sm font-mono flex items-center gap-1 hover:text-muted transition-colors"
            >
              FULL HISTORY <ArrowRight size={14} />
            </Link>
          }
        />
      </ScrollReveal>

      {/* Experience table */}
      <div className="flex flex-col">
        {EXPERIENCE.map((exp, i) => (
          <ScrollReveal key={i} delay={i * 0.06}>
            <div className="flex items-baseline gap-4 py-3.5 border-b border-border">
              <span className="text-[13px] font-mono text-muted w-16 shrink-0">
                {exp.period.split("—")[0].trim().split(" ").pop()}
              </span>
              <span className="font-semibold text-[14px] flex-1 min-w-0">
                {exp.role}
              </span>
              <span className="text-[13px] text-muted text-right shrink-0 hidden sm:block">
                {exp.company}
              </span>
            </div>
          </ScrollReveal>
        ))}
      </div>

      {/* Stack preview */}
      <ScrollReveal delay={0.2}>
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[12px] font-mono uppercase tracking-widest text-muted">
              Stack
            </span>
            <Link
              href="/stack"
              className="text-[12px] font-mono flex items-center gap-1 text-muted hover:text-fg transition-colors"
            >
              VIEW ALL <ArrowRight size={12} />
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {previewItems.map((item) => (
              <span
                key={item}
                className="inline-flex items-center px-3 py-1.5 rounded-md text-[12px] font-mono border border-border text-fg hover:border-muted/40 transition-colors cursor-default"
              >
                {item}
              </span>
            ))}
            {remaining > 0 && (
              <Link
                href="/stack"
                className="inline-flex items-center px-3 py-1.5 rounded-md text-[12px] font-mono border border-border text-muted hover:text-fg hover:border-muted/40 transition-colors"
              >
                + {remaining} more
              </Link>
            )}
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
