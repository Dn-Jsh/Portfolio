import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { PageIntro } from "@/components/ui/PageIntro";
import { STACK } from "@/data/stack";
import { getPublishedItems, getPageIntro } from "@/lib/portfolio-content";
import { getPublicPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata = getPublicPageMetadata("/stack");

export default async function StackPage() {
  const [groups, intro] = await Promise.all([
    getPublishedItems<typeof STACK[number]>("stack_group", STACK),
    getPageIntro("stack", { title: "tech stack", description: "The tools, frameworks, and platforms I reach for — across the front end, back end, and infrastructure." }),
  ]);
  return (
    <div className="page-enter">
      <PageIntro
        title={intro.title}
        description={intro.description}
      />

      <div className="flex flex-col gap-10">
        {groups.map(({ data: group, id }, i) => (
          <ScrollReveal key={id} delay={i * 0.08}>
            <div>
              <h2 className="text-[12px] font-mono uppercase tracking-widest text-muted mb-5">
                {group.category}
              </h2>
              <div className="flex flex-wrap gap-2.5">
                {group.items.map((item) => (
                  <span
                    key={item}
                    className="tech-chip inline-flex items-center px-3.5 py-1.5 rounded-md text-[13px] font-mono border border-border bg-card text-fg cursor-default"
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
