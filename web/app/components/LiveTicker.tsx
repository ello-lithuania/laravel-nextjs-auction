"use client";

import { formatEur } from "../lib/format";

// „Live" statymų juosta — bėganti virtinė pranešimų apie statymus.
// Social proof + konkurencija + judesys = azartas. Kol nėra realaus srauto,
// sukam iš turimų prekių (vardas + kaina). Vėliau galima pakeisti realiu feed'u.

type Item = { name: string; title: string; price: number };

const BIDDERS = ["Mantas", "Eglė", "Tomas", "Rūta", "Dovydas", "Aistė", "Lukas", "Greta"];

export default function LiveTicker({
  lots,
}: {
  lots: { title: string; currentPrice: number }[];
}) {
  const items: Item[] = lots.slice(0, 8).map((l, i) => ({
    name: BIDDERS[i % BIDDERS.length],
    title: l.title,
    price: l.currentPrice,
  }));
  if (items.length === 0) return null;

  // Dubliuojam sąrašą, kad marquee suktųsi be siūlės (-50%).
  const loop = [...items, ...items];

  return (
    <div className="overflow-hidden border-y-[2.5px] border-ink bg-ink py-2.5 text-cream">
      <div className="flex w-max animate-marquee gap-8 whitespace-nowrap will-change-transform">
        {loop.map((it, i) => (
          <span key={i} className="flex items-center gap-2 text-sm font-semibold">
            <span className="inline-block h-2 w-2 rounded-full bg-green" />
            <b className="font-display text-gold">{it.name}</b>
            pastatė
            <b className="font-display">{formatEur(it.price)}</b>
            <span className="text-muted">·</span>
            <span className="text-cream/80">{it.title}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
