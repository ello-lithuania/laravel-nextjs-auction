import type { NextConfig } from "next";

// This app is exported as a fully static site (`output: 'export'`) so it can be
// served from Hostinger shared hosting (public_html) with no Node.js runtime.
//
// Consequences of static export:
//  - No server-side route handlers / SSR. All data is fetched client-side
//    directly from the Laravel API (NEXT_PUBLIC_API_URL).
//  - next.config `headers()` does NOT apply to a static export, so the security
//    headers (CSP etc.) are set by the web server instead — see
//    `web/public_html.htaccess` (deploy it as public_html/.htaccess).
const nextConfig: NextConfig = {
  output: "export",
  // Emit each route as <route>/index.html so Apache serves clean URLs.
  trailingSlash: true,
  // No Node image optimizer on static hosting (the app uses plain <img> anyway).
  images: { unoptimized: true },
  // Don't advertise the framework.
  poweredByHeader: false,
};

export default nextConfig;
