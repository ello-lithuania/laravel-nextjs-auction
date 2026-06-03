import type { MetadataRoute } from "next";
import { getAllPosts } from "./lib/posts";

// Generated as a static /sitemap.xml in the `output: export` build. Auction
// detail pages share a single client-rendered route (/auction?slug=...), so the
// individual auctions aren't enumerable here; every other public page plus each
// news article is listed.
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://dekaukciona.lt";

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
    { url: `${base}/auction/`, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/naujienos/`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/kontaktai/`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/privatumo-politika/`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/account/`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/login/`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/register/`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${base}/forgot-password/`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/reset-password/`, changeFrequency: "yearly", priority: 0.1 },
  ];

  const newsPages: MetadataRoute.Sitemap = getAllPosts().map((a) => ({
    url: `${base}/naujienos/${a.slug}`,
    lastModified: a.date,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticPages, ...newsPages];
}
