"use client";

import { useEffect, useState } from "react";
import type { Heading } from "../lib/article";

// Turinio sąrašas su scroll-spy (aktyvi sekcija paryškinama).
// Rodomas tik kai bent 3 headingai — kitaip neverta.
export default function TableOfContents({ headings }: { headings: Heading[] }) {
  const [active, setActive] = useState<string>(headings[0]?.id ?? "");

  useEffect(() => {
    const els = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => el !== null);
    if (els.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-88px 0px -65% 0px", threshold: 0 },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 3) return null;

  return (
    <nav
      aria-label="Straipsnio turinys"
      className="rounded-chunk border-[2.5px] border-ink bg-paper p-5 shadow-chunky-sm"
    >
      <h3 className="font-display text-sm font-extrabold uppercase tracking-wide text-muted">
        Turinys
      </h3>
      <ul className="mt-3 flex flex-col gap-1 border-l-2 border-ink/10">
        {headings.map((h) => {
          const isActive = h.id === active;
          return (
            <li key={h.id}>
              <a
                href={`#${h.id}`}
                className={`-ml-0.5 block border-l-2 py-1 pl-3 text-[13px] leading-snug transition ${
                  isActive
                    ? "border-green font-bold text-ink"
                    : "border-transparent font-semibold text-muted hover:text-ink"
                }`}
              >
                {h.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
