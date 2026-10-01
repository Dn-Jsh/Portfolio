"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { NAV_GROUPS } from "@/data/navigation";
import { ThemeToggle } from "./ThemeToggle";

export function Sidebar() {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.aside
      initial={prefersReducedMotion ? false : { opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.65, ease: [0.22, 1, 0.36, 1] }}
      className="hidden lg:flex flex-col fixed top-0 left-0 h-dvh w-56 border-r border-border bg-bg px-6 py-8 overflow-y-auto z-50"
    >
      {/* Logo / Name */}
      <Link
        href="/"
        className="nav-link shrink-0 font-semibold font-display text-[15px] leading-none hover:text-accent"
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
              {group.links.map((link, linkIndex) => {
                const isActive =
                  pathname === link.href ||
                  (pathname.startsWith(link.href) && link.href !== "/");
                const Icon = link.icon;

                return (
                  <motion.div
                    key={link.href}
                    initial={prefersReducedMotion ? false : { opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: prefersReducedMotion ? 0 : 0.38,
                      delay: prefersReducedMotion ? 0 : 0.12 + groupIndex * 0.04 + linkIndex * 0.035,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <Link
                      href={link.href}
                      aria-current={isActive ? "page" : undefined}
                      className={`nav-link relative inline-flex min-h-8 items-center gap-2.5 ${
                        isActive ? "text-fg font-medium" : "text-muted hover:text-fg"
                      }`}
                    >
                      {isActive && (
                        <motion.span
                          aria-hidden="true"
                          layoutId="sidebar-active-nav"
                          className="nav-active-indicator"
                          transition={{ type: "spring", stiffness: 420, damping: 34 }}
                        />
                      )}
                      {Icon && <Icon size={15} strokeWidth={1.6} className="shrink-0" />}
                      {link.label}
                    </Link>
                  </motion.div>
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
          href="https://mail.google.com/mail/?view=cm&fs=1&to=danjeshuaf%40gmail.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-2 break-all text-[12px] text-fg hover:text-muted transition-colors"
        >
          ✉ danjeshuaf@gmail.com
        </a>
      </div>
    </motion.aside>
  );
}
