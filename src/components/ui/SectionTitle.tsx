import React from "react";

interface SectionTitleProps {
  number?: string;
  title: string;
  action?: React.ReactNode;
}

export function SectionTitle({ number, title, action }: SectionTitleProps) {
  return (
    <div className="section-heading flex flex-wrap items-center justify-between gap-x-6 gap-y-3 mb-8 pb-4 border-b border-border">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        {number && <span className="section-number shrink-0 font-mono text-sm">{number} —</span>}
        <h2 className="text-xl font-display font-semibold tracking-tight">{title}</h2>
      </div>
      {action && <div className="motion-link max-w-full">{action}</div>}
    </div>
  );
}
