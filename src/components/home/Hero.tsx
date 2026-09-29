import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SOCIALS } from "@/data/socials";
import { ArrowUpRight } from "lucide-react";

export function Hero() {
  return (
    <section className="mb-24">
      {/* ── Profile: Photo + Name + Bio ── */}
      <ScrollReveal>
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">
          <div className="w-32 h-40 sm:w-44 sm:h-56 md:w-52 md:h-64 rounded-xl overflow-hidden shrink-0 border border-border bg-bg relative">
            <img
              src="/profile-nobg.png"
              alt="Dan Jeshua"
              className="w-full h-full object-cover object-[50%_95%] scale-[1.6] grayscale contrast-[1.2] brightness-90 hover:grayscale-0 hover:contrast-100 transition-all duration-500"
            />
          </div>

          {/* Name + Bio */}
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-6">
              Dan Jeshua
            </h1>

            <p className="text-[15px] text-fg/70 leading-relaxed mb-4 max-w-md">
              I&apos;m a full-stack developer and 4th-year BSIT student at PUP. I build modern web &amp; mobile apps, and these days I&apos;m focused on shipping real products.
            </p>

            <p className="text-[15px] text-fg/70 leading-relaxed mb-8 max-w-md">
              Right now I&apos;m freelancing, sharpening my craft, and working toward landing a dev role and building my own startup.
            </p>

            {/* Social links */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[14px]">
              {SOCIALS.slice(0, 5).map((social) => (
                <a
                  key={social.platform}
                  href={social.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted hover:text-fg transition-colors flex items-center gap-1"
                >
                  {social.platform.toLowerCase()}
                  <ArrowUpRight size={13} className="opacity-60" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* ── Stats row ── */}
      <ScrollReveal delay={0.12}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-4 mt-12 pt-8 border-t border-border">
          <div>
            <div className="text-2xl md:text-3xl font-bold tracking-tight">
              10+
            </div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-muted mt-1 block">
              Projects Shipped
            </span>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-bold tracking-tight">
              3+ yrs
            </div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-muted mt-1 block">
              Building
            </span>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-bold tracking-tight">
              4th yr
            </div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-muted mt-1 block">
              BSIT · PUP
            </span>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
