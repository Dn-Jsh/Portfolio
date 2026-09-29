import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { GEAR } from "@/data/gear";
import { ArrowUpRight } from "lucide-react";

export default function GearPage() {
  // Group gear by category
  const grouped = GEAR.reduce<Record<string, typeof GEAR>>((acc, item) => {
    const cat = item.category || "OTHER";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  return (
    <div className="animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold mb-3">gear</h1>
      <p className="text-muted mb-12 max-w-xl">
        The hardware and tools I use to build, create, and stay productive &mdash; my desk setup, everyday carry, and the software I rely on.
      </p>

      <div className="flex flex-col gap-12">
        {Object.entries(grouped).map(([category, items], gi) => (
          <ScrollReveal key={category} delay={gi * 0.08}>
            <div>
              <h2 className="text-[12px] font-mono uppercase tracking-widest text-muted mb-6">
                {category}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item) => (
                  <div
                    key={item.name}
                    className="group flex flex-col p-5 rounded-xl border border-border bg-card hover:bg-card-hover hover:border-muted/30 transition-all duration-200 hover:-translate-y-1"
                  >
                    {/* Placeholder image area */}
                    <div className="w-full aspect-[4/3] rounded-lg bg-bg border border-border/50 flex items-center justify-center text-muted text-[11px] font-mono mb-4">
                      photo
                    </div>
                    <h3 className="font-semibold text-[14px] mb-0.5 break-words">{item.name}</h3>
                    <p className="text-[12px] text-muted leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}
