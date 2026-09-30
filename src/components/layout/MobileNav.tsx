"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { NAV_GROUPS } from "@/data/navigation";
import { ThemeToggle } from "./ThemeToggle";

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();

  const toggleNav = () => setIsOpen(!isOpen);
  const closeNav = () => setIsOpen(false);

  return (
    <>
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="md:hidden sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-bg/80 backdrop-blur-md border-b border-border"
      >
        <Link href="/" className="font-semibold font-display text-[14px]" onClick={closeNav}>
          Dn_Jsh
        </Link>
        <button
          type="button"
          onClick={toggleNav}
          className="p-2 -mr-2 text-fg"
          aria-label="Toggle menu"
          aria-expanded={isOpen}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={isOpen ? "close" : "open"}
              initial={prefersReducedMotion ? false : { opacity: 0, rotate: -75, scale: 0.75 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 75, scale: 0.75 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
              className="block"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </motion.span>
          </AnimatePresence>
        </button>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="md:hidden fixed inset-0 top-[57px] z-40 bg-bg overflow-y-auto px-7 py-8 flex flex-col"
        >
          <nav className="flex flex-col gap-5 text-[16px]">
            {NAV_GROUPS.map((group, groupIndex) => (
              <motion.div
                key={groupIndex}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: prefersReducedMotion ? 0 : 0.35,
                  delay: prefersReducedMotion ? 0 : groupIndex * 0.06,
                }}
              >
                {groupIndex > 0 && (
                  <div className="h-px bg-border mb-5" />
                )}
                <div className="flex flex-col gap-4">
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
                          duration: prefersReducedMotion ? 0 : 0.3,
                          delay: prefersReducedMotion ? 0 : groupIndex * 0.05 + linkIndex * 0.025,
                        }}
                      >
                        <Link
                          href={link.href}
                          onClick={closeNav}
                          aria-current={isActive ? "page" : undefined}
                          className={`nav-link inline-flex w-fit items-center gap-3 ${
                            isActive ? "font-medium text-fg" : "text-muted hover:text-fg"
                          }`}
                        >
                          {Icon && <Icon size={18} strokeWidth={1.6} className="shrink-0" />}
                          {link.label}
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </nav>

          <div className="mt-auto pt-8 flex flex-col gap-4">
            <ThemeToggle />
            <p className="text-[12px] leading-relaxed text-muted">
              For work, collabs & everything else, reach me at
            </p>
            <a
              href="https://mail.google.com/mail/?view=cm&fs=1&to=danjeshuaf%40gmail.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[14px] text-fg hover:text-muted transition-colors"
            >
              ✉ danjeshuaf@gmail.com
            </a>
          </div>
        </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
