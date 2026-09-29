import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SOCIALS } from "@/data/socials";
import { ArrowUpRight } from "lucide-react";

export default function SocialsPage() {
  return (
    <div className="animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold mb-3">socials</h1>
      <p className="text-muted mb-12 max-w-xl">
        Where to find me across the internet.
      </p>

      <div className="flex flex-col">
        {SOCIALS.map((social, i) => (
          <ScrollReveal key={social.platform} delay={i * 0.06}>
            <a
              href={social.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-5 py-5 border-b border-border hover:bg-card/50 -mx-4 px-4 rounded-lg transition-colors"
            >
              {/* Platform icon circle */}
              <div className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-[13px] font-bold text-muted group-hover:text-fg group-hover:border-muted/40 transition-colors shrink-0">
                {social.platform.slice(0, 2).toUpperCase()}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-[15px] group-hover:text-muted transition-colors">
                    {social.platform}
                  </h3>
                  <span className="text-[12px] font-mono text-muted">
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
