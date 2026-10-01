import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { PageIntro } from "@/components/ui/PageIntro";
import { CERTIFICATIONS } from "@/data/certifications";
import { CertificationItem } from "@/components/ui/CertificationItem";
import { getPublishedItems, getPageIntro } from "@/lib/portfolio-content";
import { getPublicPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata = getPublicPageMetadata("/certifications");

export default async function CertificationsPage() {
  const [rows, intro] = await Promise.all([
    getPublishedItems<typeof CERTIFICATIONS[number]>("certification", CERTIFICATIONS),
    getPageIntro("certifications", { title: "certifications", description: "Credentials across cloud, engineering, and development — each verifiable at its source." }),
  ]);
  const certifications = rows.map((row) => row.data);
  // Group certifications by category
  const grouped = certifications.reduce<Record<string, typeof certifications>>((acc, cert) => {
    const cat = cert.category || "OTHER";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(cert);
    return acc;
  }, {});

  return (
    <div className="page-enter">
      <PageIntro
        title={intro.title}
        description={intro.description}
      />

      <div className="flex flex-col gap-12">
        {Object.entries(grouped).map(([category, certs], gi) => (
          <ScrollReveal key={category} delay={gi * 0.08}>
            <div>
              <h2 className="text-[12px] font-mono uppercase tracking-widest text-muted mb-6">
                {category}
              </h2>
              <div className="certification-grid">
                {certs.map((cert) => (
                  <CertificationItem key={cert.title} cert={cert} />
                ))}
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}
