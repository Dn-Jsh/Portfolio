"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 240,
    damping: 40,
    restDelta: 0.0005,
  });
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      aria-hidden="true"
      className="scroll-progress"
      style={{ scaleX: prefersReducedMotion ? scrollYProgress : smoothProgress }}
    />
  );
}
