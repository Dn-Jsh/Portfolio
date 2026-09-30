import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { PageIntro } from "@/components/ui/PageIntro";
import { RECOMMENDATIONS } from "@/data/recommendations";
import { RecommendationQuote } from "@/components/ui/RecommendationQuote";
import { getPublishedItems, getPageIntro } from "@/lib/portfolio-content";

export const dynamic = "force-dynamic";

export default async function RecommendationsPage() {
  const [recommendations, intro] = await Promise.all([
    getPublishedItems<typeof RECOMMENDATIONS[number]>("recommendation", RECOMMENDATIONS),
    getPageIntro("recommendations", { title: "recommendations", description: "What leaders, teammates, and mentors say about working with me." }),
  ]);
  return (
    <div className="page-enter">
      <PageIntro title={intro.title} description={intro.description} />

      <div className="grid grid-cols-1 gap-x-10 gap-y-12 md:grid-cols-2">
        {recommendations.map(({ data: rec, id }, i) => (
          <ScrollReveal key={id} delay={i * 0.08}>
            <RecommendationQuote rec={rec} />
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}
