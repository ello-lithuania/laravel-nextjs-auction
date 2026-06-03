"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

// Scroll-reveal: elementas „išplaukia" pasirodydamas vaizde. once → tik kartą.
// reducedMotion gerbiamas globaliai (MotionConfig layout.tsx).

export default function Reveal({
  children,
  className,
  delay = 0,
  y = 22,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: "div" | "section" | "li";
}) {
  const MotionTag = motion[as];
  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </MotionTag>
  );
}
