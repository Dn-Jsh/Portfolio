import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { CERTIFICATIONS } from "@/data/certifications";
import { ArrowUpRight } from "lucide-react";

export default function CertificationsPage() {
  // Group certifications by category
  const grouped = CERTIFICATIONS.reduce<Record<string, typeof CERTIFICATIONS>>((acc, cert) => {
    const cat = cert.category || "OTHER";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(cert);
    return acc;
  }, {});

  return (
    <div className="animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold mb-3">certifications</h1>
      <p className="text-muted mb-12 max-w-xl">
        Credentials across cloud, engineering, and development &mdash; each verifiable at its source.
      </p>

      <div className="flex flex-col gap-12">
        {Object.entries(grouped).map(([category, certs], gi) => (
          <ScrollReveal key={category} delay={gi * 0.08}>
            <div>
              <h2 className="text-[12px] font-mono uppercase tracking-widest text-muted mb-6">
                {category}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {certs.map((cert) => (
                  <a
                    key={cert.title}
                    href={cert.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col items-center text-center p-6 rounded-xl border border-border bg-card hover:bg-card-hover hover:border-muted/30 transition-all duration-200 hover:-translate-y-1"
                  >
                    <div className="w-10 h-10 rounded-full bg-bg border border-border flex items-center justify-center text-[11px] font-bold text-muted mb-4">
                      {cert.provider.slice(0, 2).toUpperCase()}
                    </div>
                    <h3 className="font-semibold text-[14px] leading-snug mb-1 break-words">
                      {cert.title}
                    </h3>
                    <p className="text-[12px] text-muted mb-4">{cert.provider}</p>
                    <span className="text-[11px] font-mono text-muted flex items-center gap-1 mt-auto">
                      VERIFY <ArrowUpRight size={11} />
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}
