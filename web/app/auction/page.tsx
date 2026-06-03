"use client"

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import AuctionDetailClient from "./AuctionDetailClient";
import SiteFooter from "../components/SiteFooter";

// Static-export friendly: instead of a dynamic /auction/[slug] route (which a
// static export can't generate for arbitrary, runtime-created slugs), the
// auction is opened as /auction/?slug=<slug>. This single static page reads the
// slug from the query string and lets AuctionDetailClient fetch it client-side,
// so any slug works without a 404.
export default function AuctionPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl p-10 text-sm text-muted">Įkeliama…</div>}>
      <AuctionView />
    </Suspense>
  );
}

function AuctionView() {
  const params = useSearchParams();
  const slug = params.get("slug") ?? "";

  return (
    <main className="flex min-h-screen flex-col bg-cream text-ink">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b-[2.5px] border-ink bg-cream/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-md border-[2.5px] border-ink bg-green text-lg font-extrabold text-white shadow-chunky-sm">
              D
            </span>
            <span className="font-display text-xl font-extrabold tracking-tight">
              DEKAUKCIONA<span className="text-green-deep">.lt</span>
            </span>
          </Link>
          <Link
            href="/"
            className="press rounded-md border-[2.5px] border-ink bg-paper px-4 py-2 text-sm font-bold shadow-chunky-sm"
          >
            ← Atgal
          </Link>
        </div>
      </header>

      <div className="mx-auto w-full max-w-7xl flex-1 px-5 py-8 lg:px-8 lg:py-10">
        <AuctionDetailClient slug={slug} />
      </div>

      <SiteFooter />
    </main>
  );
}
