"use client";

import { useEffect, useRef, useState } from "react";
import { formatEur } from "../lib/format";

// Kaina, kuri „prisukama" iki naujos vertės (count-up) per ~550ms.
// Naudojama detalės puslapyje — kai pats statai arba kai kažkas tave aplenkia,
// skaičius gyvai užbėga į naują kainą (dopaminas).

export default function AnimatedPrice({
  value,
  className = "",
}: {
  value: number;
  className?: string;
}) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const from = fromRef.current;
    const to = value;
    if (from === to) return;

    const reduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setDisplay(to);
      fromRef.current = to;
      return;
    }

    const duration = 550;
    let start: number | null = null;
    const step = (t: number) => {
      if (start === null) start = t;
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setDisplay(from + (to - from) * eased);
      if (p < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        fromRef.current = to;
      }
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value]);

  return (
    <span className={`tabular-nums ${className}`}>{formatEur(Math.round(display))}</span>
  );
}
