"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import SiteHeader from "./components/SiteHeader";
import SiteFooter from "./components/SiteFooter";
import Reveal from "./components/Reveal";
import BackgroundShapes from "./components/BackgroundShapes";
import LotCard, { type Lot } from "./components/LotCard";
import LiveTicker from "./components/LiveTicker";
import CountdownTimer from "./components/CountdownTimer";
import CategoryBrowser from "./components/CategoryBrowser";
import FaqSection from "./components/FaqSection";
import NewsCard from "./components/NewsCard";
import { demoAuctions } from "./data/demoAuctions";
import { categories } from "./data/categories";
import { formatEur } from "./lib/format";

// Naujienos anonsui (iš API, kaip ir aukcionai). Body čia nereikalingas.
type NewsTeaser = {
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  cover: string;
  excerpt: string;
  readMinutes: number;
  date: string;
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

const STEPS = [
  { n: "01", icon: "🔍", title: "Surask daiktą", text: "Naršyk pagal kategoriją ar miestą. Tūkstančiai daiktų, vienoje vietoje." },
  { n: "02", icon: "⚡", title: "Statyk realiu laiku", text: "Kainos kyla gyvai. Paskutinė sekundė pratęsia aukcioną — niekas nelieka už borto." },
  { n: "03", icon: "🏆", title: "Laimėk ir susitark", text: "Laimėjai? Susisiek su pardavėju dėl atsiskaitymo ir pristatymo. Be komisinių." },
];

// Demo prekėms sugeneruojam gyvus pabaigos laikus kliente (skirtingi, kad
// matytųsi ir skuba: ~1 min, ~9 min, valandos, paros).
const DEMO_OFFSETS = [55, 9 * 60, 3 * 3600, 47 * 3600, 80, 26 * 3600, 2 * 86400];

function demoToLots(base: number | null): Lot[] {
  return demoAuctions.map((a, i) => ({
    id: a.id,
    slug: a.slug,
    title: a.title,
    category: a.category,
    location: a.location,
    status: a.status,
    currentPrice: a.current_price,
    bidsCount: a.bids_count,
    endsAt:
      base === null
        ? null
        : new Date(base + DEMO_OFFSETS[i % DEMO_OFFSETS.length] * 1000).toISOString(),
    imageUrl: a.imageUrl,
  }));
}

function mapApiToLots(data: unknown[]): Lot[] {
  return data.map((raw, i) => {
    const a = raw as Record<string, unknown>;
    return {
      id: (a.id as number) ?? i,
      slug: (a.slug as string) ?? String(a.id ?? i),
      title: a.title as string,
      category: a.category as string,
      subcategory: (a.subcategory as string) ?? undefined,
      location: a.location as string,
      status: a.status as string,
      currentPrice: Number(a.current_price ?? 0),
      bidsCount: Number(a.bids_count ?? 0),
      endsAt: (a.ends_at as string) ?? null,
      imageUrl:
        (a.image_url as string) ??
        (Array.isArray(a.gallery) ? (a.gallery[0] as string) ?? "" : ""),
    };
  });
}

export default function Home() {
  // Static export: pradedam nuo demo (be laikų), o kliente įjungiam gyvus
  // countdownus ir bandom paimti tikrus aukcionus iš Laravel API.
  const [lots, setLots] = useState<Lot[]>(() => demoToLots(null));
  const [category, setCategory] = useState("Visi");
  const [subcategory, setSubcategory] = useState("");
  const [city, setCity] = useState("Visi miestai");
  const [query, setQuery] = useState("");
  const [news, setNews] = useState<NewsTeaser[]>([]);

  useEffect(() => {
    let active = true;
    // 1) demo su gyvais laikais — kad countdown veiktų net be API.
    setLots(demoToLots(Date.now()));
    // 2) tikri aukcionai, jei API atsako.
    fetch(`${apiBaseUrl}/api/auctions`, { headers: { Accept: "application/json" } })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("API"))))
      .then((data) => {
        if (active && Array.isArray(data) && data.length > 0) {
          setLots(mapApiToLots(data));
        }
      })
      .catch(() => {
        /* paliekam demo */
      });
    // 3) naujausios naujienos anonsui.
    fetch(`${apiBaseUrl}/api/posts`, { headers: { Accept: "application/json" } })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("API"))))
      .then((data) => {
        if (!active || !Array.isArray(data)) return;
        setNews(
          data.slice(0, 3).map((p: Record<string, unknown>) => ({
            slug: p.slug as string,
            title: p.title as string,
            description: (p.description as string) ?? "",
            keywords: Array.isArray(p.keywords) ? (p.keywords as string[]) : [],
            cover: (p.cover as string) ?? "",
            excerpt: (p.excerpt as string) ?? "",
            readMinutes: Number(p.read_minutes ?? 5),
            date: (p.published_at as string) ?? "",
          })),
        );
      })
      .catch(() => {
        /* naujienų nerodom, jei API neatsako */
      });
    return () => {
      active = false;
    };
  }, []);

  const cities = useMemo(
    () => Array.from(new Set(lots.map((l) => l.location))).sort((a, b) => a.localeCompare(b, "lt")),
    [lots],
  );

  // Kategorijų pills rodom tik tas, kurios realiai turi skelbimų (+ „Visi").
  const categoryPills = useMemo(() => {
    const present = Array.from(new Set(lots.map((l) => l.category)));
    return [
      { label: "Visi", icon: "✺" },
      ...present.map((label) => ({
        label,
        icon: categories.find((c) => c.label === label)?.icon ?? "🏷️",
      })),
    ];
  }, [lots]);

  const filtered = useMemo(
    () =>
      lots.filter(
        (l) =>
          (category === "Visi" || l.category === category) &&
          (subcategory === "" || l.subcategory === subcategory) &&
          (city === "Visi miestai" || l.location === city) &&
          (query.trim() === "" || l.title.toLowerCase().includes(query.trim().toLowerCase())),
      ),
    [lots, category, subcategory, city, query],
  );

  // Pasirinkti kategoriją (iš pills ar naršyklės) ir nuslinkti prie sąrašo.
  const pickCategory = (cat: string, sub = "") => {
    setCategory(cat);
    setSubcategory(sub);
    document.getElementById("aukcionai")?.scrollIntoView({ behavior: "smooth" });
  };

  const totalBids = useMemo(() => lots.reduce((s, l) => s + l.bidsCount, 0), [lots]);
  const featured = lots[0];
  // „Jums gali būti įdomu" — keturios kitos prekės (ne tos pačios kaip viršuje).
  const recommended = useMemo(
    () => (lots.length >= 8 ? lots.slice(4, 8) : lots.slice(0, 4)),
    [lots],
  );

  return (
    <main className="flex flex-col">
      <SiteHeader />

      {/* ============================ HERO ============================ */}
      <section
        className="relative overflow-hidden border-b-[2.5px] border-ink"
        style={{
          backgroundImage:
            "radial-gradient(var(--color-ink) 1.1px, transparent 1.1px)",
          backgroundSize: "22px 22px",
          backgroundPosition: "-11px -11px",
        }}
      >
        <div className="pointer-events-none absolute inset-0 bg-cream/60" />
        <BackgroundShapes />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-20">
          {/* Kairė — žinutė */}
          <div>
            <span className="inline-flex items-center gap-2 rounded-[5px] border-2 border-ink bg-gold px-3 py-1.5 text-[13px] font-bold shadow-chunky-sm">
              🔥 Nemokama platforma · be komisinių
            </span>
            <h1 className="mt-5 font-display text-[44px] font-extrabold leading-[0.98] tracking-tight sm:text-6xl">
              Statyk. <span className="text-green-deep">Laimėk.</span>
              <br />
              Pasiimk.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
              Aukcionai, kuriuose smagu dalyvauti. Statyk realiu laiku, jausk azartą,
              laimėk tikrus daiktus — laikrodžius, automobilius, meną ir kolekcijas.
              Paskelbti ir dalyvauti <b className="text-ink">visiškai nemokama</b>.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href="/skelbti"
                className="press rounded-md border-[2.5px] border-ink bg-green px-6 py-3 font-display text-base font-bold text-white shadow-chunky"
              >
                Paskelbti skelbimą
              </Link>
              <a
                href="#aukcionai"
                className="press rounded-md border-[2.5px] border-ink bg-paper px-6 py-3 font-display text-base font-bold text-ink shadow-chunky"
              >
                Naršyti aukcionus →
              </a>
            </div>
            {/* Statistika */}
            <div className="mt-9 grid max-w-md grid-cols-3 gap-3">
              {[
                { v: `${lots.length}`, l: "aukcionai" },
                { v: `${totalBids}`, l: "statymai" },
                { v: "0 %", l: "komisiniai" },
              ].map((s) => (
                <div key={s.l} className="rounded-md border-2 border-ink bg-paper px-3 py-2.5 text-center">
                  <p className="font-display text-2xl font-extrabold leading-none">{s.v}</p>
                  <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-muted">
                    {s.l}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Dešinė — karščiausia prekė */}
          {featured ? (
            <div className="relative mx-auto w-full max-w-sm">
              {/* dekoratyvus geltonas blokas už kortelės */}
              <div className="absolute -right-3 -top-3 hidden h-full w-full rounded-chunk border-[2.5px] border-ink bg-gold sm:block" />
              <motion.div
                initial={{ rotate: -2, y: 8, opacity: 0 }}
                animate={{ rotate: -2, y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 120, damping: 14 }}
                className="relative overflow-hidden rounded-chunk border-[3px] border-ink bg-paper shadow-chunky-lg"
              >
                <span className="absolute left-3 top-3 z-10 rotate-[-4deg] rounded-[5px] border-2 border-ink bg-red px-2.5 py-1 text-xs font-bold uppercase text-white shadow-chunky-sm">
                  🔥 Karščiausias
                </span>
                <div className="aspect-4/3 overflow-hidden border-b-[3px] border-ink bg-sand">
                  <img
                    src={featured.imageUrl || "/placeholder.svg"}
                    alt={featured.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-5">
                  <p className="text-[12px] font-semibold uppercase tracking-wide text-muted">
                    {featured.category} · {featured.location}
                  </p>
                  <h3 className="mt-1 font-display text-2xl font-extrabold leading-tight tracking-tight">
                    {featured.title}
                  </h3>
                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                        Dabartinė kaina
                      </p>
                      <p className="font-display text-[34px] font-extrabold leading-none tracking-tight">
                        {formatEur(featured.currentPrice)}
                      </p>
                    </div>
                    <CountdownTimer
                      endsAt={featured.endsAt}
                      className="rounded-[5px] border-2 border-ink px-2.5 py-1.5 text-sm"
                    />
                  </div>
                  <Link
                    href={`/auction/?slug=${encodeURIComponent(featured.slug)}`}
                    className="press mt-4 flex items-center justify-center gap-2 rounded-[5px] border-[2.5px] border-ink bg-green py-3 font-display font-bold text-white shadow-chunky-sm"
                  >
                    STATYTI DABAR →
                  </Link>
                </div>
              </motion.div>
            </div>
          ) : null}
        </div>
      </section>

      {/* ======================= GYVAS SRAUTAS ======================= */}
      <LiveTicker lots={lots} />

      {/* ========================= AUKCIONAI ========================= */}
      <section id="aukcionai" className="mx-auto w-full max-w-7xl scroll-mt-20 px-5 py-14 lg:px-8 lg:py-16">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              Vykstantys aukcionai
            </h2>
            <p className="mt-1.5 text-muted">
              {filtered.length} {filtered.length === 1 ? "prekė" : "prekės"} —
              rinkis pagal kategoriją ir miestą.
            </p>
          </div>
          {/* Paieška */}
          <div className="relative w-full sm:w-72">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ko ieškai?"
              className="w-full rounded-md border-[2.5px] border-ink bg-paper px-4 py-2.5 pr-10 text-sm font-medium outline-none placeholder:text-muted focus:shadow-chunky-sm"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted">
              🔍
            </span>
          </div>
        </Reveal>

        {/* Filtrai: kategorijos (pills) + miestas (select) */}
        <Reveal delay={0.05} className="mt-6 flex flex-wrap items-center gap-2.5">
          {categoryPills.map((c) => {
            const active = category === c.label;
            return (
              <button
                key={c.label}
                type="button"
                onClick={() => {
                  setCategory(c.label);
                  setSubcategory("");
                }}
                className={`press rounded-md border-[2.5px] border-ink px-3.5 py-2 text-sm font-bold shadow-chunky-sm ${
                  active ? "bg-ink text-cream" : "bg-paper text-ink"
                }`}
              >
                <span className="mr-1.5">{c.icon}</span>
                {c.label}
              </button>
            );
          })}
          {subcategory ? (
            <button
              type="button"
              onClick={() => setSubcategory("")}
              className="press rounded-md border-[2.5px] border-ink bg-green px-3.5 py-2 text-sm font-bold text-white shadow-chunky-sm"
            >
              {subcategory} ✕
            </button>
          ) : null}
          <div className="ml-auto">
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="press cursor-pointer rounded-md border-[2.5px] border-ink bg-gold px-3.5 py-2 text-sm font-bold shadow-chunky-sm outline-none"
            >
              <option>Visi miestai</option>
              {cities.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        </Reveal>

        {/* Tinklelis */}
        {filtered.length === 0 ? (
          <div className="mt-10 rounded-chunk border-[2.5px] border-dashed border-ink bg-paper p-12 text-center">
            <p className="font-display text-xl font-bold">Nieko neradom 🙈</p>
            <p className="mt-1 text-muted">Pabandyk kitą kategoriją arba miestą.</p>
            <button
              type="button"
              onClick={() => {
                setCategory("Visi");
                setSubcategory("");
                setCity("Visi miestai");
                setQuery("");
              }}
              className="press mt-5 rounded-md border-[2.5px] border-ink bg-green px-5 py-2.5 font-display font-bold text-white shadow-chunky-sm"
            >
              Išvalyti filtrus
            </button>
          </div>
        ) : (
          <motion.div layout className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <AnimatePresence mode="popLayout">
              {filtered.map((lot, i) => (
                <motion.div
                  key={lot.id}
                  layout
                  className="h-full"
                  initial={{ opacity: 0, y: 24, scale: 0.97 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: "-40px" }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 320, damping: 28, delay: (i % 4) * 0.06 }}
                >
                  <LotCard lot={lot} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </section>

      {/* ==================== JUMS GALI BŪTI ĮDOMU ==================== */}
      {recommended.length > 0 ? (
        <section className="mx-auto w-full max-w-7xl px-5 pb-4 lg:px-8">
          <Reveal>
            <h2 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
              Jums gali būti įdomu
            </h2>
            <p className="mt-1.5 text-muted">Daugiau prekių, kurias verta pamatyti.</p>
          </Reveal>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {recommended.map((lot) => (
              <LotCard key={`rec-${lot.id}`} lot={lot} />
            ))}
          </div>
        </section>
      ) : null}

      {/* ====================== KATEGORIJOS ====================== */}
      <section className="mx-auto w-full max-w-7xl px-5 py-14 lg:px-8">
        <Reveal>
          <h2 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
            Naršyk pagal kategorijas
          </h2>
          <p className="mt-1.5 text-muted">
            Pasirink kategoriją ir pamatyk pakategores — nuo transporto iki kolekcijų.
          </p>
        </Reveal>
        <div className="mt-6">
          <CategoryBrowser onPick={pickCategory} />
        </div>
      </section>

      {/* ======================== KAIP VEIKIA ======================== */}
      <section id="kaip-veikia" className="border-y-[2.5px] border-ink bg-paper">
        <div className="mx-auto max-w-7xl scroll-mt-20 px-5 py-16 lg:px-8">
          <Reveal>
            <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              Kaip tai veikia?
            </h2>
            <p className="mt-2 max-w-xl text-muted">
              Trys žingsniai nuo „radau" iki „laimėjau". Jokio mokesčio, jokio vargo.
            </p>
          </Reveal>
          <div className="mt-9 grid gap-6 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.08, type: "spring", stiffness: 200, damping: 22 }}
                className="rounded-chunk border-[2.5px] border-ink bg-cream p-6 shadow-chunky"
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{s.icon}</span>
                  <span className="font-display text-3xl font-extrabold text-green-deep">
                    {s.n}
                  </span>
                </div>
                <h3 className="mt-4 font-display text-xl font-bold">{s.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted">{s.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ====================== NAUJIENOS ====================== */}
      {news.length > 0 ? (
        <section className="mx-auto w-full max-w-7xl px-5 py-14 lg:px-8">
          <Reveal className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
                Naujausi patarimai
              </h2>
              <p className="mt-1.5 text-muted">Kaip pirkti ir parduoti aukcionuose protingai.</p>
            </div>
            <Link
              href="/naujienos"
              className="press rounded-md border-[2.5px] border-ink bg-paper px-4 py-2 text-sm font-bold shadow-chunky-sm"
            >
              Visos naujienos →
            </Link>
          </Reveal>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {news.map((article) => (
              <NewsCard key={article.slug} article={article} />
            ))}
          </div>
        </section>
      ) : null}

      {/* ====================== DAŽNI KLAUSIMAI (FAQ) ====================== */}
      <section className="border-y-[2.5px] border-ink bg-paper">
        <div className="mx-auto max-w-3xl px-5 py-16 lg:px-8">
          <Reveal>
            <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              Dažni klausimai
            </h2>
            <p className="mt-2 text-muted">Viskas, ką reikia žinoti prieš pradedant.</p>
          </Reveal>
          <div className="mt-8">
            <FaqSection />
          </div>
        </div>
      </section>

      {/* ========================== CTA JUOSTA ========================== */}
      <section className="mx-auto w-full max-w-7xl px-5 py-16 lg:px-8">
        <Reveal className="relative overflow-hidden rounded-chunk border-[3px] border-ink bg-gold p-8 shadow-chunky-lg sm:p-12">
          <div className="relative flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <h2 className="font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
                Turi ką parduoti?
              </h2>
              <p className="mt-2 max-w-lg text-lg font-medium text-ink/80">
                Paskelbk daiktą per kelias minutes ir leisk pirkėjams kovoti dėl jo.
                Nemokamai, be komisinių.
              </p>
            </div>
            <Link
              href="/skelbti"
              className="press shrink-0 rounded-md border-[2.5px] border-ink bg-ink px-7 py-4 font-display text-lg font-bold text-cream shadow-chunky"
            >
              Paskelbti nemokamai →
            </Link>
          </div>
        </Reveal>
      </section>

      <SiteFooter />
    </main>
  );
}
