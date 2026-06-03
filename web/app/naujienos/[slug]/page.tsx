import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { marked } from "marked";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import ShareButtons from "../../components/ShareButtons";
import PostSidebar from "../../components/PostSidebar";
import RelatedPosts from "../../components/RelatedPosts";
import { getAllPosts, getPostBySlug, getRelatedPosts } from "../../lib/posts";

const SITE = "https://dekaukciona.lt";

// Static export: iš anksto sugeneruojam po puslapį kiekvienai naujienai.
export function generateStaticParams() {
  return getAllPosts().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getPostBySlug(slug);
  if (!article) return { title: "Naujiena nerasta" };

  const url = `/naujienos/${article.slug}`;
  return {
    title: article.title,
    description: article.description,
    keywords: article.keywords,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.description,
      url,
      publishedTime: article.date,
      images: [{ url: article.cover, width: 1200, height: 630, alt: article.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.description,
      images: [article.cover],
    },
  };
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("lt-LT", { year: "numeric", month: "long", day: "numeric" });

export default async function NewsArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getPostBySlug(slug);
  if (!article) notFound();

  const related = getRelatedPosts(slug, 6);
  const html = marked.parse(article.body) as string;

  // SEO: Article struktūruoti duomenys (schema.org).
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    image: article.cover,
    datePublished: article.date,
    dateModified: article.date,
    author: { "@type": "Organization", name: "Dekaukciona" },
    publisher: {
      "@type": "Organization",
      name: "Dekaukciona",
      logo: { "@type": "ImageObject", url: `${SITE}/icon.svg` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE}/naujienos/${article.slug}` },
  };

  return (
    <main className="flex min-h-screen flex-col bg-cream text-ink">
      <SiteHeader />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto w-full max-w-7xl flex-1 px-5 py-10 lg:px-8 lg:py-14">
        <Link href="/naujienos" className="text-sm font-bold text-muted hover:text-ink">
          ← Visos naujienos
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-12">
          {/* Pagrindinis turinys */}
          <article className="min-w-0 max-w-3xl">
            <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wide text-muted">
              <span>{formatDate(article.date)}</span>
              <span>·</span>
              <span>{article.readMinutes} min skaitymo</span>
            </div>
            <h1 className="mt-2 font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              {article.title}
            </h1>
            <p className="mt-3 text-lg text-muted">{article.excerpt}</p>

            <div className="mt-7 overflow-hidden rounded-chunk border-[2.5px] border-ink bg-sand shadow-chunky">
              <img src={article.cover} alt={article.title} className="aspect-video w-full object-cover" />
            </div>

            <div
              className="article-body mt-8"
              dangerouslySetInnerHTML={{ __html: html }}
            />

            {/* SEO raktažodžiai kaip žymos */}
            <div className="mt-10 flex flex-wrap gap-2 border-t-2 border-ink/10 pt-6">
              {article.keywords.map((k) => (
                <span key={k} className="rounded-md border-2 border-ink bg-sand px-2.5 py-1 text-xs font-semibold">
                  #{k}
                </span>
              ))}
            </div>

            {/* Dalijimasis */}
            <div className="mt-8 rounded-chunk border-[2.5px] border-ink bg-paper p-5 shadow-chunky-sm">
              <ShareButtons title={article.title} label="Patiko? Pasidalink:" />
            </div>
          </article>

          {/* Šoninė juosta */}
          <PostSidebar related={related} />
        </div>

        {/* Susijusių straipsnių karuselė */}
        <div className="mt-14">
          <RelatedPosts posts={related} />
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}
