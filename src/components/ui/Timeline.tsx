import { ReactNode } from "react";

export interface TimelineItemProps {
  date: string;
  title: string;
  subtitle?: string;
  description?: ReactNode;
}

export function Timeline({ items }: { items: TimelineItemProps[] }) {
  return (
    <div className="border-l border-border ml-3 mt-4 space-y-8">
      {items.map((item, i) => (
        <div key={i} className="relative pl-8">
          <div className="absolute left-[-5px] top-1.5 h-2.5 w-2.5 rounded-full bg-border ring-4 ring-bg" />
          <div className="flex flex-col gap-1">
            <span className="text-sm font-mono text-muted">{item.date}</span>
            <h3 className="text-lg font-semibold">{item.title}</h3>
            {item.subtitle && <span className="text-base text-muted">{item.subtitle}</span>}
            {item.description && <div className="mt-2 text-fg/90">{item.description}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
