import Link from "next/link";
import type { Post } from "../lib/posts";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("lt-LT", { year: "numeric", month: "long", day: "numeric" });

// Chunky naujienos kortelė. Be hooks — tinka serverio komponentuose (SEO).
// Priima bent anonsui reikalingus laukus (body neprivalomas).
export default function NewsCard({ article }: { article: Omit<Post, "body"> }) {
  return (
    <Link
      href={`/naujienos/${article.slug}`}
      className="group flex flex-col overflow-hidden rounded-chunk border-[2.5px] border-ink bg-paper shadow-chunky transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-chunky-lg"
    >
      <div className="aspect-video overflow-hidden border-b-[2.5px] border-ink bg-sand">
        <img
          src={article.cover}
          alt={article.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wide text-muted">
          <span>{formatDate(article.date)}</span>
          <span>·</span>
          <span>{article.readMinutes} min skaitymo</span>
        </div>
        <h3 className="mt-2 font-display text-lg font-extrabold leading-tight tracking-tight">
          {article.title}
        </h3>
        <p className="mt-2 flex-1 text-[14px] leading-relaxed text-muted">{article.excerpt}</p>
        <span className="mt-4 inline-flex items-center gap-1.5 font-display text-sm font-bold text-green-deep">
          Skaityti
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </span>
      </div>
    </Link>
  );
}
