"use client";

import { motion } from "motion/react";
import { formatEur } from "../lib/format";

// Laimėjimo ekranas — kai aukcionas baigėsi ir tu esi aukščiausias siūlytojas.
// Confetti paleidžiamas iškvietėjo (AuctionDetailClient) per fireWinConfetti.
export default function WinModal({
  title,
  price,
  sellerName,
  onClose,
}: {
  title: string;
  price: number;
  sellerName: string;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-5"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, y: 20, rotate: -2 }}
        animate={{ scale: 1, y: 0, rotate: -1.5 }}
        transition={{ type: "spring", stiffness: 260, damping: 16 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-chunk border-[3px] border-ink bg-cream p-7 text-center shadow-chunky-lg"
      >
        <div className="text-6xl">🏆</div>
        <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight">TU LAIMĖJAI!</h2>
        <p className="mt-2 text-muted">
          Sveikiname! Laimėjai aukcioną <b className="text-ink">„{title}“</b> už
        </p>
        <p className="mt-1 font-display text-4xl font-extrabold text-green-deep">{formatEur(price)}</p>

        <div className="mt-5 rounded-md border-2 border-ink bg-paper p-4 text-left text-sm">
          <p className="font-bold">Kas toliau?</p>
          <p className="mt-1 text-muted">
            Susisiek su pardavėju <b className="text-ink">{sellerName}</b> dėl atsiskaitymo ir
            pristatymo. Sėkmingo sandorio! 🤝
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="press mt-5 w-full rounded-md border-[2.5px] border-ink bg-green py-3 font-display text-base font-bold text-white shadow-chunky"
        >
          Puiku! 🎉
        </button>
      </motion.div>
    </motion.div>
  );
}
