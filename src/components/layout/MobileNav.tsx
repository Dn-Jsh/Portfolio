"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { NAV_GROUPS } from "@/data/navigation";
import { ThemeToggle } from "./ThemeToggle";

export function MobileNav() {
  const pathname = usePathname();
  // Remount on navigation, including browser back/forward, to close the menu.
  return <MobileNavContent key={pathname} pathname={pathname} />;
}

function MobileNavContent({ pathname }: { pathname: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const closeNav = () => setIsOpen(false);

  useEffect(() => {
    if (!isOpen) return;
    const dialog = dialogRef.current;
    if (!dialog) return;

    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";

    const desktopQuery = window.matchMedia("(min-width: 64rem)");
    const closeOnDesktop = () => {
      if (desktopQuery.matches) setIsOpen(false);
    };
    closeOnDesktop();
    desktopQuery.addEventListener("change", closeOnDesktop);

    return () => {
      desktopQuery.removeEventListener("change", closeOnDesktop);
      dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  return (
    <>
      <header className="mobile-nav-header lg:hidden sticky top-0 z-50 flex items-center justify-between bg-bg border-b border-border">
        <Link href="/" className="inline-flex min-h-11 items-center font-semibold font-display text-[14px]">Dn_Jsh</Link>
        <button type="button" onClick={() => setIsOpen(true)} className="inline-flex h-11 w-11 items-center justify-center text-fg" aria-label="Open menu" aria-expanded={isOpen} aria-controls="mobile-navigation" aria-haspopup="dialog">
          <Menu size={20} aria-hidden="true" />
        </button>
      </header>

      <dialog ref={dialogRef} id="mobile-navigation" className="mobile-nav-dialog" aria-label="Site navigation" onCancel={(event) => { event.preventDefault(); closeNav(); }} onClose={closeNav}>
        <div className="mobile-nav-header flex shrink-0 items-center justify-between border-b border-border">
          <Link href="/" onClick={closeNav} className="inline-flex min-h-11 items-center font-semibold font-display text-[14px]">Dn_Jsh</Link>
          <button type="button" autoFocus onClick={closeNav} aria-label="Close menu" className="inline-flex h-11 w-11 items-center justify-center text-fg">
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <div className="mobile-nav-body flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">
          <nav aria-label="Main navigation" className="flex flex-col gap-4 text-[16px]">
            {NAV_GROUPS.map((group, groupIndex) => (
              <motion.div key={groupIndex} initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }} animate={isOpen ? { opacity: 1, y: 0 } : undefined} transition={{ duration: prefersReducedMotion ? 0 : 0.3, delay: prefersReducedMotion ? 0 : groupIndex * 0.04 }}>
                {groupIndex > 0 && <div className="h-px bg-border mb-4" />}
                <div className="flex flex-col gap-1">
                  {group.links.map((link) => {
                    const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== "/");
                    const Icon = link.icon;
                    return (
                      <Link key={link.href} href={link.href} onClick={closeNav} aria-current={isActive ? "page" : undefined} className={`nav-link flex min-h-11 items-center gap-3 ${isActive ? "font-medium text-fg" : "text-muted hover:text-fg"}`}>
                        {Icon && <Icon size={18} strokeWidth={1.6} className="shrink-0" aria-hidden="true" />}
                        {link.label}
                      </Link>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </nav>

          <div className="mt-auto pt-8 flex flex-col gap-3">
            <ThemeToggle />
            <p className="text-[12px] leading-relaxed text-muted">For work, collabs & everything else, reach me at</p>
            <a href="https://mail.google.com/mail/?view=cm&fs=1&to=danjeshuaf%40gmail.com" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center break-all text-[14px] text-fg hover:text-muted transition-colors">✉ danjeshuaf@gmail.com</a>
          </div>
        </div>
      </dialog>
    </>
  );
}
