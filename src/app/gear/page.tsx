import { GearViewer } from "@/components/gear/GearViewer";
import { PageIntro } from "@/components/ui/PageIntro";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { GEAR, type GearItem } from "@/data/gear";
import { getPublishedItems, getPageIntro } from "@/lib/portfolio-content";

export const dynamic = "force-dynamic";

function GearShowcase({ item, number, total, featured = false }: {
  item: GearItem;
  number: number;
  total: number;
  featured?: boolean;
}) {
  return (
    <article className={`gear-showcase ${featured ? "gear-showcase-featured" : ""}`}>
      <div className="gear-stage">
        <GearViewer item={item} featured={featured} />
      </div>
      <div className="gear-details">
        <span className="gear-number">{String(number).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
        <h3 className="gear-name">{item.name}</h3>
        <p className="gear-description">{item.description}</p>
      </div>
    </article>
  );
}

function GearSection({ title, subtitle, items, offset, total }: {
  title: string;
  subtitle: string;
  items: GearItem[];
  offset: number;
  total: number;
}) {
  const [first, ...rest] = items;
  return (
    <section className="gear-section" aria-label={title}>
      <ScrollReveal>
        <div className="gear-section-heading">
          <div>
            <span className="gear-section-kicker">THE COLLECTION / {String(offset + 1).padStart(2, "0")}</span>
            <h2>{title}</h2>
          </div>
          <p>{subtitle}</p>
        </div>
      </ScrollReveal>
      {offset === 0 && first && (
        <ScrollReveal>
          <GearShowcase item={first} number={1} total={total} featured />
        </ScrollReveal>
      )}
      <div className="gear-grid">
        {(offset === 0 ? rest : items).map((item, index) => (
          <ScrollReveal key={item.name} delay={index * 0.08}>
            <GearShowcase item={item} number={offset + (offset === 0 ? index + 2 : index + 1)} total={total} />
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}

export default async function GearPage() {
  const [rows, intro] = await Promise.all([
    getPublishedItems<GearItem>("gear", GEAR),
    getPageIntro("gear", { title: "gear", description: "The five devices I use every day. Explore the details, from my desk to my everyday carry." }),
  ]);
  const gear = rows.map(({ data }) => data);
  const deskGear = gear.filter((item) => item.category === "DESK SETUP");
  const carryGear = gear.filter((item) => item.category === "EVERYDAY CARRY");

  return (
    <div className="page-enter">
      <PageIntro
        title={intro.title}
        description={intro.description}
      />
      <div className="gear-collection">
        <GearSection title="Desk setup" subtitle="The tools at my workspace." items={deskGear} offset={0} total={gear.length} />
        <GearSection title="Everyday carry" subtitle="The essentials that go everywhere with me." items={carryGear} offset={deskGear.length} total={gear.length} />
      </div>
    </div>
  );
}
