"use client";

import { useRef } from "react";
import type { Post } from "../lib/posts";
import NewsCard from "./NewsCard";

// „Kažkas jus gali sudominti" — horizontali susijusių straipsnių karuselė
// single post puslapio apačioje. Scroll-snap + chunky strėlytės.
export default function RelatedPosts({
  posts,
  title = "Kažkas jus gali sudominti",
}: {
  posts: Omit<Post, "body">[];
  title?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  if (posts.length === 0) return null;

  const scrollBy = (dir: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>("[data-card]");
    const amount = card ? card.offsetWidth + 24 : track.clientWidth * 0.9;
    track.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  return (
    <section className="border-t-2 border-ink/10 pt-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-2 rounded-md border-2 border-ink bg-green px-3 py-1 text-[12px] font-bold text-white shadow-chunky-sm">
            ✨ Skaityk toliau
          </span>
          <h2 className="mt-3 font-display text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">
            {title}
          </h2>
        </div>

        {/* Strėlytės — paslepiam mobile (ten scroll'inama pirštu) */}
        <div className="hidden shrink-0 gap-2 sm:flex">
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            aria-label="Ankstesni"
            className="press flex h-11 w-11 items-center justify-center rounded-md border-2 border-ink bg-paper shadow-chunky-sm"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => scrollBy(1)}
            aria-label="Kiti"
            className="press flex h-11 w-11 items-center justify-center rounded-md border-2 border-ink bg-paper shadow-chunky-sm"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        className="news-carousel mt-6 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4"
      >
        {posts.map((post) => (
          <div
            key={post.slug}
            data-card
            className="w-[280px] shrink-0 snap-start sm:w-[320px]"
          >
            <NewsCard article={post} />
          </div>
        ))}
      </div>
    </section>
  );
}
