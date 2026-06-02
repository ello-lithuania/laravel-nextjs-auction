import type { NextConfig } from "next";

// Origin of the Laravel API and the Reverb websocket, needed in the CSP
// connect-src so the browser is allowed to talk to them. Defaults match the
// local dev setup; override via env in other environments.
const apiOrigin = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";
const reverbScheme = process.env.NEXT_PUBLIC_REVERB_SCHEME ?? "http";
const reverbHost = process.env.NEXT_PUBLIC_REVERB_HOST ?? "127.0.0.1";
const reverbPort = process.env.NEXT_PUBLIC_REVERB_PORT ?? "8080";
const wsScheme = reverbScheme === "https" ? "wss" : "ws";
const reverbHttp = `${reverbScheme}://${reverbHost}:${reverbPort}`;
const reverbWs = `${wsScheme}://${reverbHost}:${reverbPort}`;

const isProd = process.env.NODE_ENV === "production";

// Content-Security-Policy: the main defence-in-depth control against XSS.
// `'unsafe-inline'` for styles is required by Tailwind/Next's injected styles;
// scripts allow `'unsafe-inline'` only in dev (Next's dev runtime needs it) and
// are locked down in production.
const csp = [
  `default-src 'self'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `frame-ancestors 'none'`,
  `object-src 'none'`,
  `img-src 'self' data: blob: https:`,
  `font-src 'self' data:`,
  `style-src 'self' 'unsafe-inline'`,
  isProd
    ? `script-src 'self'`
    : `script-src 'self' 'unsafe-inline' 'unsafe-eval'`,
  `connect-src 'self' ${apiOrigin} ${reverbHttp} ${reverbWs}`,
  ...(isProd ? [`upgrade-insecure-requests`] : []),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // Stop the page being framed (clickjacking); CSP frame-ancestors covers
  // modern browsers, this covers older ones.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // Only meaningful over HTTPS; harmless on http and important once deployed.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  // Drop the framework version banner that advertises the stack to attackers.
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
