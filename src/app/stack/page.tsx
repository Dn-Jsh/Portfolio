import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { STACK } from "@/data/stack";

export default function StackPage() {
  return (
    <div className="animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold mb-3">tech stack</h1>
      <p className="text-muted mb-12 max-w-xl">
        The tools, frameworks, and platforms I reach for &mdash; across the front end, back end, and infrastructure.
      </p>

      <div className="flex flex-col gap-10">
        {STACK.map((group, i) => (
          <ScrollReveal key={group.category} delay={i * 0.08}>
            <div>
              <h2 className="text-[12px] font-mono uppercase tracking-widest text-muted mb-5">
                {group.category}
              </h2>
              <div className="flex flex-wrap gap-2.5">
                {group.items.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center px-3.5 py-1.5 rounded-md text-[13px] font-mono border border-border bg-card text-fg hover:bg-card-hover hover:border-muted/30 transition-colors cursor-default"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}
