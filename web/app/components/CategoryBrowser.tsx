"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { categories } from "../data/categories";

// Kategorijų naršyklė su parent → child struktūra. Paspaudus pagrindinę
// kategoriją, atsiveria jos subkategorijos. Pasirinkus subkategoriją —
// filtruojamas aukcionų sąrašas (per onPick).
export default function CategoryBrowser({
  onPick,
}: {
  onPick?: (category: string, subcategory?: string) => void;
}) {
  const [active, setActive] = useState<string | null>(null);
  const current = categories.find((c) => c.slug === active);

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {categories.map((c) => {
          const isActive = c.slug === active;
          return (
            <button
              key={c.slug}
              type="button"
              onClick={() => setActive(isActive ? null : c.slug)}
              className={`press flex items-center gap-3 rounded-chunk border-[2.5px] border-ink px-4 py-3 text-left shadow-chunky-sm ${
                isActive ? "bg-ink text-cream" : "bg-paper text-ink"
              }`}
            >
              <span className="text-2xl">{c.icon}</span>
              <span className="min-w-0">
                <span className="block truncate font-display text-[15px] font-bold leading-tight">
                  {c.label}
                </span>
                <span className={`text-xs font-semibold ${isActive ? "text-cream/70" : "text-muted"}`}>
                  {c.children.length} subkategorijos
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Pakategorės */}
      <AnimatePresence mode="wait">
        {current ? (
          <motion.div
            key={current.slug}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="mt-4 rounded-chunk border-[2.5px] border-ink bg-sand p-5 shadow-chunky">
              <p className="font-display text-lg font-bold">
                {current.icon} {current.label}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onPick?.(current.label, "")}
                  className="press rounded-md border-2 border-ink bg-ink px-3 py-1.5 text-sm font-bold text-cream shadow-chunky-sm"
                >
                  Visos {current.label}
                </button>
                {current.children.map((sub) => (
                  <button
                    key={sub.slug}
                    type="button"
                    onClick={() => onPick?.(current.label, sub.label)}
                    className="press rounded-md border-2 border-ink bg-paper px-3 py-1.5 text-sm font-semibold shadow-chunky-sm"
                  >
                    {sub.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
