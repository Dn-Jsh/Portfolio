"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { NAV_GROUPS } from "@/data/navigation";
import { ThemeToggle } from "./ThemeToggle";

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleNav = () => setIsOpen(!isOpen);
  const closeNav = () => setIsOpen(false);

  return (
    <>
      <div className="md:hidden sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-bg/80 backdrop-blur-md border-b border-border">
        <Link href="/" className="font-semibold font-display text-[14px]" onClick={closeNav}>
          Dn_Jsh
        </Link>
        <button onClick={toggleNav} className="p-2 -mr-2 text-fg" aria-label="Toggle Menu">
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden fixed inset-0 top-[57px] z-40 bg-bg overflow-y-auto px-7 py-8 flex flex-col">
          <nav className="flex flex-col gap-5 text-[16px]">
            {NAV_GROUPS.map((group, groupIndex) => (
              <div key={groupIndex}>
                {groupIndex > 0 && (
                  <div className="h-px bg-border mb-5" />
                )}
                <div className="flex flex-col gap-4">
                  {group.links.map((link) => {
                    const isActive =
                      pathname === link.href ||
                      (pathname.startsWith(link.href) && link.href !== "/");
                    const Icon = link.icon;

                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={closeNav}
                        className={`inline-flex w-fit items-center gap-3 transition-colors ${
                          isActive
                            ? "font-medium text-fg"
                            : "text-muted hover:text-fg"
                        }`}
                      >
                        {Icon && (
                          <Icon size={18} strokeWidth={1.6} className="shrink-0" />
                        )}
                        {link.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="mt-auto pt-8 flex flex-col gap-4">
            <ThemeToggle />
            <p className="text-[12px] leading-relaxed text-muted">
              For work, collabs & everything else, reach me at
            </p>
            <a
              href="mailto:hello@danjeshua.dev"
              className="text-[14px] text-fg hover:text-muted transition-colors"
            >
              ✉ hello@danjeshua.dev
            </a>
          </div>
        </div>
      )}
    </>
  );
}
