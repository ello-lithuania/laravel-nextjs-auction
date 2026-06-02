'use client';

export interface Bid {
  id: number;
  amount: number;
  bidder_name: string;
  bidder_city?: string | null;
  created_at: string;
}

const formatPrice = (value: number | string) =>
  new Intl.NumberFormat('lt-LT', { style: 'currency', currency: 'EUR' }).format(Number(value));

export default function BidsList({ bids, loading }: { bids: Bid[]; loading: boolean }) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Aktyvumas</p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-950">Paskutiniai pasiūlymai</h3>
        </div>
        {!loading && bids.length > 0 ? (
          <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
            {bids.length} {bids.length === 1 ? 'pasiūlymas' : 'pasiūlymai'}
          </span>
        ) : null}
      </div>

      {loading ? (
        <div className="mt-6 space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-3xl bg-slate-100" />
          ))}
        </div>
      ) : bids.length === 0 ? (
        <div className="mt-6 rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-slate-500">
          Dar nėra pasiūlymų — būk pirmas!
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {bids.map((bid, idx) => {
            const isTop = idx === 0;
            return (
              <div
                key={bid.id}
                className={`flex items-center justify-between gap-4 rounded-3xl border p-4 transition ${
                  isTop
                    ? 'border-sky-200 bg-sky-50'
                    : 'border-slate-200 bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-semibold ${
                    isTop ? 'bg-sky-500 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {bid.bidder_name.charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900">
                      {bid.bidder_name}
                      {bid.bidder_city ? <span className="font-normal text-slate-400"> · {bid.bidder_city}</span> : null}
                    </p>
                    <p className="text-xs text-slate-500">{new Date(bid.created_at).toLocaleString('lt-LT')}</p>
                  </div>
                </div>
                <div className="text-right">
                  {isTop ? (
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-sky-600">Aukščiausias</p>
                  ) : null}
                  <p className="text-lg font-semibold text-slate-950">{formatPrice(bid.amount)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
