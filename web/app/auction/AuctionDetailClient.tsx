"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useAuth } from "../components/AuthProvider";
import { useToast } from "../components/ToastProvider";
import BidsList, { type Bid } from "../components/BidsList";
import { getEcho } from "../lib/echo";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

const formatPrice = (value: number | string) =>
  new Intl.NumberFormat("lt-LT", {
    style: "currency",
    currency: "EUR",
  }).format(Number(value));

const formatCountdown = (seconds: number) => {
  if (seconds <= 0) return "Aukcionas baigėsi";
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${days ? `${days}d ` : ""}${hours.toString().padStart(2, "0")}h ${minutes.toString().padStart(2, "0")}m ${secs.toString().padStart(2, "0")}s`;
};

// Break the remaining time into labelled segments for the countdown boxes.
const countdownParts = (seconds: number) => {
  const safe = Math.max(0, seconds);
  return [
    { label: "d", value: Math.floor(safe / 86400) },
    { label: "val", value: Math.floor((safe % 86400) / 3600) },
    { label: "min", value: Math.floor((safe % 3600) / 60) },
    { label: "sek", value: safe % 60 },
  ];
};

type Auction = {
  id: number;
  slug: string;
  title: string;
  description: string;
  category: string;
  location: string;
  seller_name: string;
  starting_price: number;
  current_price: number;
  commission_percent: number;
  status: string;
  ends_at: string;
  image_url: string;
  gallery: string[];
  bids_count: number;
};

export default function AuctionDetailClient({ auction, slug }: { auction?: Auction; slug?: string }) {
  const toast = useToast();
  const { user, token, logout } = useAuth();
  const [auctionState, setAuctionState] = useState<Auction | null>(auction ?? null);
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const [bidAmount, setBidAmount] = useState<number>(() =>
    auction ? Number(auction.current_price) + 1 : 0
  );
  const [saving, setSaving] = useState(false);
  const [bids, setBids] = useState<Bid[]>([]);
  const [bidsLoading, setBidsLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  // Merge a bid into the list: dedupe by id, newest first, keep last 10.
  const mergeBid = (incoming: Bid) =>
    setBids((prev) =>
      prev.some((b) => b.id === incoming.id) ? prev : [incoming, ...prev].slice(0, 10)
    );

  const endsAtDate = useMemo(() => new Date(auctionState?.ends_at ?? Date.now()), [auctionState?.ends_at]);
  const currentPrice = Number(auctionState?.current_price ?? 0);
  const minBid = currentPrice + 1;

  // Keep the bid input one step above the current price. Re-syncs whenever the
  // price changes — after our own bid and after live bids from other users.
  useEffect(() => {
    setBidAmount(currentPrice + 1);
  }, [currentPrice]);

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      const diff = Math.max(0, Math.floor((endsAtDate.getTime() - Date.now()) / 1000));
      setSecondsLeft(diff);
    }, 1000);
    return () => clearInterval(interval);
  }, [endsAtDate]);

  // Initialize countdown from auction end time
  useEffect(() => {
    const diff = Math.max(0, Math.floor((endsAtDate.getTime() - Date.now()) / 1000));
    setSecondsLeft(diff);
  }, [endsAtDate]);

  // Client-fetch auction if not provided by server
  useEffect(() => {
    if (auctionState || !slug) return;
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/api/auctions/${encodeURIComponent(slug)}`);
        if (!res.ok) throw new Error("Auction not found");
        const data = await res.json();
        if (!mounted) return;
        const auctionData = {
          ...data,
          current_price: Number(data.current_price),
          starting_price: Number(data.starting_price),
          commission_percent: Number(data.commission_percent),
          bids_count: Number(data.bids_count),
          gallery: Array.isArray(data.gallery) ? data.gallery : [],
        };
        setAuctionState(auctionData);
        setBidAmount(Number(auctionData.current_price) + 1);
      } catch (e) {
        toast.error("Aukcionas nerastas");
      }
    })();
    return () => {
      mounted = false;
    };
  }, [slug, auctionState, toast, apiBaseUrl]);

  // Load the last 10 bids whenever the auction changes.
  useEffect(() => {
    const slugToFetch = auctionState?.slug;
    if (!slugToFetch) return;
    let mounted = true;
    setBidsLoading(true);
    (async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/api/auctions/${encodeURIComponent(slugToFetch)}/bids`);
        if (res.ok && mounted) {
          setBids((await res.json()) as Bid[]);
        }
      } catch {
        // Silently ignore — empty list is shown.
      } finally {
        if (mounted) setBidsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [auctionState?.slug, apiBaseUrl]);

  // Subscribe to real-time bid updates via Laravel Reverb (websockets).
  // The price and bid list update live for everyone watching — no refresh.
  useEffect(() => {
    const id = auctionState?.id;
    if (!id) return;
    const echo = getEcho();
    if (!echo) return;

    const channelName = `auction.${id}`;
    echo
      .channel(channelName)
      .listen(".new-bid", (event: { currentPrice: number; bidsCount: number; bid: Bid }) => {
        setAuctionState((prev) =>
          prev
            ? {
                ...prev,
                current_price: Number(event.currentPrice),
                bids_count: Number(event.bidsCount),
              }
            : prev
        );
        if (event.bid) {
          mergeBid(event.bid);
        }
      });

    return () => {
      echo.leave(channelName);
    };
  }, [auctionState?.id]);

  const handleBid = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || !token) {
      toast.error("Prašome prisijungti, kad galėtumėte dalyvauti aukcione.");
      return;
    }
    if (bidAmount <= currentPrice) {
      toast.error("Siūlymas turi būti didesnis nei dabartinė kaina.");
      return;
    }
    if (secondsLeft <= 0) {
      toast.error("Aukcionas jau baigėsi.");
      return;
    }
    setSaving(true);
    try {
      if (!auctionState) throw new Error("Aukcionas nerastas");
      const response = await fetch(`${apiBaseUrl}/api/auctions/${auctionState.slug}/bid`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        // Bidder name/city are taken from the authenticated user server-side.
        body: JSON.stringify({ amount: bidAmount }),
      });
      if (response.status === 401) {
        // The stored token is no longer valid (e.g. expired or revoked on the
        // server). Clear the stale session so the UI stops showing the user as
        // logged in, and tell them to sign in again.
        logout();
        throw new Error("Jūsų sesija nebegalioja. Prisijunkite iš naujo.");
      }
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || "Klaida siunčiant pasiūlymą.");
      }
      const data = await response.json();
      if (data.auction) {
        setAuctionState((prev) => ({
          ...(prev as Auction),
          ...data.auction,
          current_price: Number(data.auction.current_price),
          bids_count: Number(data.auction.bids_count),
        }));
      }
      // Show our own bid immediately (the Reverb broadcast also arrives, but
      // mergeBid dedupes by id so it won't be listed twice).
      if (data.bid) {
        mergeBid({ ...data.bid, amount: Number(data.bid.amount) } as Bid);
      }
      toast.success("Pasiūlymas sėkmingai pateiktas!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nepavyko pateikti pasiūlymą.");
    } finally {
      setSaving(false);
    }
  };

  if (!auctionState) {
    return (
      <div className="space-y-8">
        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="h-[420px] rounded-[1.5rem] bg-slate-200 animate-pulse" />
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="h-28 rounded-3xl bg-slate-200" />
              <div className="h-28 rounded-3xl bg-slate-200" />
              <div className="h-28 rounded-3xl bg-slate-200" />
            </div>
          </div>
          <aside className="space-y-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Įkeliama</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-950">…</p>
                </div>
                <div className="rounded-3xl bg-slate-100 px-4 py-2 text-sm text-slate-700">—</div>
              </div>
              <div className="grid gap-3 rounded-[1.5rem] bg-slate-50 p-4 text-sm text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Baigiasi</span>
                  <span>—</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Laikas liko</span>
                  <span className="font-semibold text-slate-950">—</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <input disabled className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-400" />
              <button disabled className="inline-flex w-full items-center justify-center rounded-full bg-slate-400 px-5 py-3 text-sm font-semibold text-white">Įkeliama…</button>
            </div>
          </aside>
        </div>
      </div>
    );
  }

  const gallery = auctionState.gallery?.length
    ? auctionState.gallery
    : auctionState.image_url
      ? [auctionState.image_url]
      : [];
  const mainImage = gallery[activeImage] ?? gallery[0];
  const isEnded = secondsLeft <= 0;
  const quickSteps = [1, 10, 50, 100];

  // Show only meaningful countdown segments: drop leading zero units (e.g. when
  // there are no days/hours left), but always keep at least seconds.
  const cdParts = countdownParts(secondsLeft);
  const firstNonZero = cdParts.findIndex((p) => p.value > 0);
  const visibleParts = firstNonZero === -1 ? cdParts.slice(-1) : cdParts.slice(firstNonZero);

  return (
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          {mainImage ? (
            <div className="relative overflow-hidden rounded-[1.5rem]">
              <img src={mainImage} alt={auctionState.title} className="h-[420px] w-full object-cover" />
              <div className="absolute left-4 top-4 flex gap-2">
                <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-900 shadow-sm">
                  {auctionState.category}
                </span>
              </div>
            </div>
          ) : (
            <div className="h-[420px] rounded-[1.5rem] bg-slate-200" />
          )}
          {gallery.length > 1 ? (
            <div className="grid grid-cols-4 gap-3">
              {gallery.slice(0, 4).map((src, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImage(idx)}
                  className={`overflow-hidden rounded-2xl border-2 transition ${
                    activeImage === idx ? "border-sky-500" : "border-transparent hover:border-slate-200"
                  }`}
                >
                  <img src={src} alt={`${auctionState.title} ${idx + 1}`} className="h-20 w-full object-cover" />
                </button>
              ))}
            </div>
          ) : null}
          <div className="space-y-3">
            <h1 className="text-4xl font-semibold text-slate-950">{auctionState.title}</h1>
            <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
              <span className="rounded-full bg-slate-100 px-3 py-1">📍 {auctionState.location}</span>
              <span className="rounded-full bg-slate-100 px-3 py-1">{auctionState.commission_percent}% komisinis</span>
              <span className="rounded-full bg-slate-100 px-3 py-1">{auctionState.bids_count} pasiūlymai</span>
            </div>
            <p className="text-base leading-7 text-slate-600">{auctionState.description}</p>
          </div>
        </div>

        <aside className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 text-white shadow-xl shadow-slate-200/20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.22),_transparent_36%),radial-gradient(circle_at_bottom_left,_rgba(251,191,36,0.12),_transparent_30%)]" />
          <div className="relative space-y-6 p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Dabartinė kaina</p>
                <p className="mt-2 text-4xl font-semibold">{formatPrice(auctionState.current_price)}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                isEnded ? "bg-red-500/20 text-red-300" : "bg-emerald-500/15 text-emerald-300"
              }`}>
                {isEnded ? "Baigėsi" : "● Live"}
              </span>
            </div>

            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Laikas liko</p>
              {isEnded ? (
                <p className="mt-3 text-xl font-semibold text-red-300">Aukcionas baigėsi</p>
              ) : (
                <div className="mt-3 grid gap-2" style={{ gridTemplateColumns: `repeat(${visibleParts.length}, minmax(0, 1fr))` }}>
                  {visibleParts.map((part) => (
                    <div key={part.label} className="rounded-2xl bg-slate-900/80 py-3 text-center">
                      <p className="text-2xl font-semibold tabular-nums">{part.value.toString().padStart(2, "0")}</p>
                      <p className="mt-1 text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">{part.label}</p>
                    </div>
                  ))}
                </div>
              )}
              <p className="mt-3 text-xs text-slate-400">
                Baigiasi {endsAtDate.toLocaleString("lt-LT", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>

            <form className="space-y-3" onSubmit={handleBid}>
              <label className="block text-sm font-semibold text-slate-200">Tavo pasiūlymas</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min={minBid}
                  value={bidAmount}
                  onChange={(e) => setBidAmount(Number(e.target.value))}
                  className="w-full rounded-3xl border border-slate-700 bg-slate-900/80 px-4 py-3 pr-10 text-base text-white outline-none transition focus:border-sky-500"
                />
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">€</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {quickSteps.map((step) => (
                  <button
                    key={step}
                    type="button"
                    onClick={() => setBidAmount(Number((currentPrice + step).toFixed(2)))}
                    className="rounded-full border border-slate-700 bg-slate-900/60 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-sky-500 hover:text-white"
                  >
                    +{step} €
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-400">Mažiausias galimas pasiūlymas: {formatPrice(minBid)}</p>
              <button
                type="submit"
                disabled={saving || isEnded}
                className="inline-flex w-full items-center justify-center rounded-full bg-sky-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400 disabled:shadow-none"
              >
                {saving ? "Siunčiama…" : isEnded ? "Aukcionas baigėsi" : "Pateikti pasiūlymą"}
              </button>
            </form>

            <div className="rounded-3xl border border-slate-700/60 bg-slate-900/70 p-4 text-sm text-slate-300">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Pardavėjas</p>
              <p className="mt-1 font-semibold text-white">{auctionState.seller_name}</p>
              <p className="mt-1 text-slate-400">📍 {auctionState.location}</p>
            </div>
          </div>
        </aside>
      </div>

      <BidsList bids={bids} loading={bidsLoading} />
    </div>
  );
}
