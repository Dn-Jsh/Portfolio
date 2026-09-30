import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { ArrowUpRight } from "lucide-react";
import type { CSSProperties } from "react";

export function GitHubPreview() {
  return (
    <section className="mb-12">
      <ScrollReveal>
        <SectionTitle
          number="06"
          title="github"
          action={
            <a
              href="https://github.com/Dn-Jsh"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-mono flex items-center gap-1 hover:text-muted transition-colors"
            >
              @DN-JSH <ArrowUpRight size={14} />
            </a>
          }
        />
      </ScrollReveal>

      <ScrollReveal delay={0.08}>
        {/* GitHub contribution graph placeholder */}
        <div className="w-full overflow-hidden rounded-xl border border-border p-6">
          <div className="flex flex-wrap gap-[3px]">
            {Array.from({ length: 52 * 7 }).map((_, i) => {
              // Generate random-ish contribution levels for visual effect
              const seed = (i * 17 + 31) % 100;
              const level =
                seed < 40
                  ? 0
                  : seed < 60
                    ? 1
                    : seed < 78
                      ? 2
                      : seed < 90
                        ? 3
                        : 4;
              const opacities = [
                "opacity-[0.06]",
                "opacity-[0.2]",
                "opacity-[0.35]",
                "opacity-[0.55]",
                "opacity-[0.85]",
              ];

              const cellDelay = ((i % 52) * 8 + Math.floor(i / 52) * 12) % 520;

              return (
                <div
                  key={i}
                  className={`contribution-dot w-[10px] h-[10px] rounded-[2px] bg-fg ${opacities[level]}`}
                  style={{ "--cell-delay": `${cellDelay}ms` } as CSSProperties}
                />
              );
            })}
          </div>

          <p className="text-[12px] font-mono text-muted mt-4">
            Contributions in the last year
          </p>
        </div>
      </ScrollReveal>
    </section>
  );
}
