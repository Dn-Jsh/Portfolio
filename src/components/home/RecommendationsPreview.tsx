import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { RECOMMENDATIONS } from "@/data/recommendations";
import { RecommendationQuote } from "@/components/ui/RecommendationQuote";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getPublishedItems } from "@/lib/portfolio-content";

export async function RecommendationsPreview() {
  const recommendations = await getPublishedItems<typeof RECOMMENDATIONS[number]>("recommendation", RECOMMENDATIONS);
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

      <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2">
        {recommendations.slice(0, 3).map(({ data: rec, id }, i) => (
          <ScrollReveal key={id} delay={i * 0.06} className={i === 0 ? "sm:col-span-2" : undefined}>
            <RecommendationQuote rec={rec} />
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
