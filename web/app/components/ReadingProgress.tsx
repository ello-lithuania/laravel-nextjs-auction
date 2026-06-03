"use client";

import { useEffect, useState } from "react";

// Skaitymo progreso juosta straipsnio viršuje. Žaisminga, bet diskretiška.
// Virš header'io (z-50). Gerbia prefers-reduced-motion per globals.css.
export default function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      setProgress(max > 0 ? Math.min(100, (el.scrollTop / max) * 100) : 0);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div className="fixed inset-x-0 top-0 z-50 h-1.5" aria-hidden>
      <div
        className="h-full bg-green transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
