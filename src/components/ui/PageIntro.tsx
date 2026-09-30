import { ReactNode } from "react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

interface PageIntroProps {
  title: string;
  description: ReactNode;
}

export function PageIntro({ title, description }: PageIntroProps) {
  return (
    <ScrollReveal className="page-intro">
      <header className="mb-12">
        <span className="page-kicker">
          <span aria-hidden="true" className="page-kicker-mark" />
          Dan Jeshua / {title}
        </span>
        <h1 className="text-3xl md:text-4xl font-bold mb-3">{title}</h1>
        <p className="text-muted max-w-xl">{description}</p>
      </header>
    </ScrollReveal>
  );
}
