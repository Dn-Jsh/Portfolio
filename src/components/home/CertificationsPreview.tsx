import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { CERTIFICATIONS } from "@/data/certifications";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";

export function CertificationsPreview() {
  return (
    <section className="mb-20">
      <ScrollReveal>
        <SectionTitle
          number="04"
          title="certifications"
          action={
            <Link
              href="/certifications"
              className="text-sm font-mono flex items-center gap-1 hover:text-muted transition-colors"
            >
              ALL CERTIFICATIONS <ArrowRight size={14} />
            </Link>
          }
        />
      </ScrollReveal>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {CERTIFICATIONS.slice(0, 3).map((cert, i) => (
          <ScrollReveal key={cert.title} delay={i * 0.06}>
            <a
              href={cert.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center text-center p-6 rounded-xl border border-border hover:border-muted/40 transition-all duration-200 hover:-translate-y-1"
            >
              {/* Provider icon placeholder */}
              <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-[11px] font-bold text-muted mb-4">
                {cert.provider.slice(0, 2).toUpperCase()}
              </div>
              <h3 className="font-semibold text-[13px] leading-snug mb-1">
                {cert.title}
              </h3>
              <p className="text-[11px] text-muted uppercase tracking-wider mb-4">
                {cert.provider.split("·")[0].trim()}
              </p>
              <span className="text-[11px] font-mono text-muted flex items-center gap-1 mt-auto">
                ‹ VERIFY ›
              </span>
            </a>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
