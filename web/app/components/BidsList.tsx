'use client';

import { formatEur } from '../lib/format';

export interface Bid {
  id: number;
  amount: number;
  bidder_name: string;
  bidder_city?: string | null;
  created_at: string;
}

// Privatumas: viešame statymų sąraše nerodom pilno vardo ir pavardės.
// Paliekam tik pirmas 2 raides, likusį užmaskuojam: „Mantas Vaitkus" → „Ma•••".
const maskBidder = (name: string): string => {
  const first = (name || "").trim().split(/\s+/)[0] ?? "";
  if (first.length <= 2) return first ? `${first}•••` : "Dalyvis";
  return `${first.slice(0, 2)}•••`;
};

export default function BidsList({ bids, loading }: { bids: Bid[]; loading: boolean }) {
  return (
    <section className="chunky rounded-chunk p-6 sm:p-7">
      <div className="flex items-center justify-between gap-4">
        <h3 className="font-display text-2xl font-extrabold tracking-tight">Paskutiniai statymai</h3>
        {!loading && bids.length > 0 ? (
          <span className="rounded-[5px] border-2 border-ink bg-gold px-3 py-1 text-sm font-bold">
            {bids.length}
          </span>
        ) : null}
      </div>

      {loading ? (
        <div className="mt-5 space-y-2.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-md border-2 border-ink bg-sand" />
          ))}
        </div>
      ) : bids.length === 0 ? (
        <div className="mt-5 rounded-md border-2 border-dashed border-ink bg-cream p-10 text-center font-semibold text-muted">
          Dar nėra statymų — būk pirmas! 🚀
        </div>
      ) : (
        <div className="mt-5 space-y-2.5">
          {bids.map((bid, idx) => {
            const isTop = idx === 0;
            return (
              <div
                key={bid.id}
                className={`flex items-center justify-between gap-4 rounded-md border-2 border-ink p-3.5 ${
                  isTop ? 'bg-green text-white' : 'bg-cream'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-md border-2 border-ink font-display text-sm font-extrabold ${
                      isTop ? 'bg-paper text-ink' : 'bg-sand text-ink'
                    }`}
                  >
                    {bid.bidder_name.charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <p className="font-bold">
                      {maskBidder(bid.bidder_name)}
                      {bid.bidder_city ? (
                        <span className={`font-normal ${isTop ? 'text-white/70' : 'text-muted'}`}> · {bid.bidder_city}</span>
                      ) : null}
                    </p>
                    <p className={`text-xs ${isTop ? 'text-white/70' : 'text-muted'}`}>
                      {new Date(bid.created_at).toLocaleString('lt-LT')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {isTop ? (
                    <p className="text-[10px] font-bold uppercase tracking-wide">🏆 Aukščiausias</p>
                  ) : null}
                  <p className="font-display text-lg font-extrabold">{formatEur(bid.amount)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
