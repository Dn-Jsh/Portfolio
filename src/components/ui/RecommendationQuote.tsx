import { RECOMMENDATIONS } from "@/data/recommendations";

type Recommendation = (typeof RECOMMENDATIONS)[number];

export function RecommendationQuote({ rec }: { rec: Recommendation }) {
  return (
    <blockquote className="recommendation-quote flex h-full flex-col pt-5">
      <span aria-hidden="true" className="font-serif text-4xl leading-none text-accent">“</span>
      <p className="mt-2 flex-1 text-[14px] leading-[1.8] text-fg/85">{rec.quote}</p>
      <footer className="mt-6">
        <cite className="block not-italic text-[13px] font-semibold">{rec.name}</cite>
        <span className="mt-1 block text-[11px] leading-relaxed text-muted">{rec.role}</span>
      </footer>
    </blockquote>
  );
}
