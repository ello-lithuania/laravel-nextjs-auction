import AccountMenu from "./components/AccountMenu";
import Link from "next/link";
import { demoAuctions } from "./data/demoAuctions";
import { statusLabel } from "./lib/labels";

const navigation = [
  "Pagrindinis",
  "Katalogas",
  "Apie",
  "Kontaktai",
  "Pardavėjams",
];

const categories = [
  { label: "Laikrodžiai", icon: "⌚" },
  { label: "Automobiliai", icon: "🚗" },
  { label: "Elektronika", icon: "💻" },
  { label: "Menas", icon: "🖼️" },
  { label: "Kolekcijos", icon: "🎟️" },
];

const cityCards = ["Vilnius", "Kaunas", "Klaipėda", "Šiauliai"];

const partnerLogos = ["LRT", "Swed", "Inbank", "ERT", "Build"];

const agents = [
  {
    name: "Eglė Baltutė",
    role: "Aukcionų ekspertė",
    quote: "Padedu pardavėjams pasirinkti aukščiausią strategiją ir užtikrinti patikimą pirkėją.",
  },
  {
    name: "Mantas Vaitkus",
    role: "Platformos vadybininkas",
    quote: "Kiekvienas skelbimas gauna aiškų vertės pasiūlymą ir pasiekiamumą.",
  },
];

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

const formatPrice = (value: number | string) =>
  new Intl.NumberFormat("lt-LT", {
    style: "currency",
    currency: "EUR",
  }).format(Number(value));

async function getAuctions() {
  try {
    const response = await fetch(`${apiBaseUrl}/api/auctions`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Auction API failed");
    }

    const data = await response.json();

    return Array.isArray(data)
      ? data.map((auction, index) => ({
          id: auction.id ?? index,
          slug: auction.slug ?? String(auction.id ?? index),
          title: auction.title,
          category: auction.category,
          location: auction.location,
          badge: statusLabel(auction.status),
          price: formatPrice(auction.current_price),
          endsAt: auction.ends_at
            ? new Date(auction.ends_at).toLocaleString("lt-LT", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })
            : null,
          subtitle: auction.description ? auction.description.slice(0, 70) + "..." : auction.category,
          imageUrl: auction.image_url ?? (Array.isArray(auction.gallery) ? auction.gallery[0] ?? "" : ""),
          gallery: Array.isArray(auction.gallery) ? auction.gallery : [],
        }))
      : demoAuctions;
  } catch {
    return demoAuctions;
  }
}

export default async function Home() {
  const auctions = await getAuctions();
  const topOffers = auctions.slice(0, 16);
  const todaysAdds = auctions.slice(4, 7);
  const heroGallery: string[] = (topOffers[0]?.gallery?.slice(0, 3) ?? []) as string[];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-12 px-6 py-8 lg:px-10">
        <header className="flex flex-col gap-6 rounded-[2rem] border border-slate-200 bg-white/90 p-5 shadow-xl shadow-slate-200/60 backdrop-blur-xl sm:px-8 sm:py-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500 text-xl font-bold text-white">A</span>
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">AuctionHub</p>
              <p className="text-base font-semibold text-slate-900">Tavo skelbimų aukcionų bazė</p>
            </div>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-600">
            {navigation.map((item) => (
              <a key={item} href="#" className="transition hover:text-slate-900">
                {item}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <AccountMenu />
          </div>
        </header>

        <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div className="space-y-8">
            <div className="max-w-xl space-y-4">
              <p className="inline-flex rounded-full bg-slate-900/5 px-4 py-2 text-sm font-semibold uppercase tracking-[0.24em] text-slate-700">
                Nauja aukcionų platforma
              </p>
              <h1 className="text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl">
                Lengviausias būdas parduoti, pirkti ir sekti aukcionus vienoje vietoje.
              </h1>
              <p className="text-lg leading-8 text-slate-600">
                Kuriame aukcionų puslapį, kuris atrodo kaip verslo klasės platforma: aiškus, modernus ir patikimas.
                Pardavėjams lieka procentas, o pirkėjams – patikimi skelbimai.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Komisinis</p>
                <p className="mt-3 text-3xl font-semibold text-slate-950">5 %</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">Skaidri struktūra visiems pardavėjams.</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Sąsaja</p>
                <p className="mt-3 text-3xl font-semibold text-slate-950">Intuityvi</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">Sukurk skelbimą per kelias minutes ir pradėk aukcioną.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <a href="#" className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800">
                Peržiūrėti skelbimus
              </a>
              <a href="#" className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-50">
                Paskelbti objektą
              </a>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {categories.map((item) => (
                <div key={item.label} className="group rounded-3xl border border-slate-200 bg-white p-4 text-sm transition hover:-translate-y-0.5 hover:border-sky-200">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-lg">
                    {item.icon}
                  </div>
                  <p className="mt-4 font-semibold text-slate-900">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 text-white shadow-xl shadow-slate-200/10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.25),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(248,113,113,0.18),_transparent_24%)]" />
            <div className="relative p-8 sm:p-10">
              <div className="flex items-center justify-between rounded-3xl bg-slate-900/80 p-4 text-sm text-slate-200">
                <span className="uppercase tracking-[0.24em] text-slate-300">Aukciono peržiūra</span>
                <span className="rounded-full bg-sky-500/15 px-3 py-1 text-sky-300">Live</span>
              </div>
              <div className="mt-8 space-y-4">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Šiuo metu</p>
                <h2 className="text-3xl font-semibold leading-tight">Prabangus laikrodis su 24 k laimais</h2>
                <p className="max-w-sm text-sm leading-6 text-slate-300">122 pasiūlymai, 18 pirkėjų ir aukščiausias matomumas per parą.</p>
              </div>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl bg-slate-900/85 p-5">
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-400">€ dabartinė</p>
                  <p className="mt-3 text-2xl font-semibold">8,750</p>
                </div>
                <div className="rounded-3xl bg-slate-900/85 p-5">
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Laikas</p>
                  <p className="mt-3 text-2xl font-semibold">4h 23m</p>
                </div>
              </div>
              <div className="mt-8 rounded-3xl border border-slate-700/60 bg-slate-900/90 p-5 text-sm text-slate-300">
                <p>Komisija: 5 % platformai. Visi siūlymai rodomi skaidriai.</p>
              </div>
              {heroGallery.length > 0 && (
                <div className="mt-6 grid grid-cols-3 gap-3">
                  {heroGallery.map((src, index) => (
                    <img key={index} src={src} alt={`Galerija ${index + 1}`} className="h-24 w-full rounded-3xl object-cover" />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Naujausi skelbimai</p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-950">Top pasiūlymai</h2>
            </div>
            <a href="#" className="text-sm font-semibold text-slate-900 transition hover:text-slate-600">
              Peržiūrėti visus →
            </a>
          </div>
          <div className="mt-8 grid gap-6 xl:grid-cols-4">
            {topOffers.map((offer) => (
              <Link key={offer.id} href={`/auction/${offer.slug}`} className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-slate-50 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                {offer.imageUrl ? (
                  <div className="relative overflow-hidden">
                    <img src={offer.imageUrl} alt={offer.title} className="h-[220px] w-full object-cover" />
                    <div className="absolute inset-x-0 top-4 px-4">
                      <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-900 shadow-sm">
                        {offer.badge}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-[4/3] bg-slate-300" />
                )}
                <div className="space-y-4 p-6">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-slate-950">{offer.title}</h3>
                    <p className="text-sm text-slate-500">{offer.category}</p>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-sm text-slate-600">
                    <span>{offer.location}</span>
                    <span className="font-semibold text-slate-950">{offer.price}</span>
                  </div>
                  {offer.endsAt ? (
                    <div className="rounded-2xl bg-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-700">
                      Baigiasi: {offer.endsAt}
                    </div>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60">
            <h2 className="text-2xl font-semibold text-slate-950">Išsirink pagal miestą</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {cityCards.map((city) => (
                <div key={city} className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-semibold text-slate-900">
                  {city}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60">
            <h2 className="text-2xl font-semibold text-slate-950">Partneriai</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {partnerLogos.map((logo) => (
                <div key={logo} className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-semibold text-slate-900">
                  {logo}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60">
          <div className="grid gap-6 lg:grid-cols-2">
            {agents.map((agent) => (
              <div key={agent.name} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">{agent.role}</p>
                <h3 className="mt-3 text-xl font-semibold text-slate-950">{agent.name}</h3>
                <p className="mt-4 text-sm leading-6 text-slate-600">{agent.quote}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
