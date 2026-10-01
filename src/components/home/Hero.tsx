import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { getPublishedItems, getSiteSettings } from "@/lib/portfolio-content";
import { SOCIALS } from "@/data/socials";
import { createProfileStructuredData, SITE_HANDLE } from "@/lib/seo";

type SiteSettings = {
  heroKicker: string;
  firstName: string;
  lastName: string;
  bioFirst: string;
  bioSecond: string;
  profileImage: string;
  stats: Array<{ value: string; label: string }>;
};

export async function Hero() {
  const [settings, socialRows] = await Promise.all([
    getSiteSettings<SiteSettings>({
      heroKicker: "Full-stack developer · BSIT / PUP",
      firstName: "Dan",
      lastName: "Jeshua",
      bioFirst: "I'm a full-stack developer and 4th-year BSIT student at PUP. I build modern web & mobile apps, and these days I'm focused on shipping real products.",
      bioSecond: "Right now I'm freelancing, sharpening my craft, and working toward landing a dev role and building my own startup.",
      profileImage: "/profile-nobg.png",
      stats: [{ value: "10+", label: "Projects Shipped" }, { value: "3+ yrs", label: "Building" }, { value: "4th yr", label: "BSIT · PUP" }],
    }),
    getPublishedItems<typeof SOCIALS[number]>("social", SOCIALS),
  ]);
  const socials = socialRows.map(({ data }) => data);
  const structuredData = createProfileStructuredData(
    `${settings.firstName} ${settings.lastName}`,
    socials.map((social) => social.link),
  );
  return (
    <section className="mb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <div>
        <div className="hero-kicker">
          <span aria-hidden="true" className="status-light" />
          {settings.heroKicker}
        </div>
      </div>

      <div>
        <div className="hero-layout">
          <div className="hero-image-frame hero-portrait rounded-xl shrink-0 relative">
            <div className="relative h-full w-full overflow-hidden rounded-[inherit] bg-bg">
              <Image
                src={settings.profileImage || "/profile-nobg.png"}
                alt={`${settings.firstName} ${settings.lastName}`}
                fill
                sizes="(max-width: 639px) 128px, (max-width: 1279px) 176px, 208px"
                fetchPriority="high"
                unoptimized
                className="hero-photo w-full h-full object-cover object-[50%_95%] scale-[1.6] grayscale contrast-[1.2] brightness-90 hover:grayscale-0 hover:contrast-100"
              />
            </div>
            <span aria-hidden="true" className="absolute bottom-3 left-3 z-[4] rounded-full border border-white/20 bg-black/55 px-2 py-1 font-mono text-[9px] tracking-widest text-white/80 backdrop-blur-sm">
              PORTRAIT / 01
            </span>
          </div>

          {/* Name + Bio */}
          <div className="min-w-0 flex-1">
            <h1 className="hero-title font-display font-bold tracking-tight mb-2 leading-tight">
              {settings.firstName} <span className="hero-name-accent">{settings.lastName}</span>
            </h1>

            <p className="text-sm font-mono text-muted mb-6">
              Also known as <span className="text-fg">{SITE_HANDLE}</span>
            </p>

            <p className="text-[15px] text-fg/70 leading-relaxed mb-4 max-w-md">
              {settings.bioFirst}
            </p>

            <p className="text-[15px] text-fg/70 leading-relaxed mb-8 max-w-md">
              {settings.bioSecond}
            </p>

            {/* Social links */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[14px]">
              {socials.slice(0, 5).map((social) => (
                <a
                  key={social.platform}
                  href={social.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hero-social-link min-h-11 text-muted flex items-center gap-1"
                >
                  {social.platform.toLowerCase()}
                  <ArrowUpRight size={13} className="opacity-60" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Profile highlights */}
      <ScrollReveal delay={0.16} direction="scale">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-4 mt-12 pt-8 border-t border-border">
          {settings.stats.map((stat, index) => (
            <div key={`${stat.label}-${index}`} className="hero-stat">
              <div className="hero-stat-value text-2xl md:text-3xl font-bold tracking-tight">{stat.value}</div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-muted mt-1 block">{stat.label}</span>
            </div>
          ))}
        </div>
      </ScrollReveal>
    </section>
  );
}
