"use client";

import Link from "next/link";
import { motion } from "motion/react";
import CountdownTimer from "./CountdownTimer";
import { statusLabel, statusTone } from "../lib/labels";
import { formatEur } from "../lib/format";

// ETALONAS. Kiekviena nauja kortelė projekte turi atrodyti pagal šitą:
//  - .chunky rėmelis + offset šešėlis (NE soft shadow);
//  - kaina = didžiausias, drąsiausias elementas (font-display, dominuoja);
//  - badge spalva semantinė (statusTone), ne pilka;
//  - gyvas countdown vietoj statinės datos;
//  - hover = kortelė pakyla į šešėlį (žaismė), ne tik opacity.

export type Lot = {
  id: number | string;
  slug: string;
  title: string;
  category: string;
  subcategory?: string;
  location: string;
  status: string;
  currentPrice: number;
  bidsCount: number;
  endsAt: string | null;
  imageUrl: string;
};

export default function LotCard({ lot }: { lot: Lot }) {
  const tone = statusTone(lot.status);

  return (
    <motion.div
      initial={{ boxShadow: "5px 5px 0 var(--color-ink)" }}
      whileHover={{
        x: -3,
        y: -3,
        boxShadow: "8px 8px 0 var(--color-ink)",
      }}
      whileTap={{ x: 1, y: 1, boxShadow: "3px 3px 0 var(--color-ink)" }}
      transition={{ type: "spring", stiffness: 600, damping: 30 }}
      className="group flex h-full flex-col overflow-hidden rounded-chunk border-[2.5px] border-ink bg-paper"
    >
      <Link href={`/auction/?slug=${encodeURIComponent(lot.slug)}`} className="flex h-full flex-col">
        {/* Media */}
        <div className="relative aspect-4/3 overflow-hidden border-b-[2.5px] border-ink bg-sand">
          <img
            src={lot.imageUrl || "/placeholder.svg"}
            alt={lot.title}
            loading="lazy"
            onError={(e) => {
              const img = e.currentTarget;
              if (!img.src.endsWith("/placeholder.svg")) img.src = "/placeholder.svg";
            }}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
          <span
            className={`absolute left-3 top-3 rounded-sm border-2 border-ink px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${tone.bg} ${tone.text}`}
          >
            {statusLabel(lot.status)}
          </span>
          {lot.endsAt ? (
            <CountdownTimer
              endsAt={lot.endsAt}
              className="absolute right-3 top-3 rounded-sm border-2 border-ink px-2 py-1 text-[13px]"
            />
          ) : null}
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col p-4">
          <h3 className="font-display text-[17px] font-bold leading-tight tracking-tight">
            {lot.title}
          </h3>
          <p className="mt-0.5 text-[12.5px] font-medium text-muted">
            {lot.category} · {lot.location}
          </p>

          <div className="mt-auto flex items-end justify-between gap-3 pt-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                Dabartinė kaina
              </p>
              <p className="font-display text-[26px] font-extrabold leading-none tracking-tight">
                {formatEur(lot.currentPrice)}
              </p>
            </div>
            <span className="shrink-0 text-[12px] font-semibold text-muted">
              ↑ <b className="text-ink">{lot.bidsCount}</b> stat.
            </span>
          </div>

          {/* CTA — „čiumpamas" žalias mygtukas */}
          <span className="press mt-4 flex items-center justify-center gap-2 rounded-[5px] border-[2.5px] border-ink bg-green py-2.5 font-display text-[14px] font-bold text-white shadow-chunky-sm">
            STATYTI
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
