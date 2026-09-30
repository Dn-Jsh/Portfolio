import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { CERTIFICATIONS } from "@/data/certifications";
import { CertificationItem } from "@/components/ui/CertificationItem";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getPublishedItems } from "@/lib/portfolio-content";

export async function CertificationsPreview() {
  const certifications = await getPublishedItems<typeof CERTIFICATIONS[number]>("certification", CERTIFICATIONS);
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

      <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-3">
        {certifications.slice(0, 3).map(({ data: cert, id }, i) => (
          <ScrollReveal key={id} delay={i * 0.06}>
            <CertificationItem cert={cert} />
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
