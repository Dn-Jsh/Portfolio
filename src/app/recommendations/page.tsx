import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { RECOMMENDATIONS } from "@/data/recommendations";

export default function RecommendationsPage() {
  return (
    <div className="animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold mb-3">recommendations</h1>
      <p className="text-muted mb-12 max-w-xl">
        What leaders, teammates, and mentors say about working with me.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {RECOMMENDATIONS.map((rec, i) => (
          <ScrollReveal key={rec.name} delay={i * 0.08}>
            <div className="flex flex-col h-full p-6 rounded-xl border border-border bg-card">
              {/* Quote mark */}
              <span className="text-3xl leading-none text-muted/30 font-serif mb-3">&ldquo;&rdquo;</span>

              {/* Quote text */}
              <p className="text-[14px] text-fg/85 leading-relaxed flex-1 mb-6">
                {rec.quote}
              </p>

              {/* Attribution */}
              <div className="flex items-center gap-3 mt-auto pt-4 border-t border-border/50">
                <div className="w-8 h-8 rounded-full bg-bg border border-border flex items-center justify-center text-[11px] font-bold text-muted shrink-0">
                  {rec.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                </div>
                <div>
                  <h4 className="font-semibold text-[13px]">{rec.name}</h4>
                  <p className="text-[11px] text-muted">{rec.role}</p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}
