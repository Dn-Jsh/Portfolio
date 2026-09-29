import { ReactNode } from "react";
import Link from "next/link";

interface CardProps {
  children: ReactNode;
  className?: string;
  href?: string;
}

export function Card({ children, className = "", href }: CardProps) {
  const content = (
    <div
      className={`bg-card p-6 rounded-xl border border-border hover:bg-card-hover transition-all duration-300 hover:-translate-y-1 hover:shadow-sm ${className}`}
    >
      {children}
    </div>
  );

  if (href) {
    if (href.startsWith("http")) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className="block outline-none">
          {content}
        </a>
      );
    }
    return (
      <Link href={href} className="block outline-none">
        {content}
      </Link>
    );
  }

  return content;
}
