import type { Metadata } from "next";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import NewsCard from "../components/NewsCard";
import { getAllPosts } from "../lib/posts";

export const metadata: Metadata = {
  title: "Naujienos ir patarimai apie aukcionus",
  description:
    "Naudingi straipsniai apie internetinius aukcionus: kaip dalyvauti, kaip parduoti už geriausią kainą, saugumas, kainodara ir kolekcionavimas.",
  keywords: [
    "aukcionų naujienos",
    "patarimai aukcionai",
    "kaip dalyvauti aukcione",
    "kaip parduoti aukcione",
    "internetiniai aukcionai",
  ],
  alternates: { canonical: "/naujienos" },
  openGraph: {
    type: "website",
    title: "Naujienos ir patarimai apie aukcionus | Dekaukciona",
    description:
      "Naudingi straipsniai apie internetinius aukcionus: dalyvavimas, pardavimas, saugumas, kainodara ir kolekcionavimas.",
    url: "/naujienos",
  },
};

export default function NewsListPage() {
  const articles = getAllPosts();

  return (
    <main className="flex min-h-screen flex-col bg-cream text-ink">
      <SiteHeader />

      <div className="mx-auto w-full max-w-7xl flex-1 px-5 py-12 lg:px-8 lg:py-16">
        <span className="inline-flex items-center gap-2 rounded-md border-2 border-ink bg-gold px-3 py-1.5 text-[13px] font-bold shadow-chunky-sm">
          📰 Naujienos
        </span>
        <h1 className="mt-5 font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          Patarimai ir naujienos apie aukcionus
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-muted">
          Viskas, ką reikia žinoti norint sėkmingai pirkti ir parduoti aukcione — nuo pirmo
          statymo iki kolekcionavimo paslapčių.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <NewsCard key={article.slug} article={article} />
          ))}
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}
