import React from "react";

interface SectionTitleProps {
  number?: string;
  title: string;
  action?: React.ReactNode;
}

export function SectionTitle({ number, title, action }: SectionTitleProps) {
  return (
    <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
      <div className="flex items-center gap-3">
        {number && <span className="font-mono text-sm text-muted">{number} —</span>}
        <h2 className="text-xl font-display font-semibold tracking-tight">{title}</h2>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
