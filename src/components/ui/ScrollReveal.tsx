"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ReactNode } from "react";

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
  const offset =
    direction === "left"
      ? { x: -22, y: 0, scale: 1 }
      : direction === "right"
        ? { x: 22, y: 0, scale: 1 }
        : direction === "scale"
          ? { x: 0, y: 8, scale: 0.96 }
          : { x: 0, y: 22, scale: 0.985 };

  return (
    <motion.div
      className={className}
      data-motion-reveal
      initial={
        prefersReducedMotion
          ? false
          : { opacity: 0, ...offset, filter: "blur(7px)" }
      }
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.12, margin: "0px 0px -36px 0px" }}
      transition={{
        duration: prefersReducedMotion ? 0 : 0.72,
        delay: prefersReducedMotion ? 0 : Math.min(Math.max(delay, 0), 0.32),
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
