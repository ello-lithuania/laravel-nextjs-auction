"use client"

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import AuctionDetailClient from "./AuctionDetailClient";

// Static-export friendly: instead of a dynamic /auction/[slug] route (which a
// static export can't generate for arbitrary, runtime-created slugs), the
// auction is opened as /auction/?slug=<slug>. This single static page reads the
// slug from the query string and lets AuctionDetailClient fetch it client-side,
// so any slug works without a 404.
export default function AuctionPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl p-10 text-sm text-slate-500">Įkeliama…</div>}>
      <AuctionView />
    </Suspense>
  );
}

function AuctionView() {
  const params = useSearchParams();
  const slug = params.get("slug") ?? "";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
        <div className="mb-6 flex items-center justify-between gap-4 rounded-[2rem] border border-slate-200 bg-white/90 p-5 shadow-sm sm:p-6">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Aukciono peržiūra</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950">Aukcionas</h1>
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
