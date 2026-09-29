"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_GROUPS } from "@/data/navigation";
import { ThemeToggle } from "./ThemeToggle";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col fixed top-0 left-0 h-screen w-56 border-r border-border bg-bg px-7 py-8 overflow-y-auto z-50">
      {/* Logo / Name */}
      <Link
        href="/"
        className="shrink-0 font-semibold font-display text-[15px] leading-none hover:opacity-60 transition-opacity"
      >
        Dn_Jsh
      </Link>

      {/* Navigation Groups */}
      <div className="mt-9 flex flex-1 flex-col gap-4 text-[13px]">
        {NAV_GROUPS.map((group, groupIndex) => (
          <div key={groupIndex}>
            {groupIndex > 0 && (
              <div className="h-px bg-border mb-4" />
            )}
            <div className="flex flex-col gap-2.5">
              {group.links.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (pathname.startsWith(link.href) && link.href !== "/");
                const Icon = link.icon;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative inline-flex w-fit items-center gap-2.5 transition-colors ${
                      isActive
                        ? "text-fg font-medium"
                        : "text-muted hover:text-fg"
                    }`}
                  >
                    {/* Active indicator arrow */}
                    {isActive && (
                      <span className="text-muted text-[11px] mr-0.5">→</span>
                    )}
                    {Icon && (
                      <Icon
                        size={15}
                        strokeWidth={1.6}
                        className="shrink-0"
                      />
                    )}
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-6 shrink-0 flex flex-col gap-4">
        <ThemeToggle />
        <p className="text-[12px] leading-relaxed text-muted">
          For work, collabs & everything else, reach me at
        </p>
        <a
          href="mailto:hello@danjeshua.dev"
          className="inline-flex w-fit items-center gap-2 text-[13px] text-fg hover:text-muted transition-colors"
        >
          ✉ hello@danjeshua.dev
        </a>
      </div>
    </aside>
  );
}
