import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { PageIntro } from "@/components/ui/PageIntro";
import { SOCIALS } from "@/data/socials";
import { ArrowUpRight } from "lucide-react";
import { getPublishedItems, getPageIntro } from "@/lib/portfolio-content";

export const dynamic = "force-dynamic";

export default async function SocialsPage() {
  const [socialRows, intro] = await Promise.all([
    getPublishedItems<typeof SOCIALS[number]>("social", SOCIALS),
    getPageIntro("socials", { title: "socials", description: "Where to find me across the internet." }),
  ]);
  return (
    <div className="page-enter">
      <PageIntro title={intro.title} description={intro.description} />

      <div className="flex flex-col">
        {socialRows.map(({ data: social, id }, i) => (
          <ScrollReveal key={id} delay={i * 0.06}>
            <a
              href={social.link}
              target="_blank"
              rel="noopener noreferrer"
              className="social-row group flex items-center gap-5 py-5 border-b border-border -mx-4 px-4 rounded-lg"
            >
              {/* Platform icon circle */}
              <div className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-[13px] font-bold text-muted group-hover:text-fg group-hover:border-muted/40 transition-colors shrink-0">
                {social.platform.slice(0, 2).toUpperCase()}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <h3 className="font-semibold text-[15px] group-hover:text-muted transition-colors">
                    {social.platform}
                  </h3>
                  <span className="text-[12px] font-mono text-muted break-all">
                    {social.handle}
                  </span>
                </div>
                <p className="text-[13px] text-muted mt-0.5">{social.description}</p>
              </div>

              {/* Arrow */}
              <ArrowUpRight
                size={16}
                className="text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
              />
            </a>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}
