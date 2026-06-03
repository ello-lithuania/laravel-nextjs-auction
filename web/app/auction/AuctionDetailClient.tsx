"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useAnimationControls } from "motion/react";
import { useAuth } from "../components/AuthProvider";
import { useToast } from "../components/ToastProvider";
import BidsList, { type Bid } from "../components/BidsList";
import AnimatedPrice from "../components/AnimatedPrice";
import ShareButtons from "../components/ShareButtons";
import WinModal from "../components/WinModal";
import SoundToggle from "../components/SoundToggle";
import ChatPanel from "../components/ChatPanel";
import { getEcho } from "../lib/echo";
import { formatEurPrecise } from "../lib/format";
import { statusLabel } from "../lib/labels";
import { fireBidConfetti, fireWinConfetti } from "../lib/confetti";
import { playBidSound, playWinSound } from "../lib/sound";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

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
  seller_id?: number | null;
};

type ChatThread = {
  id: number;
  counterpart: { id: number; name: string };
  messages_count: number;
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
  // „+X €" pop virš kainos po sėkmingo statymo.
  const [pricePop, setPricePop] = useState<{ key: number; text: string } | null>(null);
  // Hidruojam autentifikacijos būseną po mount (kad nebūtų SSR/CSR neatitikimo).
  const [mounted, setMounted] = useState(false);
  // Laimėjimo ekranas — kai aukcionas baigiasi ir esi aukščiausias siūlytojas.
  const [showWin, setShowWin] = useState(false);
  const winShownRef = useRef(false);
  // Pokalbiai pirkėjas↔pardavėjas.
  const [chat, setChat] = useState<{ id: number; name: string } | null>(null);
  const [inbox, setInbox] = useState<ChatThread[] | null>(null);
  const [chatBusy, setChatBusy] = useState(false);

  // Refs, kad realtime klausytojo closure matytų šviežias reikšmes.
  const myLastBidRef = useRef<number | null>(null);
  const userNameRef = useRef<string | undefined>(undefined);
  const bidBtnRef = useRef<HTMLButtonElement | null>(null);
  const shakeControls = useAnimationControls();

  useEffect(() => {
    userNameRef.current = user?.name;
  }, [user?.name]);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  // Laimėjimas: aukcionas baigėsi (secondsLeft==0) IR esi aukščiausias siūlytojas
  // (paskutinis tavo statymas vis dar lygus dabartinei kainai → niekas neaplenkė).
  useEffect(() => {
    if (winShownRef.current || !mounted || !user) return;
    if (secondsLeft > 0) return;
    const myLast = myLastBidRef.current;
    if (myLast != null && currentPrice > 0 && currentPrice <= myLast) {
      winShownRef.current = true;
      setShowWin(true);
      fireWinConfetti();
      playWinSound();
    }
  }, [secondsLeft, mounted, user, currentPrice]);

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
      .listen(".new-bid", (event: { currentPrice: number; bidsCount: number; bid: Bid; endsAt?: string | null; extended?: boolean }) => {
        setAuctionState((prev) =>
          prev
            ? {
                ...prev,
                current_price: Number(event.currentPrice),
                bids_count: Number(event.bidsCount),
                ends_at: event.endsAt ?? prev.ends_at,
              }
            : prev
        );
        if (event.bid) {
          mergeBid(event.bid);
        }
        if (event.extended) {
          toast.info("⏱ +15 sek — aukcionas pratęstas!");
        }
        // „Tave aplenkė" — jei buvau aukščiausias, o kažkas pastatė daugiau.
        const myLast = myLastBidRef.current;
        const incomingName = event.bid?.bidder_name;
        if (
          myLast != null &&
          Number(event.currentPrice) > myLast &&
          incomingName !== userNameRef.current
        ) {
          toast.error("Tave aplenkė! Statyk dar 💪");
          shakeControls.start({
            x: [0, -8, 8, -6, 6, 0],
            transition: { duration: 0.5 },
          });
        }
      });

    return () => {
      echo.leave(channelName);
    };
  }, [auctionState?.id, toast, shakeControls]);

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
    const delta = bidAmount - currentPrice;
    setSaving(true);
    try {
      if (!auctionState) throw new Error("Aukcionas nerastas");
      const response = await fetch(`${apiBaseUrl}/api/auctions/${encodeURIComponent(auctionState.slug)}/bid`, {
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
      // 🎉 JUICE: confetti nuo mygtuko + „+X €" pop + įsimenam savo statymą.
      myLastBidRef.current = bidAmount;
      const r = bidBtnRef.current?.getBoundingClientRect();
      fireBidConfetti(
        r
          ? { x: (r.left + r.width / 2) / window.innerWidth, y: r.top / window.innerHeight }
          : undefined
      );
      playBidSound();
      setPricePop({ key: Date.now(), text: `+${Math.round(delta)} €` });
      toast.success("Pasiūlymas pateiktas! 🚀");
      if (data.extended) {
        toast.info("⏱ +15 sek — aukcionas pratęstas!");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nepavyko pateikti pasiūlymą.");
    } finally {
      setSaving(false);
    }
  };

  // Pirkėjas atidaro (ar tęsia) pokalbį su pardavėju.
  const startChatWithSeller = async () => {
    if (!token || !auctionState) return;
    setChatBusy(true);
    try {
      const res = await fetch(
        `${apiBaseUrl}/api/auctions/${encodeURIComponent(auctionState.slug)}/conversation`,
        { method: "POST", headers: { Accept: "application/json", Authorization: `Bearer ${token}` } },
      );
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message ?? "Nepavyko atidaryti pokalbio.");
      setChat({ id: data.id, name: data.counterpart?.name ?? auctionState.seller_name });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Klaida atidarant pokalbį.");
    } finally {
      setChatBusy(false);
    }
  };

  // Pardavėjas pamato visus pokalbius, atidarytus jo aukcione.
  const openInbox = async () => {
    if (!token || !auctionState) return;
    setChatBusy(true);
    try {
      const res = await fetch(
        `${apiBaseUrl}/api/auctions/${encodeURIComponent(auctionState.slug)}/conversations`,
        { headers: { Accept: "application/json", Authorization: `Bearer ${token}` } },
      );
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message ?? "Nepavyko įkelti pokalbių.");
      setInbox(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Klaida.");
    } finally {
      setChatBusy(false);
    }
  };

  if (!auctionState) {
    return (
      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div className="chunky rounded-chunk p-5">
          <div className="aspect-4/3 animate-pulse rounded-chunk border-2 border-ink bg-sand" />
        </div>
        <div className="chunky rounded-chunk p-6">
          <div className="h-8 w-1/2 animate-pulse rounded bg-sand" />
          <div className="mt-4 h-12 w-2/3 animate-pulse rounded bg-sand" />
          <div className="mt-6 h-12 animate-pulse rounded-chunk bg-sand" />
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
  const urgent = !isEnded && secondsLeft <= 300;
  const critical = !isEnded && secondsLeft <= 60;
  const quickSteps = [1, 10, 50, 100];

  // Show only meaningful countdown segments: drop leading zero units (e.g. when
  // there are no days/hours left), but always keep at least seconds.
  const cdParts = countdownParts(secondsLeft);
  const firstNonZero = cdParts.findIndex((p) => p.value > 0);
  const visibleParts = firstNonZero === -1 ? cdParts.slice(-1) : cdParts.slice(firstNonZero);

  return (
    <div className="space-y-8">
      <AnimatePresence>
        {showWin ? (
          <WinModal
            title={auctionState.title}
            price={currentPrice}
            sellerName={auctionState.seller_name}
            onClose={() => setShowWin(false)}
          />
        ) : null}
      </AnimatePresence>

      {/* Pokalbio langas */}
      <AnimatePresence>
        {chat && token ? (
          <ChatPanel
            token={token}
            conversationId={chat.id}
            counterpartName={chat.name}
            onClose={() => setChat(null)}
          />
        ) : null}
      </AnimatePresence>

      {/* Pardavėjo gautų pokalbių sąrašas */}
      <AnimatePresence>
        {inbox ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-5"
            onClick={() => setInbox(null)}
          >
            <motion.div
              initial={{ scale: 0.92, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-chunk border-[3px] border-ink bg-cream p-5 shadow-chunky-lg"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xl font-bold">Pokalbiai</h3>
                <button
                  type="button"
                  onClick={() => setInbox(null)}
                  aria-label="Uždaryti"
                  className="press flex h-8 w-8 items-center justify-center rounded-md border-2 border-ink bg-paper font-bold shadow-chunky-sm"
                >
                  ✕
                </button>
              </div>
              {inbox.length === 0 ? (
                <p className="mt-5 text-center text-sm text-muted">Dar nėra pokalbių šiame aukcione.</p>
              ) : (
                <div className="mt-4 space-y-2.5">
                  {inbox.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setChat({ id: t.id, name: t.counterpart.name });
                        setInbox(null);
                      }}
                      className="press flex w-full items-center justify-between rounded-md border-2 border-ink bg-paper px-4 py-3 text-left shadow-chunky-sm"
                    >
                      <span className="font-bold">{t.counterpart.name}</span>
                      <span className="text-xs font-semibold text-muted">{t.messages_count} žin.</span>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        {/* ============ KAIRĖ: nuotrauka + info ============ */}
        <div className="chunky space-y-5 rounded-chunk p-5">
          <div className="relative overflow-hidden rounded-chunk border-[2.5px] border-ink bg-sand">
            <img
              src={mainImage || "/placeholder.svg"}
              alt={auctionState.title}
              onError={(e) => {
                const img = e.currentTarget;
                if (!img.src.endsWith("/placeholder.svg")) img.src = "/placeholder.svg";
              }}
              className="aspect-4/3 w-full object-cover"
            />
            <span className="absolute left-3 top-3 rounded-[5px] border-2 border-ink bg-gold px-2.5 py-1 text-xs font-bold uppercase tracking-wide shadow-chunky-sm">
              {auctionState.category}
            </span>
          </div>
          {gallery.length > 1 ? (
            <div className="grid grid-cols-4 gap-3">
              {gallery.slice(0, 4).map((src, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImage(idx)}
                  className={`overflow-hidden rounded-md border-[2.5px] transition ${
                    activeImage === idx ? "border-green shadow-chunky-sm" : "border-ink"
                  }`}
                >
                  <img src={src} alt={`${auctionState.title} ${idx + 1}`} className="aspect-4/3 w-full object-cover" />
                </button>
              ))}
            </div>
          ) : null}
          <div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              {auctionState.title}
            </h1>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold uppercase tracking-wide">
              <span className="rounded-[5px] border-2 border-ink bg-sand px-2.5 py-1">📍 {auctionState.location}</span>
              <span className="rounded-[5px] border-2 border-ink bg-green px-2.5 py-1 text-white">Nemokama</span>
              <span className="rounded-[5px] border-2 border-ink bg-gold px-2.5 py-1">{auctionState.bids_count} statymai</span>
            </div>
            <p className="mt-4 text-[15px] leading-relaxed text-muted">{auctionState.description}</p>
          </div>
        </div>

        {/* ============ DEŠINĖ: statymo panelė ============ */}
        <motion.aside animate={shakeControls} className="chunky-lg h-fit space-y-6 rounded-chunk p-6 sm:p-7">
          <div className="flex items-start justify-between gap-3">
            <div className="relative">
              <p className="text-[11px] font-bold uppercase tracking-wide text-muted">Dabartinė kaina</p>
              <AnimatedPrice
                value={currentPrice}
                className="font-display text-[40px] font-extrabold leading-none tracking-tight sm:text-5xl"
              />
              {/* „+X €" pop */}
              <AnimatePresence>
                {pricePop ? (
                  <motion.span
                    key={pricePop.key}
                    initial={{ opacity: 0, y: 0, scale: 0.6 }}
                    animate={{ opacity: 1, y: -34, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    onAnimationComplete={() => setPricePop(null)}
                    className="pointer-events-none absolute -right-2 top-4 font-display text-xl font-extrabold text-green-deep"
                  >
                    {pricePop.text}
                  </motion.span>
                ) : null}
              </AnimatePresence>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2">
              <span
                className={`rounded-[5px] border-2 border-ink px-2.5 py-1 text-xs font-bold uppercase ${
                  isEnded ? "bg-red text-white" : "bg-green text-white"
                }`}
              >
                {isEnded ? "Baigėsi" : "● VYKSTA"}
              </span>
              <SoundToggle />
            </div>
          </div>

          {/* Countdown */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-muted">
              {isEnded ? "Aukcionas" : "Liko laiko"}
            </p>
            {isEnded ? (
              <p className="mt-2 font-display text-xl font-bold text-red">Aukcionas baigėsi</p>
            ) : (
              <div
                className="mt-2 grid gap-2"
                style={{ gridTemplateColumns: `repeat(${visibleParts.length}, minmax(0, 1fr))` }}
              >
                {visibleParts.map((part) => (
                  <div
                    key={part.label}
                    className={`rounded-md border-2 border-ink py-2.5 text-center ${
                      urgent ? "bg-red text-white" : "bg-cream"
                    } ${critical ? "animate-urgent" : ""}`}
                  >
                    <p className="font-display text-2xl font-extrabold tabular-nums leading-none">
                      {part.value.toString().padStart(2, "0")}
                    </p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-wide opacity-70">
                      {part.label}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <p className="mt-2 text-xs text-muted">
              Baigiasi{" "}
              {endsAtDate.toLocaleString("lt-LT", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>

          {/* Statymo forma — tik prisijungusiems (kiti negali statyti) */}
          {mounted && user ? (
          <form className="space-y-3" onSubmit={handleBid}>
            <label className="block text-sm font-bold">Tavo statymas</label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min={minBid}
                value={bidAmount}
                onChange={(e) => setBidAmount(Number(e.target.value))}
                className="w-full rounded-md border-[2.5px] border-ink bg-paper px-4 py-3 pr-9 font-display text-lg font-bold outline-none focus:shadow-chunky-sm"
              />
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 font-display font-bold text-muted">€</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {quickSteps.map((step) => (
                <button
                  key={step}
                  type="button"
                  onClick={() => setBidAmount(Number((currentPrice + step).toFixed(2)))}
                  className="press rounded-[5px] border-2 border-ink bg-sand px-3 py-1.5 text-sm font-bold shadow-chunky-sm"
                >
                  +{step} €
                </button>
              ))}
            </div>
            <p className="text-xs text-muted">Mažiausias statymas: {formatEurPrecise(minBid)}</p>
            <button
              ref={bidBtnRef}
              type="submit"
              disabled={saving || isEnded}
              className="press flex w-full items-center justify-center gap-2 rounded-md border-[2.5px] border-ink bg-green py-3.5 font-display text-lg font-bold text-white shadow-chunky disabled:cursor-not-allowed disabled:border-muted disabled:bg-muted disabled:shadow-none"
            >
              {saving ? "Statoma…" : isEnded ? "Aukcionas baigėsi" : "STATYTI 🚀"}
            </button>
          </form>
          ) : (
            <div className="rounded-md border-2 border-ink bg-cream p-5 text-center">
              <p className="font-display text-lg font-bold">Nori statyti? 🚀</p>
              <p className="mt-1 text-sm text-muted">
                Prisijunk arba susikurk paskyrą — tai nemokama.
              </p>
              <div className="mt-4 flex gap-2.5">
                <Link
                  href="/login"
                  className="press flex-1 rounded-md border-[2.5px] border-ink bg-green py-3 font-display font-bold text-white shadow-chunky-sm"
                >
                  Prisijungti
                </Link>
                <Link
                  href="/register"
                  className="press flex-1 rounded-md border-[2.5px] border-ink bg-paper py-3 font-display font-bold shadow-chunky-sm"
                >
                  Registruotis
                </Link>
              </div>
            </div>
          )}

          {/* Pardavėjas */}
          <div className="rounded-md border-2 border-ink bg-cream p-4">
            <p className="text-[11px] font-bold uppercase tracking-wide text-muted">Pardavėjas</p>
            <p className="mt-1 font-display text-lg font-bold">{auctionState.seller_name}</p>
            <p className="mt-0.5 text-sm text-muted">📍 {auctionState.location}</p>
          </div>

          {/* Pokalbis pirkėjas↔pardavėjas */}
          {mounted && user && auctionState.seller_id ? (
            user.id === auctionState.seller_id ? (
              <button
                type="button"
                onClick={openInbox}
                disabled={chatBusy}
                className="press w-full rounded-md border-[2.5px] border-ink bg-ink py-3 font-display font-bold text-cream shadow-chunky-sm disabled:opacity-60"
              >
                💬 Pokalbiai su pirkėjais
              </button>
            ) : (
              <button
                type="button"
                onClick={startChatWithSeller}
                disabled={chatBusy}
                className="press w-full rounded-md border-[2.5px] border-ink bg-gold py-3 font-display font-bold shadow-chunky-sm disabled:opacity-60"
              >
                💬 Susisiekti su pardavėju
              </button>
            )
          ) : null}

          {/* Dalijimasis — pasiek daugiau pirkėjų */}
          <div className="rounded-md border-2 border-ink bg-cream p-4">
            <ShareButtons title={auctionState.title} label="Pasidalink ir pritrauk pirkėjų:" />
          </div>
        </motion.aside>
      </div>

      <BidsList bids={bids} loading={bidsLoading} />
    </div>
  );
}
