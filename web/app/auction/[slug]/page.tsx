import AuctionDetailClient from "../AuctionDetailClient";
import Link from "next/link";
import { demoAuctions } from "../../data/demoAuctions";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

async function getAuction(slug: string) {
  try {
    const response = await fetch(`${apiBaseUrl}/api/auctions/${encodeURIComponent(slug)}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch {
    return null;
  }
}

export default async function AuctionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let auction = await getAuction(slug);

  // Fallback to demo data when API is unavailable or returns not found
  if (!auction) {
    const demo = demoAuctions.find((a) => a.slug === slug);
    if (demo) {
      auction = demo;
    }
  }

  if (!auction) {
    // Render client component which will fetch the auction by slug on the client side.
    return (
      <main className="min-h-screen bg-slate-50 text-slate-950">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
          <div className="mb-6 flex items-center justify-between gap-4 rounded-[2rem] border border-slate-200 bg-white/90 p-5 shadow-sm sm:p-6">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Aukciono peržiūra</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-950">Įkeliama…</h1>
            </div>
            <Link href="/" className="rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50">
              Grįžti atgal
            </Link>
          </div>
          <AuctionDetailClient slug={slug} />
        </div>
      </main>
    );
  }

  const auctionProps = {
    ...auction,
    current_price: Number(auction.current_price),
    starting_price: Number(auction.starting_price),
    commission_percent: Number(auction.commission_percent),
    bids_count: Number(auction.bids_count),
    gallery: Array.isArray(auction.gallery) ? auction.gallery : [],
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
        <div className="mb-6 flex items-center justify-between gap-4 rounded-[2rem] border border-slate-200 bg-white/90 p-5 shadow-sm sm:p-6">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Aukciono peržiūra</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950">{auction.title}</h1>
          </div>
          <Link href="/" className="rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50">
            Grįžti atgal
          </Link>
        </div>
        <AuctionDetailClient auction={auctionProps} />
      </div>
    </main>
  );
}
