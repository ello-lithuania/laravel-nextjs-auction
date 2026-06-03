"use client";

import { motion } from "motion/react";

// Žaismingi „plūduriuojantys" chunky figūros fone. Lėtai juda/sukasi.
// Dekoratyvu, pointer-events-none, už turinio. reducedMotion gerbiamas
// globaliai (MotionConfig) — tada figūros tiesiog stovi vietoje.

type Shape = {
  className: string;
  shape: "circle" | "square";
  anim: { y?: number[]; x?: number[]; rotate?: number[] };
  duration: number;
};

const SHAPES: Shape[] = [
  {
    className: "left-[-32px] top-16 h-24 w-24 bg-green",
    shape: "circle",
    anim: { y: [0, -22, 0], x: [0, 12, 0] },
    duration: 9,
  },
  {
    className: "right-[8%] top-10 h-16 w-16 bg-gold",
    shape: "square",
    anim: { y: [0, 20, 0], rotate: [12, -8, 12] },
    duration: 11,
  },
  {
    className: "right-[-28px] bottom-12 h-28 w-28 bg-red",
    shape: "circle",
    anim: { y: [0, -18, 0], x: [0, -14, 0] },
    duration: 13,
  },
  {
    className: "left-[14%] bottom-[-26px] h-14 w-14 bg-ink",
    shape: "square",
    anim: { y: [0, -16, 0], rotate: [-6, 10, -6] },
    duration: 10,
  },
  {
    className: "left-[44%] top-6 h-10 w-10 bg-gold",
    shape: "circle",
    anim: { y: [0, 16, 0] },
    duration: 8,
  },
];

export default function BackgroundShapes() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {SHAPES.map((s, i) => (
        <motion.div
          key={i}
          className={`absolute border-[2.5px] border-ink opacity-80 ${
            s.shape === "circle" ? "rounded-full" : "rounded-md"
          } ${s.className}`}
          animate={s.anim}
          transition={{
            duration: s.duration,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
