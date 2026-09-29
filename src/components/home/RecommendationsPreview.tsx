import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { RECOMMENDATIONS } from "@/data/recommendations";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function RecommendationsPreview() {
  return (
    <section className="mb-20">
      <ScrollReveal>
        <SectionTitle
          number="05"
          title="recommendations"
          action={
            <Link
              href="/recommendations"
              className="text-sm font-mono flex items-center gap-1 hover:text-muted transition-colors"
            >
              ALL RECOMMENDATIONS <ArrowRight size={14} />
            </Link>
          }
        />
      </ScrollReveal>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {RECOMMENDATIONS.slice(0, 3).map((rec, i) => (
          <ScrollReveal key={rec.name} delay={i * 0.06}>
            <div className="flex flex-col h-full p-5 rounded-xl border border-border">
              {/* Quote mark */}
              <span className="text-2xl leading-none text-muted/30 font-serif mb-3">
                &ldquo;&rdquo;
              </span>

              {/* Quote text */}
              <p className="text-[13px] text-fg/80 leading-relaxed flex-1 mb-5 line-clamp-4">
                {rec.quote}
              </p>

              {/* Attribution */}
              <div className="flex items-center gap-2.5 mt-auto pt-3 border-t border-border/50">
                <div className="w-7 h-7 rounded-full border border-border flex items-center justify-center text-[10px] font-bold text-muted shrink-0">
                  {rec.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-[12px] truncate">
                    {rec.name}
                  </h4>
                  <p className="text-[10px] text-muted uppercase tracking-wider truncate">
                    {rec.role}
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
