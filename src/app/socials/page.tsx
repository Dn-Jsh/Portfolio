import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { PageIntro } from "@/components/ui/PageIntro";
import { SOCIALS } from "@/data/socials";
import { ArrowUpRight, Share2 } from "lucide-react";
import { getPublishedItems, getPageIntro } from "@/lib/portfolio-content";
import { InstagramQrButton } from "@/components/socials/InstagramQrButton";

export const dynamic = "force-dynamic";

function SocialPlatformIcon({ icon }: { icon: string }) {
  const className = "h-5 w-5";

  switch (icon.toLowerCase()) {
    case "github":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.56.1.76-.24.76-.54v-2.08c-3.09.67-3.74-1.31-3.74-1.31-.5-1.28-1.23-1.62-1.23-1.62-1.01-.69.08-.68.08-.68 1.12.08 1.72 1.15 1.72 1.15 1 1.7 2.6 1.21 3.23.93.1-.72.39-1.21.7-1.49-2.47-.28-5.05-1.24-5.05-5.5 0-1.22.44-2.2 1.14-2.98-.11-.28-.5-1.41.11-2.94 0 0 .93-.3 3.05 1.14a10.6 10.6 0 0 1 5.56 0c2.12-1.44 3.05-1.14 3.05-1.14.61 1.53.23 2.66.11 2.94.71.78 1.14 1.76 1.14 2.98 0 4.27-2.59 5.21-5.06 5.49.4.35.75 1.03.75 2.08v3.08c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z" />
        </svg>
      );
    case "linkedin":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.55V9h3.57v11.45ZM22.23 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.23 0Z" />
        </svg>
      );
    case "instagram":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4.1" />
          <circle cx="17.7" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </svg>
      );
    case "tiktok":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M19.6 7.2a6.1 6.1 0 0 1-4.3-4.9h-3.6v13.2a3.1 3.1 0 1 1-2.7-3.1v-3.7a6.8 6.8 0 1 0 6.3 6.8V9.1a9.6 9.6 0 0 0 5.2 1.5V7.1c-.3.1-.6.1-.9.1Z" />
        </svg>
      );
    case "facebook":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M13.5 21v-8.2h2.8l.4-3.2h-3.2v-2c0-.9.3-1.5 1.6-1.5h1.7V3.2c-.3 0-1.3-.2-2.5-.2-2.5 0-4.2 1.5-4.2 4.3v2.4H7.3v3.2h2.8V21h3.4Z" />
        </svg>
      );
    case "twitter":
    case "x":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M18.9 1.5h3.7l-8.1 9.3L24 22.5h-7.4l-5.8-7.6-6.6 7.6H.5l8.6-9.8L0 1.5h7.6l5.2 6.9 6.1-6.9Zm-1.3 18.9h2L6.5 3.5H4.3l13.3 16.9Z" />
        </svg>
      );
    default:
      return <Share2 className={className} aria-hidden="true" />;
  }
}

export default async function SocialsPage() {
  const [socialRows, intro] = await Promise.all([
    getPublishedItems<typeof SOCIALS[number]>("social", SOCIALS),
    getPageIntro("socials", { title: "socials", description: "Where to find me across the internet." }),
  ]);
  return (
    <div className="page-enter">
      <PageIntro title={intro.title} description={intro.description} />

      <div className="flex flex-col">
        {socialRows.map(({ data: social, id }, i) => (
          <ScrollReveal key={id} delay={i * 0.06}>
            <div className="social-row flex items-center gap-3 border-b border-border -mx-4 px-4 rounded-lg">
              <a
                href={social.link}
                target="_blank"
                rel="noopener noreferrer"
                className="social-profile group flex min-w-0 flex-1 items-center gap-5 py-5"
              >
                <div className="w-10 h-10 flex items-center justify-center text-muted group-hover:text-fg transition-colors shrink-0">
                  <SocialPlatformIcon icon={social.icon} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <h3 className="font-semibold text-[15px] group-hover:text-muted transition-colors">
                      {social.platform}
                    </h3>
                    <span className="text-[12px] font-mono text-muted break-all">
                      {social.handle}
                    </span>
                  </div>
                  <p className="text-[13px] text-muted mt-0.5">{social.description}</p>
                </div>

                <ArrowUpRight
                  size={16}
                  className="text-muted opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity shrink-0"
                />
              </a>
              {social.icon.toLowerCase() === "instagram" && <InstagramQrButton />}
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}
