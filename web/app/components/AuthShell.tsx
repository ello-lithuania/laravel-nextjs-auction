"use client";

import Link from "next/link";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import BackgroundShapes from "./BackgroundShapes";

// Bendros lauko/mygtuko klasės — kad visos formos atrodytų vienodai chunky.
export const inputClass =
  "w-full rounded-md border-[2.5px] border-ink bg-paper px-4 py-2.5 font-medium outline-none transition focus:shadow-chunky-sm";
export const labelClass = "block text-sm font-bold";
export const primaryBtnClass =
  "press w-full rounded-md border-[2.5px] border-ink bg-green py-3 font-display text-base font-bold text-white shadow-chunky disabled:cursor-not-allowed disabled:border-muted disabled:bg-muted disabled:shadow-none";

export default function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-cream px-5 py-12">
      <BackgroundShapes />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 22 }}
        className="relative w-full max-w-md"
      >
        <Link href="/" className="mb-6 flex items-center justify-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-md border-[2.5px] border-ink bg-green text-lg font-extrabold text-white shadow-chunky-sm">
            D
          </span>
          <span className="font-display text-xl font-extrabold tracking-tight">
            DEKAUKCIONA<span className="text-green-deep">.lt</span>
          </span>
        </Link>
        <div className="chunky-lg rounded-chunk p-7">
          <h1 className="font-display text-3xl font-extrabold tracking-tight">{title}</h1>
          {subtitle ? <p className="mt-1.5 text-[15px] text-muted">{subtitle}</p> : null}
          <div className="mt-6">{children}</div>
        </div>
      </motion.div>
    </main>
  );
}
