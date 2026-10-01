"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useRef, type ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  direction?: "up" | "left" | "right" | "scale";
}

export function ScrollReveal({
  children,
  delay = 0,
  className,
  direction = "up",
}: ScrollRevealProps) {
  const prefersReducedMotion = useReducedMotion();
  const revealRef = useRef<HTMLDivElement>(null);
  const offset =
    direction === "left"
      ? { x: -16, y: 0, scale: 1 }
      : direction === "right"
        ? { x: 16, y: 0, scale: 1 }
        : direction === "scale"
          ? { x: 0, y: 6, scale: 0.98 }
          : { x: 0, y: 16, scale: 0.99 };

  return (
    <motion.div
      className={className}
      data-motion-reveal
      ref={revealRef}
      initial={
        prefersReducedMotion
          ? false
          : { opacity: 0, ...offset, filter: "blur(4px)" }
      }
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.08, margin: "0px 0px 24px 0px" }}
      onViewportEnter={() => {
        revealRef.current?.setAttribute("data-revealed", "true");
        if (!prefersReducedMotion) {
          revealRef.current?.style.setProperty("will-change", "opacity, transform, filter");
        }
      }}
      onAnimationComplete={() => revealRef.current?.style.removeProperty("will-change")}
      transition={{
        duration: prefersReducedMotion ? 0 : 0.6,
        delay: prefersReducedMotion ? 0 : Math.min(Math.max(delay, 0), 0.18),
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
