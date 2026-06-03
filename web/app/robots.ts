import type { MetadataRoute } from "next";

// Generated as a static /robots.txt in the `output: export` build.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://dekaukciona.lt/sitemap.xml",
    host: "https://dekaukciona.lt",
  };
}
