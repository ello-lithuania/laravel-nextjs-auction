// SERVER-ONLY. Skaito naujienų straipsnius iš Markdown failų build metu.
// Tas pats šaltinis kaip ir DB seed'inimui: ../api/database/data/posts/*.md
// (DB laiko tuos pačius įrašus dinaminei daliai / ateities admin sąsajai).
//
// Naudoti TIK serverio komponentuose / sitemap. Klientui (home teaser) imk
// duomenis iš API (/api/posts).

import fs from "node:fs";
import path from "node:path";

export type Post = {
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  cover: string;
  excerpt: string;
  readMinutes: number;
  date: string;
  body: string; // Markdown
};

const POSTS_DIR = path.join(process.cwd(), "..", "api", "database", "data", "posts");

function parse(raw: string): Post | null {
  const normalized = raw.replace(/\r\n/g, "\n");
  const match = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/.exec(normalized);
  if (!match) return null;

  const meta: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
    meta[key] = value;
  }

  if (!meta.slug) return null;
  return {
    slug: meta.slug,
    title: meta.title ?? "",
    description: meta.description ?? "",
    keywords: meta.keywords
      ? meta.keywords.split(",").map((k) => k.trim()).filter(Boolean)
      : [],
    cover: meta.cover ?? "",
    excerpt: meta.excerpt ?? "",
    readMinutes: Number(meta.read_minutes ?? 5),
    date: meta.date ?? "",
    body: match[2].trim(),
  };
}

export function getAllPosts(): Post[] {
  let files: string[] = [];
  try {
    files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"));
  } catch {
    return [];
  }
  return files
    .map((f) => parse(fs.readFileSync(path.join(POSTS_DIR, f), "utf8")))
    .filter((p): p is Post => p !== null)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getPostBySlug(slug: string): Post | undefined {
  return getAllPosts().find((p) => p.slug === slug);
}

// Susiję straipsniai „Kažkas jus gali sudominti" karuselei ir sidebar'ui.
// Reitinguojam pagal bendrų raktažodžių kiekį, likusią vietą užpildom naujausiais.
export function getRelatedPosts(slug: string, limit = 6): Omit<Post, "body">[] {
  const all = getAllPosts();
  const current = all.find((p) => p.slug === slug);
  if (!current) return all.slice(0, limit).map(stripBody);

  const own = new Set(current.keywords.map((k) => k.toLowerCase()));
  const scored = all
    .filter((p) => p.slug !== slug)
    .map((p) => ({
      post: p,
      score: p.keywords.reduce((n, k) => n + (own.has(k.toLowerCase()) ? 1 : 0), 0),
    }))
    .sort((a, b) => b.score - a.score || b.post.date.localeCompare(a.post.date));

  return scored.slice(0, limit).map((s) => stripBody(s.post));
}

function stripBody(p: Post): Omit<Post, "body"> {
  const { body: _body, ...rest } = p;
  return rest;
}
