"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const FAQ: { q: string; a: string }[] = [
  {
    q: "Ar tikrai nemokama?",
    a: "Taip. Skelbimų paskelbimas ir dalyvavimas aukcionuose yra visiškai nemokami — jokių komisinių ar paslėptų mokesčių.",
  },
  {
    q: "Kaip vyksta atsiskaitymas laimėjus?",
    a: "Mokėjimai per platformą kol kas nevykdomi. Laimėjęs aukcioną pirkėjas tiesiogiai susitaria su pardavėju dėl apmokėjimo būdo ir pristatymo (paštomatu, kurjeriu ar atsiimant gyvai).",
  },
  {
    q: "Kaip statyti aukcione?",
    a: "Susikurk nemokamą paskyrą, pasirink prekę ir įvesk sumą, didesnę nei dabartinė kaina. Tapsi aukščiausiu siūlytoju, kol kažkas tavęs neaplenkia.",
  },
  {
    q: "Kas yra anti-snipe pratęsimas?",
    a: "Jei kažkas pastato paskutinę sekundę, aukcionas automatiškai pratęsiamas dar kelioms sekundėms. Taip visi dalyviai turi sąžiningą galimybę atsakyti, o laimi tas, kuris tikrai pasiruošęs mokėti daugiausiai.",
  },
  {
    q: "Ar saugu pirkti ir parduoti?",
    a: "Taip, jei laikaisi paprastų taisyklių: bendrauk platformoje, tikrink kitą šalį, rinkis saugų atsiskaitymą. Plačiau — mūsų naujienų skiltyje apie saugų pirkimą ir pardavimą.",
  },
  {
    q: "Kaip paskelbti savo prekę?",
    a: "Prisijunk, paspausk „Paskelbti skelbimą“, įkelk kokybiškas nuotraukas, parašyk aiškų aprašymą ir nustatyk pradinę kainą. Žema pradinė kaina pritraukia daugiau statytojų.",
  },
];

export default function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="space-y-3">
        {FAQ.map((f, i) => {
          const isOpen = open === i;
          return (
            <div key={i} className="overflow-hidden rounded-chunk border-[2.5px] border-ink bg-paper shadow-chunky-sm">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span className="font-display text-[17px] font-bold">{f.q}</span>
                <span className={`shrink-0 font-display text-2xl transition-transform ${isOpen ? "rotate-45" : ""}`}>
                  +
                </span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen ? (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="overflow-hidden"
                  >
                    <p className="border-t-2 border-ink/10 px-5 py-4 text-[15px] leading-relaxed text-muted">
                      {f.a}
                    </p>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
