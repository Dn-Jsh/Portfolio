import { CERTIFICATIONS } from "@/data/certifications";

type Certification = (typeof CERTIFICATIONS)[number];

function CertificationLogo({ provider }: { provider: string }) {
  if (provider.startsWith("Amazon")) {
    return (
      <svg viewBox="0 0 180 68" className="h-14 w-36" aria-hidden="true">
        <text x="9" y="42" fill="currentColor" fontFamily="Arial, sans-serif" fontSize="48" fontWeight="700" letterSpacing="-4">aws</text>
        <path d="M17 49c28 15 63 17 94 1" fill="none" stroke="#ff9900" strokeWidth="5" strokeLinecap="round" />
        <path d="m105 47 9 1-4 9" fill="none" stroke="#ff9900" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (provider.startsWith("Meta")) {
    return (
      <svg viewBox="0 0 180 68" className="h-14 w-36" aria-hidden="true">
        <path d="M10 43c3-17 10-29 19-29 12 0 22 18 31 31 8 11 14 16 23 16 11 0 17-12 17-25S94 13 83 13c-9 0-15 6-23 17L42 54" fill="none" stroke="#0866ff" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" transform="translate(0 -3) scale(.78 1)" />
        <text x="87" y="45" fill="currentColor" fontFamily="Arial, sans-serif" fontSize="31" fontWeight="600" letterSpacing="-2">Meta</text>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 210 68" className="h-14 w-44 max-w-full" aria-hidden="true">
      <text x="2" y="42" fill="currentColor" fontFamily="ui-monospace, monospace" fontSize="24" fontWeight="700" letterSpacing="-2">{`{ freeCodeCamp }`}</text>
    </svg>
  );
}

export function CertificationItem({ cert }: { cert: Certification }) {
  const content = (
    <>
      <CertificationLogo provider={cert.provider} />
      <h3 className="mt-4 text-[14px] font-semibold leading-snug">{cert.title}</h3>
      <p className="mt-1 text-[11px] uppercase tracking-wider text-muted">{cert.date} · {cert.provider}</p>
    </>
  );

  const className = "certification-item flex min-w-0 flex-col items-start py-5 pr-3";

  return cert.link === "#" ? (
    <div className={className}>{content}</div>
  ) : (
    <a href={cert.link} target="_blank" rel="noopener noreferrer" className={className}>
      {content}
    </a>
  );
}
