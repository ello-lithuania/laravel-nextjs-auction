import Link from "next/link";
import type { Post } from "../lib/posts";
import type { Heading } from "../lib/article";
import TableOfContents from "./TableOfContents";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("lt-LT", { year: "numeric", month: "long", day: "numeric" });

// Single post šoninė juosta (desktop). Sticky. Turinys + CTA + „Populiaru" sąrašas.
// Be hooks — tinka serverio komponentui (TOC pats yra klientinis).
export default function PostSidebar({
  related,
  headings = [],
}: {
  related: Omit<Post, "body">[];
  headings?: Heading[];
}) {
  return (
    <aside className="flex flex-col gap-6 lg:sticky lg:top-24">
      {/* Turinys (scroll-spy) — paslepiam mobile, ten jis netinka sticky */}
      <div className="hidden lg:block">
        <TableOfContents headings={headings} />
      </div>

      {/* CTA — parduok savo daiktą */}
      <div className="rounded-chunk border-[2.5px] border-ink bg-green p-5 text-white shadow-chunky">
        <span className="text-[28px] leading-none">🔨</span>
        <h3 className="mt-2 font-display text-xl font-extrabold leading-tight">
          Turi ką parduoti?
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-white/90">
          Įkelk daiktą į aukcioną nemokamai — be komisinių. Tegul pirkėjai kovoja dėl tavo kainos.
        </p>
        <Link
          href="/skelbti"
          className="press mt-4 inline-flex items-center gap-1.5 rounded-md border-2 border-ink bg-gold px-4 py-2 font-display text-sm font-bold text-ink shadow-chunky-sm"
        >
          Įkelti skelbimą
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
      </div>

      {/* Populiarios / susijusios naujienos */}
      {related.length > 0 && (
        <div className="rounded-chunk border-[2.5px] border-ink bg-paper p-5 shadow-chunky-sm">
          <h3 className="font-display text-lg font-extrabold leading-tight tracking-tight">
            Skaityk taip pat
          </h3>
          <ul className="mt-3 flex flex-col divide-y-2 divide-ink/10">
            {related.slice(0, 4).map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/naujienos/${post.slug}`}
                  className="group flex gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className="h-14 w-16 shrink-0 overflow-hidden rounded-md border-2 border-ink bg-sand">
                    <img
                      src={post.cover}
                      alt={post.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-display text-[14px] font-bold leading-snug tracking-tight group-hover:text-green-deep">
                      {post.title}
                    </h4>
                    <span className="mt-1 block text-[11px] font-semibold uppercase tracking-wide text-muted">
                      {formatDate(post.date)}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}
